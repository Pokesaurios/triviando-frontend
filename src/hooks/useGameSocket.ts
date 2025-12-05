import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket } from '../lib/socket';
import { normalizePlayer } from '../lib/api/normalizers';
import type { GameState } from '../types/game.types';

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
  timeLeftMs: number;
  maxTimeSeconds: number;
  maxTimeMs: number;
  answerTimeLeft: number;
  answerTimeLeftMs: number;
  totalQuestions: number;
  currentQuestionNumber: number;
  gameEnded: boolean;
  winner: { userId: string; name: string; score: number } | null;
  pressBuzzer: () => void;
  submitAnswer: (index: number) => void;
  isBlocked: boolean;
  waitingBuzzerAck: boolean;
  waitingAnswerAck: boolean;
}

export const useGameSocket = (roomCode: string): UseGameSocketReturn => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentOptions, setCurrentOptions] = useState<string[] | null>(null);
  const [showBuzzer, setShowBuzzer] = useState(false);
  const [buzzerPressed, setBuzzerPressed] = useState(false);
  const [playerWhoPressed, setPlayerWhoPressed] = useState<string | null>(null);
  const [playerWhoPressedId, setPlayerWhoPressedId] = useState<string | null>(null);
  const [showAnswerOptions, setShowAnswerOptions] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [maxTimeSeconds, setMaxTimeSeconds] = useState(30);
  const [maxTimeMs, setMaxTimeMs] = useState(30000);
  const [answerTimeLeft, setAnswerTimeLeft] = useState(0);
  const [answerTimeLeftMs, setAnswerTimeLeftMs] = useState(0);
  const [answerMaxTimeMs, setAnswerMaxTimeMs] = useState(30000);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<{ userId: string; name: string; score: number } | null>(null);
  const [waitingBuzzerAck, setWaitingBuzzerAck] = useState(false);
  const [waitingAnswerAck, setWaitingAnswerAck] = useState(false);

  const currentRoundSequence = useRef<number | null>(null);
  const buzzerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const answerTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
  const isBlocked = gameState?.blocked?.[currentUserId] || false;

  // Util: startCountdown - helper para crear timers de cuenta atrás
  // startCountdown: calls the callback with remaining milliseconds every 100ms
  const startCountdown = (endTime: number, onTickMs: (remainingMs: number) => void): NodeJS.Timeout => {
    const timer: NodeJS.Timeout = setInterval(() => {
      const remainingMs = Math.max(0, endTime - Date.now());
      onTickMs(remainingMs);
      if (remainingMs <= 0) {
        clearInterval(timer);
      }
    }, 100);

    return timer;
  };

  // Limpiar timers
  const clearTimers = useCallback(() => {
    if (buzzerTimerRef.current) {
      clearInterval(buzzerTimerRef.current);
      buzzerTimerRef.current = null;
    }
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current);
      answerTimerRef.current = null;
    }
  }, []);

  // Util: resetear el estado de interacción (buzzer/answer/player) de forma reutilizable
  const resetInteractionState = useCallback((opts?: { clearPlayerPressed?: boolean }) => {
    // Limpiar timers siempre
    clearTimers();
    // Ocultar buzzer / opciones y resetear flag de buzzer
    setShowBuzzer(false);
    setBuzzerPressed(false);
    setShowAnswerOptions(false);
    // Opcionalmente limpiar el player que presionó inmediatamente
    if (opts?.clearPlayerPressed) {
      setPlayerWhoPressed(null);
      setPlayerWhoPressedId(null);
    }
  }, [clearTimers]);

  // ===== MANEJADOR CRÍTICO: game:update =====
  const handleGameUpdate = useCallback((newState: GameState) => {
    console.log('🎮 game:update recibido:', newState);
    
    setGameState(prevState => {
      // Normalizar players si vienen en forma cruda
      const normalizedPlayers = Array.isArray(newState.players)
        ? newState.players.map(p => normalizePlayer(p as any))
        : (prevState?.players || []);

      const updatedState = {
        ...prevState,
        ...newState,
        scores: newState.scores || prevState?.scores || {},
        players: normalizedPlayers,
        blocked: newState.blocked || prevState?.blocked || {},
      };
      
      console.log('📊 Estado actualizado - Scores:', updatedState.scores);
      console.log('👥 Estado actualizado - Players:', updatedState.players);
      return updatedState;
    });

    if (newState.currentQuestionIndex !== undefined) {
      setCurrentQuestionNumber(newState.currentQuestionIndex + 1);
    }

    // Resume timers if the server provided timestamps (use server as source of truth)
    // Update current round sequence
    if (typeof newState.roundSequence === 'number') {
      currentRoundSequence.current = newState.roundSequence;
    }

    // If the game state indicates we are in reading phase and server provided an end timestamp, resume reading countdown
    if (newState.status === 'reading' && typeof (newState as any).questionReadEndsAt === 'number') {
      try {
        clearTimers();
        const endTime = (newState as any).questionReadEndsAt as number;
        const remainingMs = Math.max(0, endTime - Date.now());
        setTimeLeftMs(remainingMs);
        setTimeLeft(Math.max(0, Math.floor(remainingMs / 1000)));
        // If we don't have a prior max, use remainingMs as a best-effort denominator for progress
        setMaxTimeMs((prev) => {
          if (prev && prev > 0) return prev;
          return remainingMs > 0 ? remainingMs : prev || 10000;
        });
        buzzerTimerRef.current = startCountdown(endTime, (remaining) => {
          const sec = Math.max(0, Math.floor(remaining / 1000));
          setTimeLeftMs(remaining);
          setTimeLeft(sec);
          if (remaining === 0) buzzerTimerRef.current = null;
        });
      } catch (e) {
        console.warn('Failed to resume reading timer from game:update', e);
      }
    }

    // If the game state indicates we are in answering phase and server provided an end timestamp, resume answer countdown
    if (newState.status === 'answering' && typeof (newState as any).answerWindowEndsAt === 'number') {
      try {
        clearTimers();
        const endTime = (newState as any).answerWindowEndsAt as number;
        const remainingMs = Math.max(0, endTime - Date.now());
        setAnswerTimeLeftMs(remainingMs);
        setAnswerTimeLeft(Math.max(0, Math.floor(remainingMs / 1000)));
        // Prefer server-provided start/end to compute max; fallback to previous or remaining
        setAnswerMaxTimeMs((prev) => {
          const started = (newState as any).answerWindowStartedAt as number | undefined;
          if (typeof started === 'number' && endTime > started) return endTime - started;
          if (prev && prev > 0) return prev;
          return remainingMs > 0 ? remainingMs : prev || 30000;
        });
        answerTimerRef.current = startCountdown(endTime, (remaining) => {
          const sec = Math.max(0, Math.floor(remaining / 1000));
          setAnswerTimeLeftMs(remaining);
          setAnswerTimeLeft(sec);
          if (remaining === 0) answerTimerRef.current = null;
        });
      } catch (e) {
        console.warn('Failed to resume answer timer from game:update', e);
      }
    }
  }, []);

  // Game started
  const handleGameStarted = useCallback((data: { ok: boolean; totalQuestions: number }) => {
    console.log('🎮 Game started:', data);
    setTotalQuestions(data.totalQuestions);
    setGameEnded(false);
    setWinner(null);
    
    // Inicializar scores en 0 para todos los jugadores
    setGameState(prev => {
      if (!prev) return prev;
      const initialScores: Record<string, number> = {};
      prev.players.forEach(p => {
        initialScores[p.userId] = 0;
      });
      return {
        ...prev,
        scores: initialScores,
        currentQuestionIndex: 0,
      };
    });
  }, []);

  // Show question
  const handleShowQuestion = useCallback((data: { roundSequence: number; questionText: string; readMs: number }) => {
    console.log('❓ Show question:', data);
    currentRoundSequence.current = data.roundSequence;
    
    // Resetear interacción y limpiar playerWhoPressed inmediatamente
    resetInteractionState({ clearPlayerPressed: true });
    setCurrentQuestion(data.questionText);

    // Set max time for this phase (reading) so progress UI can normalize correctly
    setMaxTimeMs(data.readMs);
    setMaxTimeSeconds(Math.max(1, Math.floor(data.readMs / 1000)));

    const endTime = Date.now() + data.readMs;
    buzzerTimerRef.current = startCountdown(endTime, (remainingMs) => {
      const remaining = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeftMs(remainingMs);
      setTimeLeft(remaining);
      if (remainingMs === 0) {
        buzzerTimerRef.current = null;
      }
    });
  }, [resetInteractionState]);

  // Open buzzer
  const handleOpenButton = useCallback((data: { roundSequence: number; pressWindowMs: number }) => {
    console.log('🔘 Open button:', data);
    
    if (data.roundSequence !== currentRoundSequence.current) {
      console.warn('Stale round sequence, ignoring');
      return;
    }

    // Solo limpiar timers; mostraremos el buzzer
    clearTimers();
    setShowBuzzer(true);
    setBuzzerPressed(false);

    // Set max time for press window so progress UI is accurate (ms)
    setMaxTimeMs(data.pressWindowMs);
    setMaxTimeSeconds(Math.max(1, Math.floor(data.pressWindowMs / 1000)));

    const endTime = Date.now() + data.pressWindowMs;
    buzzerTimerRef.current = startCountdown(endTime, (remainingMs) => {
      const remaining = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeftMs(remainingMs);
      setTimeLeft(remaining);
      if (remainingMs === 0) {
        buzzerTimerRef.current = null;
      }
    });
  }, [resetInteractionState]);

  // Player won button
  const handlePlayerWonButton = useCallback((data: { roundSequence: number; playerId: string; name: string }) => {
    console.log('⚡ Player won button:', data);
    
    if (data.roundSequence !== currentRoundSequence.current) {
      console.warn('Stale round sequence, ignoring');
      return;
    }

    // Reset interacción (sin limpiar inmediatamente el player) y luego marcar que ese jugador ganó el buzzer
    resetInteractionState({ clearPlayerPressed: false });
    setBuzzerPressed(true);
    setPlayerWhoPressed(data.name);
    setPlayerWhoPressedId(data.playerId);
  }, [resetInteractionState]);

  // Answer request
  const handleAnswerRequest = useCallback((data: { 
    roundSequence: number; 
    options: string[]; 
    answerTimeoutMs: number;
    endsAt?: number;
  }) => {
    console.log('📝 Answer request:', data);
    
    if (data.roundSequence !== currentRoundSequence.current) {
      console.warn('Stale round sequence, ignoring');
      return;
    }

    // Reset timers / interaction state (no limpiar player)
    resetInteractionState({ clearPlayerPressed: false });
    setCurrentOptions(data.options);
    setShowAnswerOptions(true);

    // Configure max time for answer phase.
    // Prefer explicit `answerTimeoutMs` (server-declared duration) for progress denominator.
    // Use `endsAt` strictly as the source of truth for endTime.
    const remainingMsFromEndsAt = typeof data.endsAt === 'number' ? Math.max(0, data.endsAt - Date.now()) : undefined;
    const answerMax = typeof data.answerTimeoutMs === 'number'
      ? data.answerTimeoutMs
      : (typeof remainingMsFromEndsAt === 'number' ? remainingMsFromEndsAt : 30000);

    setAnswerMaxTimeMs(answerMax);
    setMaxTimeSeconds(Math.max(1, Math.floor(answerMax / 1000)));

    const endTime = typeof data.endsAt === 'number' ? data.endsAt : (Date.now() + answerMax);

    // Initialize displayed remaining values immediately
    const initialRemaining = typeof remainingMsFromEndsAt === 'number' ? remainingMsFromEndsAt : answerMax;
    setAnswerTimeLeftMs(initialRemaining);
    setAnswerTimeLeft(Math.max(0, Math.floor(initialRemaining / 1000)));

    answerTimerRef.current = startCountdown(endTime, (remainingMs) => {
      const remaining = Math.max(0, Math.floor(remainingMs / 1000));
      setAnswerTimeLeftMs(remainingMs);
      setAnswerTimeLeft(remaining);
      if (remainingMs === 0) {
        answerTimerRef.current = null;
      }
    });
  }, [resetInteractionState]);

  // ===== MANEJADOR CRÍTICO: round:result =====
  // Aquí actualizamos los scores después de cada respuesta
  const handleRoundResult = useCallback((data: { 
    roundSequence: number;
    playerId?: string;
    correct?: boolean | null;
    message?: string;
    correctAnswer?: string;
    scores: Record<string, number>;
  }) => {
    console.log('✅ Round result recibido:', data);
    console.log('📊 Scores del servidor:', data.scores);
    
    // Limpiar timers y resetear interacción (mantener playerWhoPressed por 1s para el UI)
    resetInteractionState({ clearPlayerPressed: false });

    // ⚠️ CRÍTICO: Actualizar scores con los datos del servidor
    if (data.scores) {
      setGameState(prev => {
        if (!prev) return prev;
        
        const updatedState = {
          ...prev,
          scores: { ...data.scores }, // Forzar actualización con nuevos scores
        };
        
        console.log('📊 Scores actualizados en estado local:', updatedState.scores);
        return updatedState;
      });
    }

    setTimeout(() => {
      setPlayerWhoPressed(null);
      setPlayerWhoPressedId(null);
    }, 1000);
  }, [resetInteractionState]);

  // ===== MANEJADOR CRÍTICO: game:ended =====
  const handleGameEnded = useCallback((data: { 
    scores: Record<string, number>;
    players?: Array<{ userId: string; name: string; score: number }>;
    winner: { userId: string; name: string; score: number };
  }) => {
    console.log('🏁 Game ended recibido:', data);
    console.log('📊 Scores finales:', data.scores);
    console.log('👥 Jugadores finales:', data.players);
    
    // Limpiar timers e interacción
    resetInteractionState({ clearPlayerPressed: false });

    // Actualizar el gameState con scores finales
    setGameState(prev => {
      if (!prev) return prev;
      
      // Normalizar players recibidos en el resultado final si vienen
      const updatedPlayers = Array.isArray(data.players)
        ? data.players.map(p => ({ userId: p.userId, name: p.name }))
        : prev.players;

      return {
        ...prev,
        scores: { ...data.scores },
        players: updatedPlayers,
        status: 'finished'
      };
    });
    
    setGameEnded(true);
    setWinner(data.winner);
    // ya fueron limpiados por resetInteractionState
  }, [resetInteractionState]);

  // Press buzzer action
  const pressBuzzer = useCallback(() => {
    if (!roomCode || waitingBuzzerAck || isBlocked) return;

    const socket = getSocket();
    if (!socket) return;

    setWaitingBuzzerAck(true);
    const eventId = `buzzer-${currentUserId}-${Date.now()}`;

    socket.emit('round:buttonPress', {
      code: roomCode,
      roundSequence: currentRoundSequence.current,
      eventId
    }, (response: { ok: boolean; message?: string }) => {
      setWaitingBuzzerAck(false);
      
      if (!response.ok) {
        console.log('Buzzer press rejected:', response.message);
      }
    });
  }, [roomCode, currentUserId, waitingBuzzerAck, isBlocked]);

  // Submit answer action
  const submitAnswer = useCallback((selectedIndex: number) => {
    if (!roomCode || waitingAnswerAck) return;

    const socket = getSocket();
    if (!socket) return;

    setWaitingAnswerAck(true);
    const eventId = `answer-${currentUserId}-${Date.now()}`;

    socket.emit('round:answer', {
      code: roomCode,
      roundSequence: currentRoundSequence.current,
      selectedIndex,
      eventId
    }, (response: { ok: boolean; correct?: boolean; message?: string }) => {
      setWaitingAnswerAck(false);
      console.log('Answer response:', response);
    });
  }, [roomCode, currentUserId, waitingAnswerAck]);

  // Setup socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    console.log('🔌 Registrando listeners de socket para room:', roomCode);

    socket.on('game:update', handleGameUpdate);
    socket.on('game:started', handleGameStarted);
    socket.on('round:showQuestion', handleShowQuestion);
    socket.on('round:openButton', handleOpenButton);
    socket.on('round:playerWonButton', handlePlayerWonButton);
    socket.on('round:answerRequest', handleAnswerRequest);
    socket.on('round:result', handleRoundResult);
    socket.on('game:ended', handleGameEnded);
    // Some server paths emit `game:finished` (timers worker), listen for it too
    socket.on('game:finished', handleGameEnded);

    // Listener para inicialización desde reconnect
    const handleGameStateInit = (event: CustomEvent) => {
      console.log('🔄 Game state init from reconnect:', event.detail);
      handleGameUpdate(event.detail);
    };

    globalThis.addEventListener('triviando:gameStateInit', handleGameStateInit as EventListener);

    return () => {
      console.log('🔌 Limpiando listeners de socket');
      socket.off('game:update', handleGameUpdate);
      socket.off('game:started', handleGameStarted);
      socket.off('round:showQuestion', handleShowQuestion);
      socket.off('round:openButton', handleOpenButton);
      socket.off('round:playerWonButton', handlePlayerWonButton);
      socket.off('round:answerRequest', handleAnswerRequest);
      socket.off('round:result', handleRoundResult);
      socket.off('game:ended', handleGameEnded);
      socket.off('game:finished', handleGameEnded);
      globalThis.removeEventListener('triviando:gameStateInit', handleGameStateInit as EventListener);
      clearTimers();
    };
  }, [
    roomCode,
    handleGameUpdate,
    handleGameStarted,
    handleShowQuestion,
    handleOpenButton,
    handlePlayerWonButton,
    handleAnswerRequest,
    handleRoundResult,
    handleGameEnded,
    clearTimers
  ]);

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
    maxTimeSeconds,
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
    timeLeftMs,
    maxTimeMs,
    answerTimeLeftMs,
    answerMaxTimeMs,
  };
};