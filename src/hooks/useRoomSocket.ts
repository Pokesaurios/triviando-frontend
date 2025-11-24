import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';
import toast from 'react-hot-toast';
import type { Room, Player } from '../types/room.types';
import type { ChatMessage } from '../types/chat.types';
import { SOCKET_CONFIG, SOCKET_EVENTS } from '../config/constants';

interface RoomJoinResponse {
  ok: boolean;
  room?: {
    code: string;
    players: Player[];
    chatHistory: ChatMessage[];
  };
  message?: string;
  error?: string;
}

interface RoomUpdateEvent {
  event: 'roomCreated' | 'playerJoined' | 'playerLeft';
  code?: string;
  roomId?: string;
  player?: { id: string; name: string };
  players?: Player[];
  userId?: string;
}


interface UseRoomSocketOptions {
  onNewMessage?: (message: ChatMessage) => void;
  onPlayersChanged?: (players: Player[]) => void;
}

export const ROOM_KEYS = {
  all: ['rooms'] as const,
  byCode: (code: string) => ['rooms', code] as const,
};

export const useRoomSocket = (
  roomCode: string | undefined,
  options?: UseRoomSocketOptions
) => {
  const queryClient = useQueryClient();
  const { onNewMessage, onPlayersChanged } = options || {};
  
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
      if (joinedRef.current || isJoiningRef.current) {
        console.log('Ya unido o intentando unirse, saltando...');
        return;
      }

      isJoiningRef.current = true;
      console.log(`🔌 Uniéndose a la sala: ${roomCode}`);
      
      socket.emit(
        SOCKET_EVENTS.ROOM_JOIN,
        { code: roomCode },
        (response?: RoomJoinResponse) => {
          isJoiningRef.current = false;
          
          if (response?.ok && response.room) {
            console.log('✅ Unido a la sala exitosamente');
            console.log('📦 Datos recibidos:', response.room);
            
            joinedRef.current = true;
            setJoined(true);
            
            // Cargar historial de chat (ya viene normalizado)
            if (response.room.chatHistory && onNewMessage) {
              response.room.chatHistory.forEach((msg) => {
                onNewMessage(msg);
              });
            }
            
            // Actualizar jugadores (ya vienen normalizados)
            console.log('👥 Jugadores:', response.room.players);
            
            if (onPlayersChanged) {
              onPlayersChanged(response.room.players);
            }

            // Actualizar cache con los datos tal cual vienen
            queryClient.setQueryData<Room>(ROOM_KEYS.byCode(roomCode), (oldData) => ({
              ...oldData,
              code: response.room!.code,
              players: response.room!.players,
              chatHistory: response.room!.chatHistory,
            }));
          } else {
            console.error('❌ Error al unirse:', response?.message);
            joinedRef.current = false;
            setJoined(false);
            
            toast.error(response?.message || 'Error al unirse a la sala', {
              duration: 4000,
              position: 'top-center',
            });
          }
        }
      );
    };

    // Handler para actualizaciones de sala
    const handleRoomUpdate = (data: RoomUpdateEvent) => {
      console.log('📡 room:update recibido:', data);
      
      queryClient.setQueryData<Room>(ROOM_KEYS.byCode(roomCode), (oldData) => {
        if (!oldData) return oldData;
        
        // Jugador se unió
        if (data.event === 'playerJoined' && data.players) {
          console.log('➕ Actualizando jugadores:', data.players);
          
          if (onPlayersChanged) {
            onPlayersChanged(data.players);
          }
          
          return {
            ...oldData,
            players: data.players,
          };
        }
        
        // Jugador salió
        if (data.event === 'playerLeft' && data.userId) {
          console.log(`➖ Jugador salió: ${data.userId}`);
          
          const updatedPlayers = oldData.players.filter(
            (p) => p.userId !== data.userId
          );
          
          if (onPlayersChanged) {
            onPlayersChanged(updatedPlayers);
          }
          
          return {
            ...oldData,
            players: updatedPlayers,
          };
        }
        
        return oldData;
      });
      
      // Mostrar notificaciones
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (data.event === 'playerJoined' && data.player) {
        if (data.player.id !== currentUser.id) {
          toast.success(`🎮 ${data.player.name} se unió a la sala`, {
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


    // Handler para conexión
    const handleConnect = () => {
      console.log('✅ Socket conectado');
      setConnected(true);
      
      if (!joinedRef.current && !isJoiningRef.current) {
        joinRoom();
      }
    };

    // Handler para desconexión
    const handleDisconnect = (reason: string) => {
      console.log('❌ Socket desconectado:', reason);
      setConnected(false);
      
      if (reason === 'io server disconnect' || reason === 'transport close') {
        joinedRef.current = false;
        setJoined(false);
      }
      
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
    socket.on(SOCKET_CONFIG.EVENTS.CONNECT, handleConnect);
    socket.on(SOCKET_CONFIG.EVENTS.DISCONNECT, handleDisconnect);
    socket.on(SOCKET_CONFIG.EVENTS.CONNECT_ERROR, handleConnectError);
    socket.on(SOCKET_EVENTS.ROOM_UPDATE, handleRoomUpdate);

    // Si el socket ya está conectado, unirse inmediatamente
    if (socket.connected && !joinedRef.current && !isJoiningRef.current) {
      joinRoom();
    }

    return () => {
      console.log(`🔌 Limpiando listeners de la sala: ${roomCode}`);
      
      socket.off(SOCKET_CONFIG.EVENTS.CONNECT, handleConnect);
      socket.off(SOCKET_CONFIG.EVENTS.DISCONNECT, handleDisconnect);
      socket.off(SOCKET_CONFIG.EVENTS.CONNECT_ERROR, handleConnectError);
      socket.off(SOCKET_EVENTS.ROOM_UPDATE, handleRoomUpdate);
      
      joinedRef.current = false;
      isJoiningRef.current = false;
      setJoined(false);
    };
  }, [roomCode, queryClient, onNewMessage, onPlayersChanged]);

  return { connected, joined };
};