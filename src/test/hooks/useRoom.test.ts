import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreateRoom, useJoinRoom, useRoom, ROOM_KEYS } from '../../hooks/useRoom';
import { roomServices } from '../../lib/services/roomServices';
import type { Room } from '../../types/room.types';

vi.mock('../../lib/services/roomServices', () => ({
  roomServices: {
    createRoom: vi.fn(),
    joinRoom: vi.fn(),
    getRoomByCode: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ROOM_KEYS', () => {
    it('should generate the keys correctly', () => {
      expect(ROOM_KEYS.all).toEqual(['rooms']);
      expect(ROOM_KEYS.byCode('ABC123')).toEqual(['rooms', 'ABC123']);
    });
  });

  describe('useCreateRoom', () => {
    it('should be able to create a room successfully', async () => {
      const mockRoom: Room = {
        code: 'ABC123',
        roomId: 'room-1',
        hostId: 'user-1',
        status: 'waiting',
        players: [],
      };

      const mockResponse = {
        ok: true,
        room: mockRoom,
      };

      vi.mocked(roomServices.createRoom).mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateRoom(), { wrapper });

      result.current.mutate({
        topic: 'Historia',
        maxPlayers: 4,
        quantity: 10,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(roomServices.createRoom).toHaveBeenCalledWith({
        topic: 'Historia',
        maxPlayers: 4,
        quantity: 10,
      });
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle errors when creating a room', async () => {
      vi.mocked(roomServices.createRoom).mockRejectedValue(
        new Error('Error al crear la sala')
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateRoom(), { wrapper });

      result.current.mutate({
        topic: 'Historia',
        maxPlayers: 4,
        quantity: 10,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Error al crear la sala'));
    });

    it('should invalidate queries upon successful room creation', async () => {
      const mockRoom: Room = {
        code: 'ABC123',
        roomId: 'room-1',
        players: [],
      };

      const mockResponse = {
        ok: true,
        room: mockRoom,
      };

      vi.mocked(roomServices.createRoom).mockResolvedValue(mockResponse);

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        React.createElement(QueryClientProvider, { client: queryClient }, children)
      );

      const { result } = renderHook(() => useCreateRoom(), { wrapper });

      result.current.mutate({
        topic: 'Historia',
        maxPlayers: 4,
        quantity: 10,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ROOM_KEYS.all });
      expect(setQueryDataSpy).toHaveBeenCalledWith(
        ROOM_KEYS.byCode('ABC123'),
        mockRoom
      );
    });
  });

  describe('useJoinRoom', () => {
    it('should be able to join a room successfully', async () => {
      const mockRoom: Room = {
        code: 'ABC123',
        roomId: 'room-1',
        players: [{ userId: 'user-1', name: 'Player 1', joinedAt: new Date() }],
      };

      const mockResponse = {
        ok: true,
        room: mockRoom,
      };

      vi.mocked(roomServices.joinRoom).mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useJoinRoom(), { wrapper });

      result.current.mutate({ code: 'ABC123' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(roomServices.joinRoom).toHaveBeenCalledWith({ code: 'ABC123' });
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle errors when joining a room', async () => {
      vi.mocked(roomServices.joinRoom).mockRejectedValue(
        new Error('Error al unirse a la sala')
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useJoinRoom(), { wrapper });

      result.current.mutate({ code: 'ABC123' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Error al unirse a la sala'));
    });

    it('should update your cache upon successful joining', async () => {
      const mockRoom: Room = {
        code: 'ABC123',
        roomId: 'room-1',
        players: [],
      };

      const mockResponse = {
        ok: true,
        room: mockRoom,
      };

      vi.mocked(roomServices.joinRoom).mockResolvedValue(mockResponse);

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });
      const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        React.createElement(QueryClientProvider, { client: queryClient }, children)
      );

      const { result } = renderHook(() => useJoinRoom(), { wrapper });

      result.current.mutate({ code: 'ABC123' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(setQueryDataSpy).toHaveBeenCalledWith(
        ROOM_KEYS.byCode('ABC123'),
        mockRoom
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ROOM_KEYS.all });
    });
  });

  describe('useRoom', () => {
    it('should get a room by code', async () => {
      const mockRoom: Room = {
        code: 'ABC123',
        roomId: 'room-1',
        status: 'waiting',
        players: [],
      };

      vi.mocked(roomServices.getRoomByCode).mockResolvedValue(mockRoom);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRoom('ABC123'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(roomServices.getRoomByCode).toHaveBeenCalledWith('ABC123');
      expect(result.current.data).toEqual(mockRoom);
    });

    it('should not execute query when enabled is false', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRoom('ABC123', false), { wrapper });

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(roomServices.getRoomByCode).not.toHaveBeenCalled();
    });

    it('should not execute the query when the code is empty', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRoom('', true), { wrapper });

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(roomServices.getRoomByCode).not.toHaveBeenCalled();
    });

    it('should refetch every 10s when status is waiting and socket is disconnected', async () => {
      const mockRoom: Room = {
        code: 'ABC123',
        roomId: 'room-1',
        status: 'waiting',
        players: [],
      };

      vi.mocked(roomServices.getRoomByCode).mockResolvedValue(mockRoom);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useRoom('ABC123', true, false),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const queryState = result.current;
      expect(queryState.data?.status).toBe('waiting');
    });

    it('should not refetch when the socket is connected', async () => {
      const mockRoom: Room = {
        code: 'ABC123',
        roomId: 'room-1',
        status: 'waiting',
        players: [],
      };

      vi.mocked(roomServices.getRoomByCode).mockResolvedValue(mockRoom);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useRoom('ABC123', true, true),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockRoom);
    });

    it('should not refetch when status is not waiting', async () => {
      const mockRoom: Room = {
        code: 'ABC123',
        roomId: 'room-1',
        status: 'playing',
        players: [],
      };

      vi.mocked(roomServices.getRoomByCode).mockResolvedValue(mockRoom);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useRoom('ABC123', true, false),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.status).toBe('playing');
    });

    it('should handle errors when obtaining a room', async () => {
      vi.mocked(roomServices.getRoomByCode).mockRejectedValue(
        new Error('Error al obtener la sala')
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRoom('ABC123'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Error al obtener la sala'));
    });
  });
});