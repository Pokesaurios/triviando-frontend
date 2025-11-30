import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../../config/endpoints';
import type {
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  GetRoomResponse,
} from '../../types/room.types';
import { BackendRoomRaw } from '../../types/backend.types';
import { normalizeRoom } from '../api/normalizers';

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

    // normalizar la propiedad `room` si viene en formato crudo
    const rawRoom = (response.data && (response.data as any).room) as BackendRoomRaw | undefined;
    if (rawRoom) {
      const normalized = normalizeRoom(rawRoom);
      return { ...response.data!, room: normalized } as any;
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

    const rawRoom = (response.data && (response.data as any).room) as BackendRoomRaw | undefined;
    if (rawRoom) {
      const normalized = normalizeRoom(rawRoom);
      return { ...response.data!, room: normalized } as any;
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

    const roomRaw = response.data!.room as any as BackendRoomRaw;
    if (roomRaw) {
      // Attempt to normalize; if normalization fails, fall back to raw room object
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      try { return normalizeRoom(roomRaw); } catch (error_) { /* fallback abajo */ }
    }
    return response.data!.room;
  },
};