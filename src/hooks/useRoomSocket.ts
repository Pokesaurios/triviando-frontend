import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';
import toast from 'react-hot-toast';
import type { Room, Player } from '../types/room.types';
import type { ChatMessage, ChatMessageFromServer } from '../types/chat.types';
import type { BackendPlayerRaw, JoinRoomSocketResponse } from '../types/backend.types';
import { SOCKET_CONFIG, SOCKET_EVENTS } from '../config/constants';

interface RoomUpdateEvent {
  event: 'playerJoined' | 'playerLeft' | 'roomCreated';
  player?: { id: string; name: string };
  // reuse backend raw player shape for updates to keep normalization consistent
  players?: BackendPlayerRaw[];
  userId?: string;
  code?: string;
  roomId?: string;
}

interface UseRoomSocketOptions {
  onNewMessage?: (message: ChatMessage) => void;
  // Optional callback when the players list in the room changes
  onPlayersChanged?: (players: Player[]) => void;
}

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

export const ROOM_KEYS = {
  all: ['rooms'] as const,
  byCode: (code: string) => ['rooms', code] as const,
};

// Función helper para normalizar jugadores -> devuelve `Player` fuerte
const normalizePlayer = (p: BackendPlayerRaw | { userId?: string; _id?: string; name?: string; user?: unknown; joinedAt?: string }) : Player | null => {
  // Intentar obtener el nombre de múltiples fuentes posibles
  let playerName = '';
  if (typeof p.user === 'object' && p.user && 'name' in p.user) {
    playerName = (p.user as { name?: string }).name || playerName;
  } else if (typeof p.user === 'string') {
    playerName = p.user;
  } else if (p.name) {
    playerName = p.name;
  }
  const playerId = (typeof p.userId === 'string' && p.userId) || p._id || (typeof p.user === 'object' && (p.user as { _id?: string })._id) || '';

  if (!playerId) {
    console.warn('normalizePlayer: missing player id, skipping', p);
    return null;
  }

  const joinedAtStr = p.joinedAt ? new Date(p.joinedAt as string).toISOString() : new Date().toISOString();

  // Build a typed Player
  const player: Player = {
    userId: playerId,
    name: playerName || 'Jugador',
    joinedAt: joinedAtStr,
  };

  // Log debug info at verbose level
  console.log('🔍 Normalizando jugador:', { original: p, normalized: player });

  return player;
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
      // Prevenir múltiples llamadas simultáneas
      if (joinedRef.current || isJoiningRef.current) {
        console.log('Ya unido o intentando unirse, saltando...');
        return;
      }

      isJoiningRef.current = true;
  console.log(`🔌 Uniéndose a la sala: ${roomCode}`);
      
      socket.emit(SOCKET_EVENTS.ROOM_JOIN, { code: roomCode }, (response?: JoinRoomSocketResponse) => {
        isJoiningRef.current = false;
        
        if (response?.ok) {
          console.log('✅ Unido a la sala exitosamente');
          console.log('📦 Datos completos de la sala recibidos:', JSON.stringify(response.room, null, 2));
          joinedRef.current = true;
          setJoined(true);
          
          // Cargar historial de chat
          if (response.room?.chatHistory && onNewMessage) {
            response.room.chatHistory.forEach((msg: ChatMessageFromServer) => {
              const created_at = msg.created_at || msg.timestamp || new Date().toISOString();
              const uid = msg.userId || msg.player_id || '';
              const chatMessage: ChatMessage = {
                id: msg.id || `${uid}-${created_at}`,
                player_id: uid,
                username: msg.user || msg.userName || msg.username || 'Usuario',
                message: msg.message || '',
                created_at,
                avatar_color: msg.avatar_color || ''
              };
              onNewMessage(chatMessage);
            });
          }
          
          // Actualizar datos de la sala
          if (response.room) {
            console.log('👥 Jugadores originales del backend:', response.room.players);
            
            const normalizedPlayers = (response.room.players || [])
              .map((pl) => normalizePlayer(pl))
              .filter((p): p is Player => p !== null);

            console.log('✅ Jugadores normalizados:', normalizedPlayers);

            // Call explicit onPlayersChanged callback if provided
            if (typeof onPlayersChanged === 'function') {
              try {
                onPlayersChanged(normalizedPlayers);
              } catch (err) {
                console.warn('onPlayersChanged callback threw', err);
              }
            }

            // Normalize status to expected union
            let status: 'waiting' | 'playing' | 'finished' = 'waiting';
            if (response.room.status === 'in-game' || response.room.status === 'playing') status = 'playing';
            if (response.room.status === 'finished') status = 'finished';

            queryClient.setQueryData<Room>(ROOM_KEYS.byCode(roomCode), {
              code: response.room.code || roomCode,
              roomId: response.room.roomId,
              triviaId: response.room.triviaId || '',
              hostId: response.room.hostId || '',
              maxPlayers: response.room.maxPlayers || 4,
              status,
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

          const normalizedPlayers = data.players
            .map(normalizePlayer)
            .filter((p): p is Player => p !== null);

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
  const handleChatMessage = (message: IncomingChatMsg) => {
      console.log('💬 room:chat:new received:', message);
      
      const created_at = message.created_at || message.timestamp || new Date().toISOString();
      const chatMessage: ChatMessage = {
        id: message.id || `${message.userId}-${created_at}`,
        player_id: message.userId || '',
        username: message.user || message.userName || message.username || 'Usuario',
        message: message.message || '',
        created_at,
        avatar_color: message.avatar_color || ''
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
    socket.on(SOCKET_CONFIG.EVENTS.CONNECT, handleConnect);
    socket.on(SOCKET_CONFIG.EVENTS.DISCONNECT, handleDisconnect);
    socket.on(SOCKET_CONFIG.EVENTS.CONNECT_ERROR, handleConnectError);
    socket.on(SOCKET_EVENTS.ROOM_UPDATE, handleRoomUpdate);
    socket.on(SOCKET_EVENTS.ROOM_CHAT_NEW, handleChatMessage);

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
  socket.off(SOCKET_EVENTS.ROOM_CHAT_NEW, handleChatMessage);
      
      joinedRef.current = false;
      isJoiningRef.current = false;
      setJoined(false);
    };
  }, [roomCode, queryClient, onNewMessage, onPlayersChanged]);

  return { connected, joined };
};