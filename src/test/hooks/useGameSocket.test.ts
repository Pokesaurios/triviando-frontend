import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGameSocket } from '../../hooks/useGameSocket';
import * as socketModule from '../../lib/socket';
import type { GameState } from '../../types/game.types';

vi.mock('../../lib/socket');

describe('useGameSocket', () => {
  let mockSocket: any;
  let eventHandlers: Record<string, (...args: any[]) => void>;
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    vi.useFakeTimers();
    
    mockLocalStorage = {
      user: JSON.stringify({ id: 'user-123', name: 'Test User' })
    };
    
    const fakeLocalStorage: Partial<Storage> = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: vi.fn(() => {
        mockLocalStorage = {};
      }),
      key: vi.fn(),
      length: 0
    };
    (globalThis as any).localStorage = fakeLocalStorage;

    eventHandlers = {};
    mockSocket = {
      on: vi.fn((event: string, handler: (...args: any[]) => void) => {
        eventHandlers[event] = handler;
      }),
      off: vi.fn((event: string) => {
        delete eventHandlers[event];
      }),
      emit: vi.fn((event: string, data?: any, callback?: (res: { ok: boolean }) => void) => {
        if (callback) {
          setTimeout(() => callback({ ok: true }), 0);
        }
        return mockSocket;
      }),
      connected: true
    };

    vi.spyOn(socketModule, 'getSocket').mockReturnValue(mockSocket);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      expect(result.current.gameState).toBeNull();
      expect(result.current.currentQuestion).toBeNull();
      expect(result.current.currentOptions).toBeNull();
      expect(result.current.showBuzzer).toBe(false);
      expect(result.current.buzzerPressed).toBe(false);
      expect(result.current.playerWhoPressed).toBeNull();
      expect(result.current.showAnswerOptions).toBe(false);
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.answerTimeLeft).toBe(0);
      expect(result.current.gameEnded).toBe(false);
      expect(result.current.winner).toBeNull();
      expect(result.current.isBlocked).toBe(false);
      expect(result.current.waitingBuzzerAck).toBe(false);
      expect(result.current.waitingAnswerAck).toBe(false);
    });

    it('should register all socket listeners', () => {
      renderHook(() => useGameSocket('ROOM123'));

      expect(mockSocket.on).toHaveBeenCalledWith('game:update', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('game:started', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('round:showQuestion', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('round:openButton', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('round:playerWonButton', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('round:answerRequest', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('round:result', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('game:ended', expect.any(Function));
    });

    it('should clear listeners when unmounting', () => {
      const { unmount } = renderHook(() => useGameSocket('ROOM123'));

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith('game:update', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('game:started', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('round:showQuestion', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('round:openButton', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('round:playerWonButton', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('round:answerRequest', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('round:result', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('game:ended', expect.any(Function));
    });
  });

  describe('game:update', () => {
    it('It should normalize players when they come in raw form', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      const rawGameState = {
        triviaId: 'trivia-1',
        currentQuestionIndex: 0,
        scores: {},
        players: [
          { userId: 'user-123', name: 'Player 1', joinedAt: '2024-01-01' }
        ],
        status: 'waiting' as const,
        roundSequence: 0,
        blocked: {}
      };

      act(() => {
        eventHandlers['game:update'](rawGameState);
      });

      expect(result.current.gameState?.players).toHaveLength(1);
      expect(result.current.gameState?.players[0].userId).toBe('user-123');
    });

    it('should mark the user as blocked if they are on the blocked list', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      const gameStateWithBlocked: GameState = {
        triviaId: 'trivia-1',
        currentQuestionIndex: 0,
        scores: {},
        players: [],
        status: 'reading',
        roundSequence: 1,
        blocked: { 'user-123': true }
      };

      act(() => {
        eventHandlers['game:update'](gameStateWithBlocked);
      });

      expect(result.current.isBlocked).toBe(true);
    });
  });

  describe('game:started', () => {
    it('should initialize the game correctly', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      // Primero establecer players
      act(() => {
        eventHandlers['game:update']({
          players: [
            { userId: 'user-123', name: 'Player 1' },
            { userId: 'user-456', name: 'Player 2' }
          ],
          scores: {},
          triviaId: 'trivia-1',
          currentQuestionIndex: 0,
          status: 'waiting' as const,
          roundSequence: 0,
          blocked: {}
        });
      });

      act(() => {
        eventHandlers['game:started']({ ok: true, totalQuestions: 10 });
      });

      expect(result.current.totalQuestions).toBe(10);
      expect(result.current.gameEnded).toBe(false);
      expect(result.current.winner).toBeNull();
      expect(result.current.gameState?.scores).toEqual({
        'user-123': 0,
        'user-456': 0
      });
    });
  });

  describe('round:openButton', () => {
    it('should ignore event with obsolete roundSequence', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        eventHandlers['round:showQuestion']({
          roundSequence: 2,
          questionText: 'Pregunta',
          readMs: 5000
        });
      });

      act(() => {
        eventHandlers['round:openButton']({
          roundSequence: 1,
          pressWindowMs: 3000
        });
      });

      expect(result.current.showBuzzer).toBe(false);
    });
  });

  describe('round:playerWonButton', () => {
    it('should indicate that a player won the buzzer', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        eventHandlers['round:showQuestion']({
          roundSequence: 1,
          questionText: 'Pregunta',
          readMs: 5000
        });
      });

      act(() => {
        eventHandlers['round:playerWonButton']({
          roundSequence: 1,
          playerId: 'user-456',
          name: 'Player 2'
        });
      });

      expect(result.current.buzzerPressed).toBe(true);
      expect(result.current.playerWhoPressed).toBe('Player 2');
      expect(result.current.playerWhoPressedId).toBe('user-456');
      expect(result.current.showBuzzer).toBe(false);
    });

    it('should ignore event with obsolete roundSequence', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        eventHandlers['round:showQuestion']({
          roundSequence: 2,
          questionText: 'Pregunta',
          readMs: 5000
        });
      });

      act(() => {
        eventHandlers['round:playerWonButton']({
          roundSequence: 1,
          playerId: 'user-456',
          name: 'Player 2'
        });
      });

      expect(result.current.playerWhoPressed).toBeNull();
    });
  });

  describe('round:answerRequest', () => {
    it('should ignore event with obsolete roundSequence', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        eventHandlers['round:showQuestion']({
          roundSequence: 2,
          questionText: 'Pregunta',
          readMs: 5000
        });
      });

      act(() => {
        eventHandlers['round:answerRequest']({
          roundSequence: 1,
          options: ['A', 'B'],
          answerTimeoutMs: 30000,
          endsAt: Date.now() + 30000
        });
      });

      expect(result.current.showAnswerOptions).toBe(false);
    });
  });

  describe('pressBuzzer', () => {
    it('should emit event round:buttonPress', async () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        eventHandlers['round:showQuestion']({
          roundSequence: 1,
          questionText: 'Pregunta',
          readMs: 5000
        });
      });

      act(() => {
        result.current.pressBuzzer();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'round:buttonPress',
        expect.objectContaining({
          code: 'ROOM123',
          roundSequence: 1
        }),
        expect.any(Function)
      );

      expect(result.current.waitingBuzzerAck).toBe(true);

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.waitingBuzzerAck).toBe(false);
    });

    it('should not send if it is already waiting for an ACK', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        result.current.pressBuzzer();
      });

      mockSocket.emit.mockClear();

      act(() => {
        result.current.pressBuzzer();
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should not broadcast if the user is locked out.', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        eventHandlers['game:update']({
          triviaId: 'trivia-1',
          currentQuestionIndex: 0,
          scores: {},
          players: [],
          status: 'reading',
          roundSequence: 1,
          blocked: { 'user-123': true }
        });
      });

      act(() => {
        result.current.pressBuzzer();
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should not broadcast if there is no socket', () => {
      vi.spyOn(socketModule, 'getSocket').mockReturnValue(null);
      
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        result.current.pressBuzzer();
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('submitAnswer', () => {
    it('should emit the round:answer event', async () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        eventHandlers['round:showQuestion']({
          roundSequence: 1,
          questionText: 'Pregunta',
          readMs: 5000
        });
      });

      act(() => {
        result.current.submitAnswer(2);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'round:answer',
        expect.objectContaining({
          code: 'ROOM123',
          roundSequence: 1,
          selectedIndex: 2
        }),
        expect.any(Function)
      );

      expect(result.current.waitingAnswerAck).toBe(true);

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.waitingAnswerAck).toBe(false);
    });

    it('should not send an ACK if you are already waiting', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        result.current.submitAnswer(0);
      });

      mockSocket.emit.mockClear();

      act(() => {
        result.current.submitAnswer(1);
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should not broadcast if there is no socket', () => {
      vi.spyOn(socketModule, 'getSocket').mockReturnValue(null);
      
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        result.current.submitAnswer(0);
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('Event ID generation', () => {
    it('should generate a unique event ID for the press buzzer', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        eventHandlers['round:showQuestion']({
          roundSequence: 1,
          questionText: 'Pregunta',
          readMs: 5000
        });
      });

      act(() => {
        result.current.pressBuzzer();
      });

      const firstCall = mockSocket.emit.mock.calls[0];
      const firstEventId = firstCall[1].eventId;

      expect(firstEventId).toMatch(/^buzzer-user-123-\d+$/);
    });

    it('should generate a unique eventId for submitAnswer', () => {
      const { result } = renderHook(() => useGameSocket('ROOM123'));

      act(() => {
        eventHandlers['round:showQuestion']({
          roundSequence: 1,
          questionText: 'Pregunta',
          readMs: 5000
        });
      });

      act(() => {
        result.current.submitAnswer(1);
      });

      const firstCall = mockSocket.emit.mock.calls[0];
      const firstEventId = firstCall[1].eventId;

      expect(firstEventId).toMatch(/^answer-user-123-\d+$/);
    });
  });

});