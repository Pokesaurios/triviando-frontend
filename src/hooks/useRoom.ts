import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomServices } from '../lib/services/roomServices';
import { DEFAULTS } from '../config/constants';
import type {
  CreateRoomRequest,
  JoinRoomRequest,
  Room
} from '../types/room.types';

export const ROOM_KEYS = {
  all: ['rooms'] as const,
  byCode: (code: string) => ['rooms', code] as const,
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRoomRequest) => roomServices.createRoom(data),
    onSuccess: (response) => {
      if (response.ok && response.room) {
        queryClient.invalidateQueries({ queryKey: ROOM_KEYS.all });
        queryClient.setQueryData(ROOM_KEYS.byCode(response.room.code), response.room);
      }
    },
  });
};

export const useJoinRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: JoinRoomRequest) => roomServices.joinRoom(data),
    onSuccess: (response) => {
      if (response.ok && response.room) {
        queryClient.setQueryData(ROOM_KEYS.byCode(response.room.code), response.room);
        queryClient.invalidateQueries({ queryKey: ROOM_KEYS.all });
      }
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
    queryFn: (): Promise<Room> => roomServices.getRoomByCode(code),
    enabled: enabled && !!code,
    refetchInterval: (query) => {
      if (socketConnected) {
        return false;
      }
      
      const data = query.state.data;
      // Asegurar que status usa valores normalizados
      return data?.status === 'waiting' ? DEFAULTS.ROOM_POLL_INTERVAL_MS : false;
    },
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });
};