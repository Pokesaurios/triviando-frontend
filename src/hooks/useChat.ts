import { useState, useCallback, useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { ChatMessage } from '../types/chat.types';
import { SOCKET_CONFIG, SOCKET_EVENTS } from '../config/constants';
import { getAvatarColor } from '../utils/avatar';

interface UseChatReturn {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  sendMessage: (messageText: string, roomCode: string) => void;
  isConnected: boolean;
  loadChatHistory: (roomCode: string) => void;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const transformMessage = useCallback((msg: {
    userId: string;
    user: string;
    message: string;
    timestamp: string | Date;
  }): ChatMessage => {
    return {
      id: `${msg.userId}-${new Date(msg.timestamp).getTime()}`,
      userId: msg.userId,
      user: msg.user,
      message: msg.message,
      timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString(),
      avatarColor: getAvatarColor(msg.userId),
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    
    if (!socket) return;

    setIsConnected(socket.connected);

    const handleConnect = () => {
      console.log('✅ Chat: Socket conectado');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('❌ Chat: Socket desconectado');
      setIsConnected(false);
    };

    // Escuchar nuevos mensajes de chat
    const handleNewMessage = (data: {
      userId: string;
      user: string;
      message: string;
      timestamp: string | Date;
    }) => {
      console.log('📨 Nuevo mensaje recibido:', data);
      const transformedMessage = transformMessage(data);
      addMessage(transformedMessage);
    };

    socket.on(SOCKET_CONFIG.EVENTS.CONNECT, handleConnect);
    socket.on(SOCKET_CONFIG.EVENTS.DISCONNECT, handleDisconnect);
    socket.on(SOCKET_EVENTS.ROOM_CHAT_NEW, handleNewMessage);

    return () => {
      socket.off(SOCKET_CONFIG.EVENTS.CONNECT, handleConnect);
      socket.off(SOCKET_CONFIG.EVENTS.DISCONNECT, handleDisconnect);
      socket.off(SOCKET_EVENTS.ROOM_CHAT_NEW, handleNewMessage);
    };
  }, [transformMessage]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => {
      // Evitar duplicados por ID
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback((messageText: string, roomCode: string) => {
    const socket = getSocket();
    
    if (!socket?.connected) {
      console.error('❌ Socket no conectado. No se puede enviar mensaje.');
      return;
    }

    const messagePayload = {
      code: roomCode,
      message: messageText,
    };

    console.log('📤 Enviando mensaje:', messagePayload);

    socket.emit(SOCKET_EVENTS.ROOM_CHAT, messagePayload, (response?: { 
      ok: boolean; 
      message?: string;
    }) => {
      if (response?.ok) {
        console.log('✅ Mensaje enviado exitosamente');
      } else {
        console.error('❌ Error al enviar mensaje:', response?.message || 'Sin respuesta del servidor');
      }
    });
  }, []);

  const loadChatHistory = useCallback((roomCode: string) => {
    const socket = getSocket();
    
    if (!socket?.connected) {
      console.warn('Socket no conectado, no se puede cargar historial');
      return;
    }

    socket.emit(SOCKET_EVENTS.ROOM_RECONNECT, { code: roomCode }, (response?: {
      ok: boolean;
      room?: { 
        chatHistory: Array<{
          userId: string;
          user: string;
          message: string;
          timestamp: string | Date;
        }>;
      };
      message?: string;
    }) => {
      if (response?.ok && response.room?.chatHistory) {
        console.log('📜 Cargando historial de chat:', response.room.chatHistory.length, 'mensajes');
        
        const transformedMessages = response.room.chatHistory.map(transformMessage);
        setMessages(transformedMessages);
      } else {
        console.warn('No se pudo cargar el historial:', response?.message);
      }
    });
  }, [transformMessage]);

  return {
    messages,
    addMessage,
    clearMessages,
    sendMessage,
    isConnected,
    loadChatHistory
  };
};