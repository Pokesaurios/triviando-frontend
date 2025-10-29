import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';
import toast from 'react-hot-toast';
import type { Room } from '../types/room.types';
import type { ChatMessage } from '../types/chat.types';

interface RoomUpdateEvent {
  event: 'playerJoined' | 'playerLeft' | 'roomCreated';
  player?: { id: string; name: string };
  players?: Array<{ userId: string; name: string }>;
  userId?: string;
  code?: string;
  roomId?: string;
}

interface UseRoomSocketOptions {
  onNewMessage?: (message: ChatMessage) => void;
}

export const ROOM_KEYS = {
  all: ['rooms'] as const,
  byCode: (code: string) => ['rooms', code] as const,
};

// Función helper para normalizar jugadores
const normalizePlayer = (p: any) => {
  // Intentar obtener el nombre de múltiples fuentes posibles
  const playerName = p.name || p.userName || p.username || p.user || 'Usuario Desconocido';
  const playerId = p.userId || p.id || p._id;
  
  console.log('🔍 Normalizando jugador:', { original: p, normalized: { userId: playerId, name: playerName } });
  
  return {
    userId: playerId,
    name: playerName,
    joinedAt: p.joinedAt || new Date()
  };
};

export const useRoomSocket = (
  roomCode: string | undefined,
  options?: UseRoomSocketOptions
) => {
  const queryClient = useQueryClient();
  const { onNewMessage } = options || {};
  
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  
  const joinedRef = useRef(false);
  const isJoiningRef = useRef(false);

  useEffect(() => {
    if (!roomCode) return;

    const socket = getSocket();
    if (!socket) {
      console.warn('Socket no disponible');
      return;
    }

    const joinRoom = () => {
      // Prevenir múltiples llamadas simultáneas
      if (joinedRef.current || isJoiningRef.current) {
        console.log('Ya unido o intentando unirse, saltando...');
        return;
      }

      isJoiningRef.current = true;
      console.log(`🔌 Uniéndose a la sala: ${roomCode}`);
      
      socket.emit('room:join', { code: roomCode }, (response?: { 
        ok: boolean; 
        message?: string;
        room?: any;
      }) => {
        isJoiningRef.current = false;
        
        if (response?.ok) {
          console.log('✅ Unido a la sala exitosamente');
          console.log('📦 Datos completos de la sala recibidos:', JSON.stringify(response.room, null, 2));
          joinedRef.current = true;
          setJoined(true);
          
          // Cargar historial de chat
          if (response.room?.chatHistory && onNewMessage) {
            response.room.chatHistory.forEach((msg: any) => {
              const chatMessage: ChatMessage = {
                id: `${msg.userId}-${msg.timestamp}`,
                player_id: msg.userId,
                username: msg.user || msg.userName || msg.username || 'Usuario',
                message: msg.message,
                timestamp: msg.timestamp,
                roomCode: roomCode
              };
              onNewMessage(chatMessage);
            });
          }
          
          // Actualizar datos de la sala
          if (response.room) {
            console.log('👥 Jugadores originales del backend:', response.room.players);
            
            const normalizedPlayers = response.room.players.map(normalizePlayer);
            
            console.log('✅ Jugadores normalizados:', normalizedPlayers);
            
            queryClient.setQueryData<Room>(ROOM_KEYS.byCode(roomCode), {
              code: response.room.code || roomCode,
              roomId: response.room.roomId,
              triviaId: response.room.triviaId,
              hostId: response.room.hostId,
              maxPlayers: response.room.maxPlayers || 4,
              status: response.room.status || 'waiting',
              players: normalizedPlayers,
              createdAt: response.room.createdAt || new Date().toISOString(),
              updatedAt: response.room.updatedAt || new Date().toISOString(),
            });
          }
        } else {
          console.error('❌ Error al unirse:', response?.message);
          joinedRef.current = false;
          setJoined(false);
          
          toast.error(response?.message || 'Error al unirse a la sala', {
            duration: 4000,
            position: 'top-center',
          });
        }
      });
    };

    // Handler para actualizaciones de sala
    const handleRoomUpdate = (data: RoomUpdateEvent) => {
      console.log('📡 room:update received:', JSON.stringify(data, null, 2));
      
      queryClient.setQueryData<Room>(ROOM_KEYS.byCode(roomCode), (oldData) => {
        if (!oldData) return oldData;
        
        if (data.event === 'playerJoined' && data.players) {
          console.log('➕ Actualizando lista de jugadores (playerJoined):', data.players);
          
          const normalizedPlayers = data.players.map(normalizePlayer);
          
          console.log('✅ Jugadores normalizados (playerJoined):', normalizedPlayers);
          
          return {
            ...oldData,
            players: normalizedPlayers
          };
        }
        
        if (data.event === 'playerLeft' && data.userId) {
          console.log(`➖ Jugador salió: ${data.userId}`);
          
          return {
            ...oldData,
            players: oldData.players.filter((p) => p.userId !== data.userId)
          };
        }
        
        return oldData;
      });
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (data.event === 'playerJoined' && data.player) {
        const playerName = data.player.name || 'Usuario';
        
        if (data.player.id !== currentUser.id) {
          toast.success(`🎮 ${playerName} se unió a la sala`, {
            duration: 3000,
            position: 'top-center',
          });
        }
      }
      
      if (data.event === 'playerLeft' && data.userId) {
        const room = queryClient.getQueryData<Room>(ROOM_KEYS.byCode(roomCode));
        const leftPlayer = room?.players.find((p) => p.userId === data.userId);
        
        if (leftPlayer && leftPlayer.userId !== currentUser.id) {
          toast.error(`👋 ${leftPlayer.name} salió de la sala`, {
            duration: 3000,
            position: 'top-center',
          });
        }
      }
    };

    // Handler para mensajes de chat
    const handleChatMessage = (message: any) => {
      console.log('💬 room:chat:new received:', message);
      
      const chatMessage: ChatMessage = {
        id: `${message.userId}-${message.timestamp}`,
        player_id: message.userId,
        username: message.user || message.userName || message.username || 'Usuario',
        message: message.message,
        timestamp: message.timestamp,
        roomCode: roomCode
      };
      
      if (onNewMessage) {
        onNewMessage(chatMessage);
      }
      
      // Toast para mensajes de otros usuarios
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (message.userId !== currentUser.id) {
        toast(`${chatMessage.username}: ${message.message}`, {
          duration: 3000,
          position: 'bottom-right',
          icon: '💬',
        });
      }
    };

    // Handler para conexión
    const handleConnect = () => {
      console.log('✅ Socket conectado');
      setConnected(true);
      
      // Solo unirse si no estamos unidos ya
      if (!joinedRef.current && !isJoiningRef.current) {
        joinRoom();
      }
    };

    // Handler para desconexión
    const handleDisconnect = (reason: string) => {
      console.log('❌ Socket desconectado:', reason);
      setConnected(false);
      
      // Resetear estado de unión solo si fue desconexión del servidor
      if (reason === 'io server disconnect' || reason === 'transport close') {
        joinedRef.current = false;
        setJoined(false);
      }
      
      // Solo mostrar toast si no fue desconexión intencional
      if (reason !== 'io client disconnect') {
        toast.error('Conexión perdida. Reconectando...', {
          duration: 3000,
          position: 'top-center',
        });
      }
    };

    // Handler para errores de conexión
    const handleConnectError = (error: Error) => {
      console.error('❌ Error de conexión socket:', error);
      setConnected(false);
    };

    // Suscribirse a eventos
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('room:update', handleRoomUpdate);
    socket.on('room:chat:new', handleChatMessage);

    // Si el socket ya está conectado, unirse inmediatamente
    if (socket.connected && !joinedRef.current && !isJoiningRef.current) {
      joinRoom();
    }

    return () => {
      console.log(`🔌 Limpiando listeners de la sala: ${roomCode}`);
      
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('room:update', handleRoomUpdate);
      socket.off('room:chat:new', handleChatMessage);
      
      joinedRef.current = false;
      isJoiningRef.current = false;
      setJoined(false);
    };
  }, [roomCode, queryClient, onNewMessage]);

  return { connected, joined };
};