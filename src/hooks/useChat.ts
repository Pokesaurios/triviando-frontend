import { useState, useCallback, useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { ChatMessage } from '../types/chat.types';

interface UseChatReturn {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  sendMessage: (messageText: string, roomCode: string, userId: string, userName: string) => void;
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
      
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, []);

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

  const sendMessage = useCallback((
    messageText: string, 
    roomCode: string, 
    userId: string, 
    userName: string
  ) => {
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
    
    // Emitir mensaje al servidor (backend usa 'room:chat')
    socket.emit('room:chat', messagePayload, (response?: { 
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
    socket.emit('room:reconnect', { code: roomCode }, (response?: {
      ok: boolean;
      room?: { chatHistory: any[] };
      message?: string;
    }) => {
      if (response?.ok && response.room?.chatHistory) {
        console.log('📜 Cargando historial de chat:', response.room.chatHistory);
        
        // Transformar mensajes del backend al formato del frontend
        const transformedMessages: ChatMessage[] = response.room.chatHistory.map((msg: any) => ({
          id: `${msg.userId}-${msg.timestamp}`,
          player_id: msg.userId,
          username: msg.user,
          message: msg.message,
          timestamp: msg.timestamp,
          roomCode: roomCode
        }));
        
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