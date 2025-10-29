import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket } from '../lib/socket';
import { SOCKET_EVENTS } from '../config/constants';
import toast from 'react-hot-toast';
import {
  GameState,
  RoundShowQuestionEvent,
  RoundOpenButtonEvent,
  RoundPlayerWonButtonEvent,
  RoundAnswerRequestEvent,
  RoundResultEvent,
  GameEndedEvent,
  GameStartedEvent,
} from '../types/game.types';

interface UseGameSocketReturn {
  gameState: GameState | null;
  currentQuestion: string | null;
  currentOptions: string[] | null;
  showBuzzer: boolean;
  buzzerPressed: boolean;
  playerWhoPressed: string | null;
  playerWhoPressedId: string | null;
  showAnswerOptions: boolean;
  timeLeft: number;
  answerTimeLeft: number;
  totalQuestions: number;
  currentQuestionNumber: number;
  gameEnded: boolean;
  winner: { userId: string; name: string; score: number } | null;
  pressBuzzer: () => void;
  submitAnswer: (selectedIndex: number) => void;
  isBlocked: boolean;
  waitingBuzzerAck: boolean;
  waitingAnswerAck: boolean;
}

export function useGameSocket(roomCode: string): UseGameSocketReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentOptions, setCurrentOptions] = useState<string[] | null>(null);
  const [showBuzzer, setShowBuzzer] = useState(false);
  const [buzzerPressed, setBuzzerPressed] = useState(false);
  const [playerWhoPressed, setPlayerWhoPressed] = useState<string | null>(null);
  const [playerWhoPressedId, setPlayerWhoPressedId] = useState<string | null>(null);
  const [showAnswerOptions, setShowAnswerOptions] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answerTimeLeft, setAnswerTimeLeft] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<{ userId: string; name: string; score: number } | null>(null);
  const [currentRoundSequence, setCurrentRoundSequence] = useState(0);
  const [answerEndsAt, setAnswerEndsAt] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [waitingBuzzerAck, setWaitingBuzzerAck] = useState(false);
  const [waitingAnswerAck, setWaitingAnswerAck] = useState(false);
  const waitingTimers = useRef<{ buzzer?: number; answer?: number }>({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const raf = requestAnimationFrame(() => setCurrentUserId(user.id || ''));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (answerTimeLeft > 0 && answerEndsAt > 0) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((answerEndsAt - Date.now()) / 1000));
        setAnswerTimeLeft(remaining);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [answerTimeLeft, answerEndsAt]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleGameStarted = (data: GameStartedEvent) => {
      console.log('🎮 Game started:', data);
      setTotalQuestions(data.totalQuestions);
      setGameEnded(false);
      setWinner(null);
      setCurrentQuestionNumber(0);
    };

    socket.on(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);
    return () => {
      socket.off(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);
    };
  }, []);

  // Listen for an initial gameState dispatched by the page on reconnect so the hook
  // can initialize immediately without waiting for further socket events.
  useEffect(() => {
    const handleInit = (e: Event) => {
      try {
        const ev = e as CustomEvent<GameState>;
        if (ev?.detail) {
          console.log('📥 Initial gameState received from page:', ev.detail);
          setGameState(ev.detail);
        }
      } catch (err) {
        console.warn('Failed to handle triviando:gameStateInit event', err);
      }
    };

    window.addEventListener('triviando:gameStateInit', handleInit as EventListener);
    return () => window.removeEventListener('triviando:gameStateInit', handleInit as EventListener);
  }, []);
  
    useEffect(() => {
      const socket = getSocket();
      if (!socket) return;

      const handleGameUpdate = (data: GameState) => {
        console.log('🔄 Game update received:', data);
        // Replace local gameState with the server authoritative state.
        setGameState(data);
      };

      socket.on(SOCKET_EVENTS.GAME_UPDATE, handleGameUpdate);
      return () => {
        socket.off(SOCKET_EVENTS.GAME_UPDATE, handleGameUpdate);
      };
    }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleShowQuestion = (data: RoundShowQuestionEvent) => {
      console.log('📋 Show question:', data);
      setCurrentRoundSequence(data.roundSequence);
      setCurrentQuestion(data.questionText);
      setCurrentQuestionNumber((prev) => prev + 1);
      setTimeLeft(Math.ceil(data.readMs / 1000));
      setShowBuzzer(false);
      setBuzzerPressed(false);
      setPlayerWhoPressed(null);
      setShowAnswerOptions(false);
      setCurrentOptions(null);
    };

    socket.on(SOCKET_EVENTS.ROUND_SHOW_QUESTION, handleShowQuestion);
    return () => {
      socket.off(SOCKET_EVENTS.ROUND_SHOW_QUESTION, handleShowQuestion);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOpenButton = (data: RoundOpenButtonEvent) => {
      console.log('🔴 Open button:', data);
      if (data.roundSequence === currentRoundSequence) {
        setShowBuzzer(true);
        setBuzzerPressed(false);
        setPlayerWhoPressed(null);
      }
    };
    socket.on(SOCKET_EVENTS.ROUND_OPEN_BUTTON, handleOpenButton);
    return () => {
      socket.off(SOCKET_EVENTS.ROUND_OPEN_BUTTON, handleOpenButton);
    };
  }, [currentRoundSequence]);

  // Derive local UI state from authoritative gameState when it changes (useful on reconnect)
  useEffect(() => {
    if (!gameState) return;

    // Defer all state updates to the next animation frame to avoid synchronous setState in effect
    const raf = requestAnimationFrame(() => {
      // current question number (human-friendly)
      setCurrentQuestionNumber((gameState.currentQuestionIndex || 0) + 1);

      // Timers: question read timer and answer window timer come from server when available
      const qReadEnds = gameState.questionReadEndsAt;
      if (qReadEnds) {
        setTimeLeft(Math.max(0, Math.ceil((qReadEnds - Date.now()) / 1000)));
      } else {
        setTimeLeft(0);
      }

      const ansEnds = gameState.answerWindowEndsAt;
      if (ansEnds) {
        setAnswerEndsAt(ansEnds);
        setAnswerTimeLeft(Math.max(0, Math.ceil((ansEnds - Date.now()) / 1000)));
      } else {
        setAnswerEndsAt(0);
        setAnswerTimeLeft(0);
      }

  // Status-driven UI: accept both legacy 'buzzer-open' and new 'open'
  setShowBuzzer(gameState.status === 'open' || gameState.status === 'buzzer-open');

      // If server indicates answering status, try to infer which player is answering
      if (gameState.status === 'answering') {
        // Winner inference: player with blocked === false while others true
        const blocked = gameState.blocked || {};
        const entries = Object.entries(blocked);
        let winnerId: string | null = null;
        if (entries.length > 0) {
          const candidates = entries.filter(([, value]) => value === false).map(([key]) => key);
          if (candidates.length === 1) winnerId = candidates[0];
        }

        setPlayerWhoPressedId(winnerId);
        const winnerPlayer = gameState.players.find((p) => p.userId === winnerId);
        setPlayerWhoPressed(winnerPlayer?.name || null);

        setShowAnswerOptions(!!winnerId && winnerId === currentUserId);
        setBuzzerPressed(!!winnerId);
        setShowBuzzer(false);
      } else {
        // not answering
        setShowAnswerOptions(false);
        setBuzzerPressed(false);
        setPlayerWhoPressed(null);
        setPlayerWhoPressedId(null);
      }

      // Update local copy of scores if present
      if (gameState.scores) {
        setGameState((prev) => ({ ...(prev || {}), scores: gameState.scores } as GameState));
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [gameState, currentUserId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handlePlayerWonButton = (data: RoundPlayerWonButtonEvent) => {
      console.log('⚡ Player won button:', data);
      if (data.roundSequence === currentRoundSequence) {
        setBuzzerPressed(true);
        setPlayerWhoPressed(data.name);
        setPlayerWhoPressedId(data.playerId || null);
        setShowBuzzer(false);
      }
    };
    socket.on(SOCKET_EVENTS.ROUND_PLAYER_WON_BUTTON, handlePlayerWonButton);
    return () => {
      socket.off(SOCKET_EVENTS.ROUND_PLAYER_WON_BUTTON, handlePlayerWonButton);
    };
  }, [currentRoundSequence]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleAnswerRequest = (data: RoundAnswerRequestEvent) => {
      console.log('❓ Answer request:', data);
      if (data.roundSequence === currentRoundSequence) {
        setCurrentOptions(data.options);
        setShowAnswerOptions(true);
        setAnswerEndsAt(data.endsAt);
        setAnswerTimeLeft(Math.ceil(data.answerTimeoutMs / 1000));
      }
    };
    socket.on(SOCKET_EVENTS.ROUND_ANSWER_REQUEST, handleAnswerRequest);
    return () => {
      socket.off(SOCKET_EVENTS.ROUND_ANSWER_REQUEST, handleAnswerRequest);
    };
  }, [currentRoundSequence]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleResult = (data: RoundResultEvent) => {
      console.log('✅ Round result:', data);
      if (data.roundSequence === currentRoundSequence) {
        if (data.scores && gameState) {
          setGameState({ ...gameState, scores: data.scores });
        }
        
        setShowAnswerOptions(false);
        setBuzzerPressed(false);
        setPlayerWhoPressed(null);
      }
    };

    socket.on(SOCKET_EVENTS.ROUND_RESULT, handleResult);
    return () => {
      socket.off(SOCKET_EVENTS.ROUND_RESULT, handleResult);
    };
  }, [currentRoundSequence, gameState]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleGameEnded = (data: GameEndedEvent) => {
      console.log('🏆 Game ended:', data);
      setGameEnded(true);
      setWinner(data.winner);
      if (gameState) {
        setGameState({ ...gameState, scores: data.scores, status: 'finished' });
      }
    };

    socket.on(SOCKET_EVENTS.GAME_ENDED, handleGameEnded);
    return () => {
      socket.off(SOCKET_EVENTS.GAME_ENDED, handleGameEnded);
    };
  }, [gameState]);

  const pressBuzzer = useCallback(() => {
    const socket = getSocket();
    if (!socket || !showBuzzer || buzzerPressed || waitingBuzzerAck) return;

    const eventId = `buzz-${Date.now()}-${Math.random()}`;
    console.log('🔴 Pressing buzzer:', { roomCode, currentRoundSequence, eventId });

    // mark waiting and set a fallback timeout
    setWaitingBuzzerAck(true);
    waitingTimers.current.buzzer = window.setTimeout(() => {
      setWaitingBuzzerAck(false);
      delete waitingTimers.current.buzzer;
    }, 2000) as unknown as number;

    socket.emit(
      SOCKET_EVENTS.ROUND_BUTTON_PRESS,
      {
        code: roomCode,
        roundSequence: currentRoundSequence,
        eventId,
      },
      (ack?: { ok?: boolean; message?: string }) => {
        // clear waiting state
        if (waitingTimers.current.buzzer) {
          clearTimeout(waitingTimers.current.buzzer as number);
          delete waitingTimers.current.buzzer;
        }
        setWaitingBuzzerAck(false);

        if (!ack) return;
        if (ack.ok) {
          // optimistic UI: reflect that user attempted and server accepted the attempt
          setBuzzerPressed(true);
          setShowBuzzer(false);
          toast.success('Has presionado el botón. Esperando respuesta...');
        } else {
          toast.error(ack.message || 'Otro jugador ganó el botón');
        }
      }
    );
  }, [showBuzzer, buzzerPressed, roomCode, currentRoundSequence, waitingBuzzerAck]);

  const submitAnswer = useCallback((selectedIndex: number) => {
    const socket = getSocket();
    if (!socket || !showAnswerOptions || waitingAnswerAck) return;

    const eventId = `answer-${Date.now()}-${Math.random()}`;
    console.log('📝 Submitting answer:', { roomCode, currentRoundSequence, selectedIndex, eventId });

    // mark waiting and set fallback
    setWaitingAnswerAck(true);
    waitingTimers.current.answer = window.setTimeout(() => {
      setWaitingAnswerAck(false);
      delete waitingTimers.current.answer;
    }, 2000) as unknown as number;

    socket.emit(
      SOCKET_EVENTS.ROUND_ANSWER,
      {
        code: roomCode,
        roundSequence: currentRoundSequence,
        selectedIndex,
        eventId,
      },
      (ack?: { ok?: boolean; correct?: boolean; message?: string }) => {
        // clear waiting state
        if (waitingTimers.current.answer) {
          clearTimeout(waitingTimers.current.answer as number);
          delete waitingTimers.current.answer;
        }
        setWaitingAnswerAck(false);

        if (!ack) return;
        if (!ack.ok) {
          toast.error(ack.message || 'No se pudo enviar la respuesta');
        } else {
          if (ack.correct) {
            toast.success('¡Respuesta correcta!');
          } else {
            toast('Respuesta incorrecta', { icon: '⚠️' });
          }
        }
      }
    );

    // hide local answer UI optimistically; server will emit result/update
    setShowAnswerOptions(false);
  }, [showAnswerOptions, roomCode, currentRoundSequence, waitingAnswerAck]);

  const isBlocked = gameState?.blocked?.[currentUserId] || false;

  return {
    gameState,
    currentQuestion,
    currentOptions,
    showBuzzer,
    buzzerPressed,
    playerWhoPressed,
    playerWhoPressedId,
    showAnswerOptions,
    timeLeft,
    answerTimeLeft,
    totalQuestions,
    currentQuestionNumber,
    gameEnded,
    winner,
    pressBuzzer,
    submitAnswer,
    isBlocked,
    waitingBuzzerAck,
    waitingAnswerAck,
  };
}