import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../lib/socket';
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
}

export function useGameSocket(roomCode: string): UseGameSocketReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentOptions, setCurrentOptions] = useState<string[] | null>(null);
  const [showBuzzer, setShowBuzzer] = useState(false);
  const [buzzerPressed, setBuzzerPressed] = useState(false);
  const [playerWhoPressed, setPlayerWhoPressed] = useState<string | null>(null);
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUserId(user.id || '');
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

    socket.on('game:started', handleGameStarted);
    return () => {
      socket.off('game:started', handleGameStarted);
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

    socket.on('round:showQuestion', handleShowQuestion);
    return () => {
      socket.off('round:showQuestion', handleShowQuestion);
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

    socket.on('round:openButton', handleOpenButton);
    return () => {
      socket.off('round:openButton', handleOpenButton);
    };
  }, [currentRoundSequence]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handlePlayerWonButton = (data: RoundPlayerWonButtonEvent) => {
      console.log('⚡ Player won button:', data);
      if (data.roundSequence === currentRoundSequence) {
        setBuzzerPressed(true);
        setPlayerWhoPressed(data.name);
        setShowBuzzer(false);
      }
    };

    socket.on('round:playerWonButton', handlePlayerWonButton);
    return () => {
      socket.off('round:playerWonButton', handlePlayerWonButton);
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

    socket.on('round:answerRequest', handleAnswerRequest);
    return () => {
      socket.off('round:answerRequest', handleAnswerRequest);
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

    socket.on('round:result', handleResult);
    return () => {
      socket.off('round:result', handleResult);
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

    socket.on('game:ended', handleGameEnded);
    return () => {
      socket.off('game:ended', handleGameEnded);
    };
  }, [gameState]);

  const pressBuzzer = useCallback(() => {
    const socket = getSocket();
    if (!socket || !showBuzzer || buzzerPressed) return;
    
    const eventId = `buzz-${Date.now()}-${Math.random()}`;
    console.log('🔴 Pressing buzzer:', { roomCode, currentRoundSequence, eventId });
    
    socket.emit('round:buttonPress', {
      code: roomCode,
      roundSequence: currentRoundSequence,
      eventId,
    });
  }, [showBuzzer, buzzerPressed, roomCode, currentRoundSequence]);

  const submitAnswer = useCallback((selectedIndex: number) => {
    const socket = getSocket();
    if (!socket || !showAnswerOptions) return;
    
    const eventId = `answer-${Date.now()}-${Math.random()}`;
    console.log('📝 Submitting answer:', { roomCode, currentRoundSequence, selectedIndex, eventId });
    
    socket.emit('round:answer', {
      code: roomCode,
      roundSequence: currentRoundSequence,
      selectedIndex,
      eventId,
    });
    setShowAnswerOptions(false);
  }, [showAnswerOptions, roomCode, currentRoundSequence]);

  const isBlocked = gameState?.blocked?.[currentUserId] || false;

  return {
    gameState,
    currentQuestion,
    currentOptions,
    showBuzzer,
    buzzerPressed,
    playerWhoPressed,
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
  };
}