import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '../lib/socket';
import toast from 'react-hot-toast';
import { ROOM_KEYS } from './useRoom';
import type { Room } from '../types/room.types';
import { MESSAGES } from '../config/constants';

interface RoomUpdateEvent {
  event: 'playerJoined' | 'playerLeft' | 'roomCreated';
  player?: { id: string; name: string };
  players?: Array<{ userId: string; name: string }>;
  userId?: string;
  code?: string;
  roomId?: string;
}

export const useRoomSocket = (roomCode: string | undefined) => {
  const queryClient = useQueryClient();
  const hasShownJoinToast = useRef(false);

  useEffect(() => {
    if (!roomCode) return;

    // Handler para actualizaciones de sala
    const handleRoomUpdate = (data: RoomUpdateEvent) => {
      console.log('📡 room:update received:', data);

      // Actualizar cache de React Query
      queryClient.setQueryData<Room>(ROOM_KEYS.byCode(roomCode), (oldData) => {
        if (!oldData) return oldData;

        if (data.event === 'playerJoined' && data.players) {
          return {
            ...oldData,
            players: data.players,
          };
        }

        if (data.event === 'playerLeft' && data.userId) {
          return {
            ...oldData,
            players: oldData.players.filter((p) => p.userId !== data.userId),
          };
        }

        return oldData;
      });

      // Mostrar notificaciones con toast
      if (data.event === 'playerJoined' && data.player) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // No mostrar toast si es el usuario actual uniéndose
        if (data.player.id !== currentUser.id) {
          toast.success(`🎮 ${data.player.name} se unió a la sala`, {
            duration: 3000,
            position: 'top-center',
            style: {
              background: '#10b981',
              color: '#fff',
              fontWeight: 'bold',
            },
          });
        }
      }

      if (data.event === 'playerLeft' && data.userId) {
        const room = queryClient.getQueryData<Room>(ROOM_KEYS.byCode(roomCode));
        const leftPlayer = room?.players.find((p) => p.userId === data.userId);
        
        if (leftPlayer) {
          toast.error(`👋 ${leftPlayer.name} salió de la sala`, {
            duration: 3000,
            position: 'top-center',
            style: {
              background: '#ef4444',
              color: '#fff',
              fontWeight: 'bold',
            },
          });
        }
      }
    };

    // Handler para errores de conexión
    const handleConnectError = (error: Error) => {
      console.error(MESSAGES.SOCKET_ERROR, error);
      toast.error(MESSAGES.CONNECTION_ERROR, {
        duration: 4000,
        position: 'top-center',
      });
    };

    // Handler para reconexión
    const handleReconnect = () => {
      console.log(MESSAGES.SOCKET_CONNECTED, socket.id);
      toast.success('Conexión restaurada', {
        duration: 2000,
        position: 'top-center',
      });
    };

    // Suscribirse a los eventos
    socket.on('room:update', handleRoomUpdate);
    socket.on('connect_error', handleConnectError);
    socket.on('connect', handleReconnect);

    // Cleanup - remover todos los listeners
    return () => {
      socket.off('room:update', handleRoomUpdate);
      socket.off('connect_error', handleConnectError);
      socket.off('connect', handleReconnect);
    };
  }, [roomCode, queryClient]);

  return null;
};