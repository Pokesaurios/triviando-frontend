import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useChat } from '../../hooks/useChat';
import { getSocket } from '../../lib/socket';
import { SOCKET_CONFIG, SOCKET_EVENTS } from '../../config/constants';
import { getAvatarColor } from '../../utils/avatar';

vi.mock('../../lib/socket');
vi.mock('../../utils/avatar');

describe('useChat', () => {
  let mockSocket: any;
  let socketEventHandlers: Record<string, (...args: any[]) => void>;

  beforeEach(() => {
    socketEventHandlers = {};
    mockSocket = {
      connected: true,
      on: vi.fn((event: string, handler: (...args: any[]) => void) => {
        socketEventHandlers[event] = handler;
      }),
      off: vi.fn(),
      emit: vi.fn(),
    };

    vi.mocked(getSocket).mockReturnValue(mockSocket);
    vi.mocked(getAvatarColor).mockReturnValue('#3B82F6');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with an empty state', () => {
      const { result } = renderHook(() => useChat());

      expect(result.current.messages).toEqual([]);
      expect(result.current.isConnected).toBe(true);
    });

    it('should register socket event listeners', () => {
      renderHook(() => useChat());

      expect(mockSocket.on).toHaveBeenCalledWith(
        SOCKET_CONFIG.EVENTS.CONNECT,
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        SOCKET_CONFIG.EVENTS.DISCONNECT,
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        SOCKET_EVENTS.ROOM_CHAT_NEW,
        expect.any(Function)
      );
    });

    it('should handle when the socket is unavailable', () => {
      vi.mocked(getSocket).mockReturnValue(null);

      const { result } = renderHook(() => useChat());

      expect(result.current.messages).toEqual([]);
      expect(mockSocket.on).not.toHaveBeenCalled();
    });

    it('should set isConnected according to the socket state', () => {
      mockSocket.connected = false;
      const { result } = renderHook(() => useChat());

      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('Connection events', () => {
    it('should update isConnected when it connects', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        socketEventHandlers[SOCKET_CONFIG.EVENTS.CONNECT]();
      });

      expect(result.current.isConnected).toBe(true);
      expect(console.log).toHaveBeenCalledWith('✅ Chat: Socket conectado');
    });

    it('should update isConnected when it disconnects', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        socketEventHandlers[SOCKET_CONFIG.EVENTS.DISCONNECT]();
      });

      expect(result.current.isConnected).toBe(false);
      expect(console.log).toHaveBeenCalledWith('❌ Chat: Socket desconectado');
    });
  });

  describe('Receiving messages', () => {
    it('debe agregar nuevo mensaje cuando se recibe ROOM_CHAT_NEW', () => {
      const { result } = renderHook(() => useChat());

      const newMessageData = {
        userId: 'user123',
        user: 'Test User',
        message: 'Hello world',
        timestamp: '2024-01-01T12:00:00Z',
      };

      act(() => {
        socketEventHandlers[SOCKET_EVENTS.ROOM_CHAT_NEW](newMessageData);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toMatchObject({
        userId: 'user123',
        user: 'Test User',
        message: 'Hello world',
        timestamp: '2024-01-01T12:00:00Z',
        avatarColor: '#3B82F6',
      });
    });

    it('debe transformar timestamp de Date a string', () => {
      const { result } = renderHook(() => useChat());

      const date = new Date('2024-01-01T12:00:00Z');
      const newMessageData = {
        userId: 'user123',
        user: 'Test User',
        message: 'Hello',
        timestamp: date,
      };

      act(() => {
        socketEventHandlers[SOCKET_EVENTS.ROOM_CHAT_NEW](newMessageData);
      });

      expect(result.current.messages[0].timestamp).toBe(date.toISOString());
    });

    it('debe generar ID único para cada mensaje', () => {
      const { result } = renderHook(() => useChat());

      const messageData = {
        userId: 'user123',
        user: 'Test User',
        message: 'Hello',
        timestamp: '2024-01-01T12:00:00Z',
      };

      act(() => {
        socketEventHandlers[SOCKET_EVENTS.ROOM_CHAT_NEW](messageData);
      });

      expect(result.current.messages[0].id).toMatch(/^user123-\d+$/);
    });

    it('debe evitar duplicados de mensajes por ID', () => {
      const { result } = renderHook(() => useChat());

      const message = {
        id: 'msg-123',
        userId: 'user123',
        user: 'Test User',
        message: 'Hello',
        timestamp: '2024-01-01T12:00:00Z',
        avatarColor: '#3B82F6',
      };

      act(() => {
        result.current.addMessage(message);
        result.current.addMessage(message); // Intentar agregar duplicado
      });

      expect(result.current.messages).toHaveLength(1);
    });
  });

  describe('addMessage', () => {
    it('debe agregar mensaje correctamente', () => {
      const { result } = renderHook(() => useChat());

      const message = {
        id: 'msg-1',
        userId: 'user123',
        user: 'Test User',
        message: 'Test message',
        timestamp: '2024-01-01T12:00:00Z',
        avatarColor: '#3B82F6',
      };

      act(() => {
        result.current.addMessage(message);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toEqual(message);
    });

    it('debe mantener orden de mensajes', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.addMessage({
          id: 'msg-1',
          userId: 'user1',
          user: 'User 1',
          message: 'First',
          timestamp: '2024-01-01T12:00:00Z',
        });
        result.current.addMessage({
          id: 'msg-2',
          userId: 'user2',
          user: 'User 2',
          message: 'Second',
          timestamp: '2024-01-01T12:01:00Z',
        });
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].message).toBe('First');
      expect(result.current.messages[1].message).toBe('Second');
    });
  });

  describe('clearMessages', () => {
    it('debe limpiar todos los mensajes', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.addMessage({
          id: 'msg-1',
          userId: 'user1',
          user: 'User 1',
          message: 'Test',
          timestamp: '2024-01-01T12:00:00Z',
        });
      });

      expect(result.current.messages).toHaveLength(1);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });
  });

  describe('sendMessage', () => {
    it('debe enviar mensaje correctamente cuando el socket está conectado', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.sendMessage('Hello world', 'ROOM123');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        SOCKET_EVENTS.ROOM_CHAT,
        {
          code: 'ROOM123',
          message: 'Hello world',
        },
        expect.any(Function)
      );
    });

    it('debe manejar respuesta exitosa del servidor', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.sendMessage('Test', 'ROOM123');
      });

      const callback = mockSocket.emit.mock.calls[0][2];
      
      act(() => {
        callback({ ok: true });
      });

      expect(console.log).toHaveBeenCalledWith('✅ Mensaje enviado exitosamente');
    });

    it('debe manejar error del servidor', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.sendMessage('Test', 'ROOM123');
      });

      const callback = mockSocket.emit.mock.calls[0][2];
      
      act(() => {
        callback({ ok: false, message: 'Error al enviar' });
      });

      expect(console.error).toHaveBeenCalledWith(
        '❌ Error al enviar mensaje:',
        'Error al enviar'
      );
    });

    it('debe manejar respuesta sin mensaje de error', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.sendMessage('Test', 'ROOM123');
      });

      const callback = mockSocket.emit.mock.calls[0][2];
      
      act(() => {
        callback({ ok: false });
      });

      expect(console.error).toHaveBeenCalledWith(
        '❌ Error al enviar mensaje:',
        'Sin respuesta del servidor'
      );
    });

    it('no debe enviar mensaje si el socket no está conectado', () => {
      mockSocket.connected = false;
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.sendMessage('Test', 'ROOM123');
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        '❌ Socket no conectado. No se puede enviar mensaje.'
      );
    });

    it('no debe enviar si el socket es null', () => {
      vi.mocked(getSocket).mockReturnValue(null);
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.sendMessage('Test', 'ROOM123');
      });

      expect(console.error).toHaveBeenCalledWith(
        '❌ Socket no conectado. No se puede enviar mensaje.'
      );
    });
  });

  describe('loadChatHistory', () => {
    it('debe enviar evento ROOM_RECONNECT con código correcto', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.loadChatHistory('ROOM456');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        SOCKET_EVENTS.ROOM_RECONNECT,
        { code: 'ROOM456' },
        expect.any(Function)
      );
    });

    it('no debe cargar si socket no está conectado', () => {
      mockSocket.connected = false;
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.loadChatHistory('ROOM123');
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        'Socket no conectado, no se puede cargar historial'
      );
    });

    it('no debe cargar si socket es null', () => {
      vi.mocked(getSocket).mockReturnValue(null);
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.loadChatHistory('ROOM123');
      });

      expect(console.warn).toHaveBeenCalledWith(
        'Socket no conectado, no se puede cargar historial'
      );
    });
  });

  describe('Cleanup', () => {
    it('debe remover listeners cuando se desmonta', () => {
      const { unmount } = renderHook(() => useChat());

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith(
        SOCKET_CONFIG.EVENTS.CONNECT,
        expect.any(Function)
      );
      expect(mockSocket.off).toHaveBeenCalledWith(
        SOCKET_CONFIG.EVENTS.DISCONNECT,
        expect.any(Function)
      );
      expect(mockSocket.off).toHaveBeenCalledWith(
        SOCKET_EVENTS.ROOM_CHAT_NEW,
        expect.any(Function)
      );
    });

    it('debe manejar cleanup cuando socket es null', () => {
      vi.mocked(getSocket).mockReturnValue(null);
      const { unmount } = renderHook(() => useChat());

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Integración de transformMessage', () => {
    it('debe llamar getAvatarColor con userId correcto', () => {
      const { result } = renderHook(() => useChat());

      const messageData = {
        userId: 'user-abc-123',
        user: 'Test User',
        message: 'Hello',
        timestamp: '2024-01-01T12:00:00Z',
      };

      act(() => {
        socketEventHandlers[SOCKET_EVENTS.ROOM_CHAT_NEW](messageData);
      });

      expect(getAvatarColor).toHaveBeenCalledWith('user-abc-123');
      expect(result.current.messages[0].avatarColor).toBe('#3B82F6');
    });
  });
});