import { useState, useCallback, useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { ChatMessage } from '../types/chat.types';
import { SOCKET_CONFIG, SOCKET_EVENTS } from '../config/constants';

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

  useEffect(() => {
    const socket = getSocket();
    
    if (socket) {
      setIsConnected(socket.connected);

      const handleConnect = () => {
        console.log('✅ Chat: Socket conectado');
        setIsConnected(true);
      };

      const handleDisconnect = () => {
        console.log('❌ Chat: Socket desconectado');
        setIsConnected(false);
      };

      socket.on(SOCKET_CONFIG.EVENTS.CONNECT, handleConnect);
      socket.on(SOCKET_CONFIG.EVENTS.DISCONNECT, handleDisconnect);

      return () => {
        socket.off(SOCKET_CONFIG.EVENTS.CONNECT, handleConnect);
        socket.off(SOCKET_CONFIG.EVENTS.DISCONNECT, handleDisconnect);
      };
    }
  }, []);

  interface IncomingChatMsg {
    id?: string;
    userId?: string;
    user?: string;
    userName?: string;
    username?: string;
    message?: string;
    timestamp?: string;
    created_at?: string;
    avatar_color?: string;
  }

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
    
    if (!socket || !socket.connected) {
      console.error('❌ Socket no conectado. No se puede enviar mensaje.');
      return;
    }

    // Backend espera: { code, message }
    const messagePayload = {
      code: roomCode,
      message: messageText,
    };

    console.log('📤 Enviando mensaje:', messagePayload);

    // Emitir mensaje al servidor (backend usa ROOM_CHAT)
    socket.emit(SOCKET_EVENTS.ROOM_CHAT, messagePayload, (response?: { 
      ok: boolean; 
      message?: string;
    }) => {
      if (response?.ok) {
        console.log('✅ Mensaje enviado exitosamente');
        // El mensaje llegará via evento 'room:chat:new' del servidor
      } else {
        console.error('❌ Error al enviar mensaje:', response?.message || 'Sin respuesta del servidor');
      }
    });
  }, []);

  const loadChatHistory = useCallback((roomCode: string) => {
    const socket = getSocket();
    
    if (!socket || !socket.connected) {
      console.warn('Socket no conectado, no se puede cargar historial');
      return;
    }

    // Solicitar reconexión para obtener historial
    socket.emit(SOCKET_EVENTS.ROOM_RECONNECT, { code: roomCode }, (response?: {
      ok: boolean;
      room?: { chatHistory: IncomingChatMsg[] };
      message?: string;
    }) => {
      if (response?.ok && response.room?.chatHistory) {
        console.log('📜 Cargando historial de chat:', response.room.chatHistory);

        // Transformar mensajes del backend al formato del frontend (ChatMessage)
        const transformedMessages: ChatMessage[] = response.room.chatHistory.map((msg) => {
          const created_at = msg.created_at || msg.timestamp || new Date().toISOString();
          return {
            id: msg.id || `${msg.userId}-${created_at}`,
            player_id: msg.userId || '',
            username: msg.user || msg.userName || msg.username || 'Usuario',
            message: msg.message || '',
            created_at,
            avatar_color: msg.avatar_color || ''
          };
        });

        setMessages(transformedMessages);
      } else {
        console.warn('No se pudo cargar el historial:', response?.message);
      }
    });
  }, []);

  return {
    messages,
    addMessage,
    clearMessages,
    sendMessage,
    isConnected,
    loadChatHistory
  };
};