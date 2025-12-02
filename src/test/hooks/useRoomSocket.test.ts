import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useRoomSocket, ROOM_KEYS } from '../../hooks/useRoomSocket';
import * as socketModule from '../../lib/socket';
import toast from 'react-hot-toast';
import type { Socket } from 'socket.io-client';

vi.mock('../../lib/socket');
vi.mock('react-hot-toast');

describe('useRoomSocket', () => {
  let mockSocket: any;
  let queryClient: QueryClient;

  beforeEach(() => {
    mockSocket = {
      connected: false,
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      onAny: vi.fn(),
    };

    vi.spyOn(socketModule, 'getSocket').mockReturnValue(mockSocket as Socket);
    const mockUser = { id: 'user-123', name: 'Test User' };
    Storage.prototype.getItem = vi.fn(() => JSON.stringify(mockUser));

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: any }) => 
    createElement(QueryClientProvider, { client: queryClient }, children);

  describe('Inicialización', () => {
    it('should return correct initial states', () => {
      const { result } = renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      expect(result.current.connected).toBe(false);
      expect(result.current.joined).toBe(false);
    });

    it('should not do anything if roomCode is undefined', () => {
      renderHook(() => useRoomSocket(undefined), { wrapper });

      expect(mockSocket.on).not.toHaveBeenCalled();
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should display a warning if the socket is unavailable', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(socketModule, 'getSocket').mockReturnValue(null);

      renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      expect(consoleWarn).toHaveBeenCalledWith('Socket no disponible');
    });
  });

  describe('Connection and Join', () => {
    it('should subscribe to socket events', () => {
      renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('room:update', expect.any(Function));
    });

    it('should join the room when the socket is connected', () => {
      mockSocket.connected = true;

      renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'room:join',
        { code: 'ROOM123' },
        expect.any(Function)
      );
    });

    it('should update its status when it connects successfully', async () => {
      const { result } = renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      // Simular evento de conexión
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )?.[1];

      connectHandler?.();

      await waitFor(() => {
        expect(result.current.connected).toBe(true);
      });
    });

    it('should be able to join the room successfully with complete information', async () => {
      const mockResponse = {
        ok: true,
        room: {
          code: 'ROOM123',
          players: [
            { userId: 'user-1', name: 'Player 1', joinedAt: '2024-01-01' },
            { userId: 'user-2', name: 'Player 2', joinedAt: '2024-01-01' },
          ],
          chatHistory: [
            {
              id: 'msg-1',
              userId: 'user-1',
              user: 'Player 1',
              message: 'Hola',
              timestamp: '2024-01-01T10:00:00Z',
            },
          ],
        },
      };

      const onNewMessage = vi.fn();
      const onPlayersChanged = vi.fn();

      mockSocket.emit.mockImplementation((event: string, data: any, callback: any) => {
        if (event === 'room:join') {
          callback(mockResponse);
        }
      });

      mockSocket.connected = true;

      const { result } = renderHook(
        () => useRoomSocket('ROOM123', { onNewMessage, onPlayersChanged }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.joined).toBe(true);
      });

      expect(onNewMessage).toHaveBeenCalledWith(mockResponse.room.chatHistory[0]);
      expect(onPlayersChanged).toHaveBeenCalled();
    });

    it('should handle errors when joining the room', async () => {
      const mockResponse = {
        ok: false,
        message: 'Sala no encontrada',
      };

      mockSocket.emit.mockImplementation((event: string, data: any, callback: any) => {
        if (event === 'room:join') {
          callback(mockResponse);
        }
      });

      mockSocket.connected = true;

      const { result } = renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Sala no encontrada', {
          duration: 4000,
          position: 'top-center',
        });
      });

      expect(result.current.joined).toBe(false);
    });
  });

  describe('Room Updates', () => {
    it('should handle playerJoined event', async () => {
      const onPlayersChanged = vi.fn();
      mockSocket.connected = true;

      renderHook(() => useRoomSocket('ROOM123', { onPlayersChanged }), { wrapper });

      // Obtener handler de room:update
      const roomUpdateHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'room:update'
      )?.[1];

      const updateEvent = {
        event: 'playerJoined',
        player: { id: 'user-new', name: 'Nuevo Jugador' },
        players: [
          { userId: 'user-1', name: 'Player 1', joinedAt: '2024-01-01' },
          { userId: 'user-new', name: 'Nuevo Jugador', joinedAt: '2024-01-01' },
        ],
      };

      // Establecer datos iniciales en caché
      queryClient.setQueryData(ROOM_KEYS.byCode('ROOM123'), {
        code: 'ROOM123',
        players: [{ userId: 'user-1', name: 'Player 1', joinedAt: '2024-01-01' }],
      });

      roomUpdateHandler?.(updateEvent);

      await waitFor(() => {
        expect(onPlayersChanged).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(
          '🎮 Nuevo Jugador se unió a la sala',
          expect.any(Object)
        );
      });
    });

    it('should handle playerLeft event', async () => {
      const onPlayersChanged = vi.fn();
      mockSocket.connected = true;

      renderHook(() => useRoomSocket('ROOM123', { onPlayersChanged }), { wrapper });

      const roomUpdateHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'room:update'
      )?.[1];

      // Datos iniciales
      queryClient.setQueryData(ROOM_KEYS.byCode('ROOM123'), {
        code: 'ROOM123',
        players: [
          { userId: 'user-1', name: 'Player 1', joinedAt: '2024-01-01' },
          { userId: 'user-2', name: 'Player 2', joinedAt: '2024-01-01' },
        ],
      });

      const updateEvent = {
        event: 'playerLeft',
        userId: 'user-2',
      };

      roomUpdateHandler?.(updateEvent);

      await waitFor(() => {
        const roomData = queryClient.getQueryData(ROOM_KEYS.byCode('ROOM123')) as any;
        expect(roomData.players).toHaveLength(1);
        expect(roomData.players[0].userId).toBe('user-1');
      });

      expect(onPlayersChanged).toHaveBeenCalled();
    });

    it('should not show a toast if the joining player is the current user', async () => {
      mockSocket.connected = true;

      renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      const roomUpdateHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'room:update'
      )?.[1];

      const updateEvent = {
        event: 'playerJoined',
        player: { id: 'user-123', name: 'Test User' }, // Mismo ID que en localStorage
        players: [{ userId: 'user-123', name: 'Test User', joinedAt: '2024-01-01' }],
      };

      queryClient.setQueryData(ROOM_KEYS.byCode('ROOM123'), {
        code: 'ROOM123',
        players: [],
      });

      roomUpdateHandler?.(updateEvent);

      await waitFor(() => {
        expect(toast.success).not.toHaveBeenCalled();
      });
    });
  });

  describe('Disconnection management', () => {
    it('should handle server disconnection', async () => {
      const { result } = renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      // Simular conexión exitosa primero
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )?.[1];
      connectHandler?.();

      await waitFor(() => {
        expect(result.current.connected).toBe(true);
      });

      // Simular desconexión
      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'disconnect'
      )?.[1];

      disconnectHandler?.('io server disconnect');

      await waitFor(() => {
        expect(result.current.connected).toBe(false);
        expect(result.current.joined).toBe(false);
      });
    });

    it('Toast should display on non-manual disconnection', async () => {
      renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'disconnect'
      )?.[1];

      disconnectHandler?.('transport close');

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Conexión perdida. Reconectando...',
          expect.any(Object)
        );
      });
    });

    it('should not display toast on manual disconnection', async () => {
      renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'disconnect'
      )?.[1];

      disconnectHandler?.('io client disconnect');

      await waitFor(() => {
        expect(toast.error).not.toHaveBeenCalled();
      });
    });

    it('should handle connection errors', async () => {
      const { result } = renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect_error'
      )?.[1];

      const mockError = new Error('Connection failed');
      errorHandler?.(mockError);

      await waitFor(() => {
        expect(result.current.connected).toBe(false);
      });
    });
  });

  describe('Cleaning', () => {
    it('should clear listeners when unmounting', () => {
      const { unmount } = renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('connect_error', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('room:update', expect.any(Function));
    });

    it('should reset the states when dismounting', () => {
      const { result, unmount } = renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      // Simular estados activos
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )?.[1];
      connectHandler?.();

      unmount();

      expect(result.current.joined).toBe(false);
    });
  });

  describe('Prevention of duplicate joins', () => {
    it('should not join multiple times if you are already in progress', async () => {
      mockSocket.connected = true;

      renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      // Simular múltiples intentos de conexión
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )?.[1];

      connectHandler?.();
      connectHandler?.();
      connectHandler?.();

      await waitFor(() => {
        // Solo debe llamar emit una vez (la inicial)
        const joinCalls = mockSocket.emit.mock.calls.filter(
          (call: any) => call[0] === 'room:join'
        );
        expect(joinCalls.length).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Cache update', () => {
    it('should update QueryClient with normalized data', async () => {
      const mockResponse = {
        ok: true,
        room: {
          code: 'ROOM123',
          players: [
            { userId: 'user-1', name: 'Player 1', joinedAt: '2024-01-01' },
          ],
          chatHistory: [],
        },
      };

      mockSocket.emit.mockImplementation((event: string, data: any, callback: any) => {
        if (event === 'room:join') {
          callback(mockResponse);
        }
      });

      mockSocket.connected = true;

      renderHook(() => useRoomSocket('ROOM123'), { wrapper });

      await waitFor(() => {
        const roomData = queryClient.getQueryData(ROOM_KEYS.byCode('ROOM123'));
        expect(roomData).toBeDefined();
        expect((roomData as any).code).toBe('ROOM123');
        expect((roomData as any).players).toHaveLength(1);
      });
    });
  });
});