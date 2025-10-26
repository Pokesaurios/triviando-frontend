import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomServices } from '../lib/services/roomServices';
import type {
  CreateRoomRequest,
  JoinRoomRequest,
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
      // Invalidar queries relacionadas con salas
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.all });
      // Pre-cargar la sala recién creada
      queryClient.setQueryData(ROOM_KEYS.byCode(data.code), data);
    },
  });
};

export const useJoinRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinRoomRequest) => roomServices.joinRoom(data),
    onSuccess: (data) => {
      // Actualizar la sala en cache
      queryClient.setQueryData(ROOM_KEYS.byCode(data.room.code), data.room);
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.all });
    },
  });
};

export const useRoom = (code: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ROOM_KEYS.byCode(code),
    queryFn: () => roomServices.getRoomByCode(code),
    enabled: enabled && !!code,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === 'waiting' ? 3000 : false;
    },
    staleTime: 2000,
  });
};