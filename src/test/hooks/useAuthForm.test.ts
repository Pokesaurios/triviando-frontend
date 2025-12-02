import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthForm } from '../../hooks/useAuthForm';
import { authService } from '../../lib/services/authServices';
import { MESSAGES } from '../../config/constants';

vi.mock('../../lib/services/authServices', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

const reloadMock = vi.fn();
Object.defineProperty(globalThis, 'location', {
  value: { reload: reloadMock },
  writable: true,
});

describe('useAuthForm', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useAuthForm());

      expect(result.current.formState).toEqual({
        email: '',
        password: '',
        username: '',
        isLoading: false,
        message: null,
      });
    });
  });

  describe('updateField', () => {
    it('should update the email field', () => {
      const { result } = renderHook(() => useAuthForm());

      act(() => {
        result.current.updateField('email', 'test@example.com');
      });

      expect(result.current.formState.email).toBe('test@example.com');
    });

    it('should update the password field', () => {
      const { result } = renderHook(() => useAuthForm());

      act(() => {
        result.current.updateField('password', 'password123');
      });

      expect(result.current.formState.password).toBe('password123');
    });

    it('should update the username field', () => {
      const { result } = renderHook(() => useAuthForm());

      act(() => {
        result.current.updateField('username', 'testuser');
      });

      expect(result.current.formState.username).toBe('testuser');
    });

    it('should update multiple fields independently', () => {
      const { result } = renderHook(() => useAuthForm());

      act(() => {
        result.current.updateField('email', 'test@example.com');
        result.current.updateField('password', 'password123');
        result.current.updateField('username', 'testuser');
      });

      expect(result.current.formState.email).toBe('test@example.com');
      expect(result.current.formState.password).toBe('password123');
      expect(result.current.formState.username).toBe('testuser');
    });
  });

  describe('setMessage', () => {
    it('should establish a message of success', () => {
      const { result } = renderHook(() => useAuthForm());

      act(() => {
        result.current.setMessage({
          type: 'success',
          text: 'Operación exitosa',
        });
      });

      expect(result.current.formState.message).toEqual({
        type: 'success',
        text: 'Operación exitosa',
      });
    });

    it('should set an error message', () => {
      const { result } = renderHook(() => useAuthForm());

      act(() => {
        result.current.setMessage({
          type: 'error',
          text: 'Error en la operación',
        });
      });

      expect(result.current.formState.message).toEqual({
        type: 'error',
        text: 'Error en la operación',
      });
    });

    it('should clear the message by setting null', () => {
      const { result } = renderHook(() => useAuthForm());

      act(() => {
        result.current.setMessage({
          type: 'success',
          text: 'Mensaje',
        });
      });

      act(() => {
        result.current.setMessage(null);
      });

      expect(result.current.formState.message).toBeNull();
    });
  });

  describe('resetForm', () => {
    it('should reset all fields to their initial values', () => {
      const { result } = renderHook(() => useAuthForm());

      act(() => {
        result.current.updateField('email', 'test@example.com');
        result.current.updateField('password', 'password123');
        result.current.updateField('username', 'testuser');
        result.current.setMessage({ type: 'error', text: 'Error' });
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formState).toEqual({
        email: '',
        password: '',
        username: '',
        isLoading: false,
        message: null,
      });
    });
  });

  describe('handleSubmit - Login', () => {
    it('should be able to log in successfully', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      const mockToken = 'mock-token-123';

      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        token: mockToken,
        user: mockUser,
      });

      const { result } = renderHook(() => useAuthForm(true));

      act(() => {
        result.current.updateField('email', 'test@example.com');
        result.current.updateField('password', 'password123');
      });

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
      expect(result.current.formState.message).toEqual({
        type: 'success',
        text: MESSAGES.LOGIN_SUCCESS,
      });
      expect(result.current.formState.isLoading).toBe(false);

      // Verificar que se programa el reload
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(reloadMock).toHaveBeenCalled();
    });

    it('should handle login errors with a custom message', async () => {
      const errorMessage = 'Credenciales inválidas';

      vi.mocked(authService.login).mockResolvedValueOnce({
        success: false,
        error: errorMessage,
      });

      const { result } = renderHook(() => useAuthForm(true));

      act(() => {
        result.current.updateField('email', 'test@example.com');
        result.current.updateField('password', 'wrongpassword');
      });

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.formState.message).toEqual({
        type: 'error',
        text: errorMessage,
      });
      expect(result.current.formState.isLoading).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle login errors without a custom message', async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        success: false,
      });

      const { result } = renderHook(() => useAuthForm(true));

      act(() => {
        result.current.updateField('email', 'test@example.com');
        result.current.updateField('password', 'wrongpassword');
      });

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.formState.message).toEqual({
        type: 'error',
        text: MESSAGES.LOGIN_ERROR,
      });
      expect(result.current.formState.isLoading).toBe(false);
    });

    it('should handle exceptions during login', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useAuthForm(true));

      act(() => {
        result.current.updateField('email', 'test@example.com');
        result.current.updateField('password', 'password123');
      });

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.formState.message).toEqual({
        type: 'error',
        text: 'Error de conexión con el servidor',
      });
      expect(result.current.formState.isLoading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});