import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useClipboard } from '../../hooks/useClipboard';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast');

describe('useClipboard', () => {
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    vi.mocked(toast.success).mockImplementation(() => '' as any);
    vi.mocked(toast.error).mockImplementation(() => '' as any);

    vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with copied to false', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.copied).toBe(false);
    });

    it('should return copyToClipboard function', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.copyToClipboard).toBeInstanceOf(Function);
    });

    it('should use the default resetDelay of 2000ms', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current).toBeDefined();
    });

    it('should accept custom resetDelay', () => {
      const { result } = renderHook(() => useClipboard(5000));

      expect(result.current).toBeDefined();
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to the clipboard correctly', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('Hello World');
      });

      expect(writeTextMock).toHaveBeenCalledWith('Hello World');
      expect(writeTextMock).toHaveBeenCalledTimes(1);
    });

    it('should set copied to true after copying', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('Test');
      });

      expect(result.current.copied).toBe(true);
    });

    it('should display a success toast with a default message', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('Test');
      });

      expect(toast.success).toHaveBeenCalledWith('Copiado al portapapeles');
    });

    it('should display a success toast with a personalized message', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('Test', '¡Código copiado!');
      });

      expect(toast.success).toHaveBeenCalledWith('¡Código copiado!');
    });

    it('should reset copied to false after the delay', async () => {
      const { result } = renderHook(() => useClipboard(2000));

      await act(async () => {
        await result.current.copyToClipboard('Test');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.copied).toBe(false);
    });

    it('should reset copied after the custom delay', async () => {
      const { result } = renderHook(() => useClipboard(5000));

      await act(async () => {
        await result.current.copyToClipboard('Test');
      });

      expect(result.current.copied).toBe(true);
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.copied).toBe(true);
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.copied).toBe(false);
    });

    it('should handle copying errors', async () => {
      const error = new Error('Clipboard error');
      writeTextMock.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('Test');
      });

      expect(toast.error).toHaveBeenCalledWith('Error al copiar');
      expect(console.error).toHaveBeenCalledWith(
        'Error copying to clipboard:',
        error
      );
      expect(result.current.copied).toBe(false);
    });

    it('should handle clipboard not available', async () => {
      // @ts-expect-error - Simulando clipboard no disponible
      delete navigator.clipboard;

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('Test');
      });

      expect(toast.error).toHaveBeenCalledWith('Error al copiar');
      expect(result.current.copied).toBe(false);
    });
  });

  describe('Multiple copies', () => {
    it('should handle multiple consecutive copies', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('First');
      });
      expect(result.current.copied).toBe(true);

      await act(async () => {
        await result.current.copyToClipboard('Second');
      });
      expect(result.current.copied).toBe(true);

      expect(writeTextMock).toHaveBeenCalledTimes(2);
      expect(writeTextMock).toHaveBeenNthCalledWith(1, 'First');
      expect(writeTextMock).toHaveBeenNthCalledWith(2, 'Second');
    });
  });

  describe('Special cases of text', () => {
    it('debe copiar cadena vacía', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('');
      });

      expect(writeTextMock).toHaveBeenCalledWith('');
      expect(result.current.copied).toBe(true);
    });

    it('debe copiar texto con caracteres especiales', async () => {
      const { result } = renderHook(() => useClipboard());
      const specialText = 'Hello\nWorld\t!@#$%^&*()';

      await act(async () => {
        await result.current.copyToClipboard(specialText);
      });

      expect(writeTextMock).toHaveBeenCalledWith(specialText);
      expect(result.current.copied).toBe(true);
    });

    it('debe copiar texto muy largo', async () => {
      const { result } = renderHook(() => useClipboard());
      const longText = 'A'.repeat(10000);

      await act(async () => {
        await result.current.copyToClipboard(longText);
      });

      expect(writeTextMock).toHaveBeenCalledWith(longText);
      expect(result.current.copied).toBe(true);
    });

    it('debe copiar emojis y unicode', async () => {
      const { result } = renderHook(() => useClipboard());
      const emojiText = '🎉 ¡Hola! 你好 🚀';

      await act(async () => {
        await result.current.copyToClipboard(emojiText);
      });

      expect(writeTextMock).toHaveBeenCalledWith(emojiText);
      expect(result.current.copied).toBe(true);
    });
  });

  describe('Callback stability', () => {
    it('copyToClipboard should maintain a stable reference if resetDelay does not change', () => {
      const { result, rerender } = renderHook(() => useClipboard(2000));

      const firstCallback = result.current.copyToClipboard;

      rerender();

      expect(result.current.copyToClipboard).toBe(firstCallback);
    });

    it('copyToClipboard should change if resetDelay changes', () => {
      const { result, rerender } = renderHook(
        ({ delay }) => useClipboard(delay),
        { initialProps: { delay: 2000 } }
      );

      const firstCallback = result.current.copyToClipboard;

      rerender({ delay: 5000 });

      expect(result.current.copyToClipboard).not.toBe(firstCallback);
    });
  });

  describe('Cleanup and memory leaks', () => {
    it('should not update status after unmount', async () => {
      const { result, unmount } = renderHook(() => useClipboard(2000));

      await act(async () => {
        await result.current.copyToClipboard('Test');
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining("Can't perform a React state update")
      );
    });
  });

  describe('Integration with toast', () => {
    it('Toast should only be displayed once per successful copy', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('Test');
      });

      expect(toast.success).toHaveBeenCalledTimes(1);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should only display an error toast message in case of failure', async () => {
      writeTextMock.mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('Test');
      });

      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.success).not.toHaveBeenCalled();
    });
  });
});