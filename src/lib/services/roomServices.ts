import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../../config/endpoints';
import type {
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  GetRoomResponse,
} from '../../types/room.types';

export const roomServices = {
  createRoom: async (data: CreateRoomRequest) => {
    const response = await apiClient.post<CreateRoomResponse>(
      API_ENDPOINTS.ROOMS.CREATE,
      data,
      { requiresAuth: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Error al crear la sala');
    }

    return response.data!;
  },

  joinRoom: async (data: JoinRoomRequest) => {
    const response = await apiClient.post<JoinRoomResponse>(
      API_ENDPOINTS.ROOMS.JOIN,
      data,
      { requiresAuth: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Error al unirse a la sala');
    }

    return response.data!;
  },

  getRoomByCode: async (code: string) => {
    const response = await apiClient.get<GetRoomResponse>(
      API_ENDPOINTS.ROOMS.GET_BY_CODE(code),
      { requiresAuth: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Error al obtener la sala');
    }

    return response.data!.room;
  },
};