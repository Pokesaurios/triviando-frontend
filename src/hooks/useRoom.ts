import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomServices } from '../lib/services/roomServices';
import type {
  CreateRoomRequest,
  JoinRoomRequest,
  Room,
} from '../types/room.types';

export const ROOM_KEYS = {
  all: ['rooms'] as const,
  byCode: (code: string) => ['rooms', code] as const,
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRoomRequest) => roomServices.createRoom(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.all });
      
      const normalizedRoom: Room = {
        ...data,
        players: data.players?.map(p => ({
          userId: p.userId,
          name: p.name || 'Usuario Desconocido',
          joinedAt: p.joinedAt || new Date()
        })) || []
      };
      
      queryClient.setQueryData(ROOM_KEYS.byCode(data.code), normalizedRoom);
    },
  });
};

export const useJoinRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: JoinRoomRequest) => roomServices.joinRoom(data),
    onSuccess: (data) => {
      const normalizedRoom: Room = {
        ...data.room,
        players: data.room.players?.map(p => ({
          userId: p.userId,
          name: p.name || 'Usuario Desconocido',
          joinedAt: p.joinedAt || new Date()
        })) || []
      };
      
      queryClient.setQueryData(ROOM_KEYS.byCode(data.room.code), normalizedRoom);
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.all });
    },
  });
};

export const useRoom = (
  code: string, 
  enabled: boolean = true,
  socketConnected: boolean = false
) => {
  return useQuery({
    queryKey: ROOM_KEYS.byCode(code),
    queryFn: async () => {
      const room = await roomServices.getRoomByCode(code);
            
      const normalizedRoom: Room = {
        ...room,
        players: room.players?.map(p => {
          const playerName = p.name || p.userName || 'Usuario Desconocido';
          const playerUserId = p.userId || p._id;
                    
          return {
            userId: playerUserId,
            name: playerName,
            joinedAt: p.joinedAt || new Date()
          };
        }) || []
      };
      
      console.log('✅ Datos normalizados:', normalizedRoom);
      
      return normalizedRoom;
    },
    enabled: enabled && !!code,
    refetchInterval: (query) => {
      if (socketConnected) {
        return false;
      }
      
      const data = query.state.data;
      return data?.status === 'waiting' ? 10000 : false;
    },
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });
};