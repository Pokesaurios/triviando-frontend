// noinspection GrazieInspection

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameSocket } from '../hooks/useGameSocket';
import { useChat } from '../hooks/useChat';
import QuestionDisplay from '../features/game/QuestionDisplay';
import BuzzerButton from '../features/game/BuzzerButton';
import AnswerOptions from '../features/game/AnswerOptions';
import GameRanking from '../features/game/GameRanking';
import GameResult from '../features/game/GameResult';
import { ChatPanel } from '../features/chat/ChatPanel';
import { getSocket, connectSocket } from '../lib/socket';
import type { ReconnectResponse } from '../types/room.types';
import { normalizePlayer } from '../lib/api/normalizers';
import { GamePlayer } from '../types/game.types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useRoomSocket } from '../hooks/useRoomSocket';

export default function GamePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isReconnecting, setIsReconnecting] = useState(true);

  const {
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
    currentQuestionNumber,
    gameEnded,
    winner,
    pressBuzzer,
    submitAnswer,
    isBlocked,
    waitingBuzzerAck,
    waitingAnswerAck,
  } = useGameSocket(code || '');

  const { 
    messages, 
    addMessage, 
    sendMessage, 
    isConnected,
    loadChatHistory 
  } = useChat();

  const { connected } = useRoomSocket(code || '', {
    onNewMessage: addMessage
  });

  // Initialize socket connection and get user
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.id) {
      navigate('/login');
      return;
    }

    const socket = getSocket();
    if (!socket?.connected) {
      connectSocket(token as string);
    }

    const rafId = requestAnimationFrame(() => setCurrentUserId(user.id));
    return () => cancelAnimationFrame(rafId);
  }, [navigate]);

  // Reconnect to room and get initial state
  useEffect(() => {
    if (!code) {
      navigate('/dashboard');
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    const reconnectToRoom = () => {
      console.log('🔄 Reconnecting to room:', code);
      
      socket.emit('room:reconnect', { code }, (response: ReconnectResponse) => {
        console.log('📥 Reconnect response:', response);
        if (response.ok && response.room) {
          const roomPlayers = response.room.players || [];
          const normalized = (roomPlayers || []).map((p: any) => normalizePlayer(p as any));
          // Mapear al tipo GamePlayer usado en GamePage
          const validPlayers: GamePlayer[] = normalized.map((p) => ({ userId: p.userId, name: p.name }));
          console.log('👥 Valid players (normalized):', validPlayers);
          setPlayers(validPlayers);
          
          if (response.room.gameState) {
            console.log('🎮 Game state restored:', response.room.gameState);
            try {
              window.dispatchEvent(new CustomEvent('triviando:gameStateInit', { 
                detail: response.room.gameState 
              }));
            } catch (err) {
              console.warn('Unable to dispatch gameStateInit event:', err);
            }
          }
          
          setIsReconnecting(false);
        } else {
          console.error('❌ Failed to reconnect:', response);
          navigate('/dashboard');
        }
      });
    };

    if (socket.connected) {
      reconnectToRoom();
    } else {
      socket.once('connect', reconnectToRoom);
    }

    return () => {
      socket.off('connect', reconnectToRoom);
    };
  }, [code, navigate]);

  // ⚠️ CRÍTICO: Actualizar players desde gameState cuando cambien
  useEffect(() => {
    if (gameState?.players && gameState.players.length > 0) {
      console.log('🔄 Actualizando players desde gameState:', gameState.players);
      const rafId = requestAnimationFrame(() => setPlayers(gameState.players));
      return () => cancelAnimationFrame(rafId);
    }
  }, [gameState?.players]);

  // ⚠️ CRÍTICO: Log de scores cada vez que cambien
  useEffect(() => {
    if (gameState?.scores) {
      console.log('📊 Scores actualizados en GamePage:', gameState.scores);
    }
  }, [gameState?.scores]);

  // Handle chat messages
  const handleSendMessage = (messageText: string) => {
    if (!code || !currentUserId) return;
    sendMessage(messageText, code);
  };

  useEffect(() => {
    if (code && connected) {
      loadChatHistory(code);
    }
  }, [code, connected, loadChatHistory]);

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  if (!code) {
    return null;
  }

  if (isReconnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // ⚠️ CRÍTICO: Pasar scores directamente desde gameState
  if (gameEnded && winner) {
    console.log('🏁 Renderizando GameResult con scores:', gameState?.scores);
    console.log('🏁 Renderizando GameResult con players:', players);
    
    return (
      <GameResult
        winner={winner}
        players={players}
        scores={gameState?.scores || {}}
        onGoHome={handleGoHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white font-bold">
              Pregunta {currentQuestionNumber}
            </div>
          </div>

        <div className="grid lg:grid-cols-4 gap-4">
          {/* Main game area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Question display */}
            {currentQuestion && (
              <QuestionDisplay
                question={currentQuestion}
                timeLeft={timeLeft}
                questionNumber={currentQuestionNumber}
                roomCode={code}
              />
            )}

            {/* Buzzer or answer options */}
            {showAnswerOptions && currentOptions ? (
              playerWhoPressedId && playerWhoPressedId === currentUserId ? (
                <AnswerOptions
                  options={currentOptions}
                  onSelect={submitAnswer}
                  timeLeft={answerTimeLeft}
                  isWaitingAck={waitingAnswerAck}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-2xl p-8 text-center"
                >
                  <div className="text-6xl mb-4">⚡</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {playerWhoPressed || 'Un jugador'} está respondiendo...
                  </h3>
                  <p className="text-gray-600">Tiempo restante: {answerTimeLeft}s</p>
                </motion.div>
              )
            ) : (
              <BuzzerButton
                showBuzzer={showBuzzer}
                buzzerPressed={buzzerPressed}
                playerWhoPressed={playerWhoPressed}
                onPress={pressBuzzer}
                isBlocked={isBlocked}
                isWaitingAck={waitingBuzzerAck}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* ⚠️ CRÍTICO: Pasar scores actualizados desde gameState */}
            <GameRanking
              players={players}
              scores={gameState?.scores || {}}
              currentUserId={currentUserId}
            />

            {/* Chat */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full">
              <ChatPanel
                messages={messages}
                currentUserId={currentUserId}
                onSendMessage={handleSendMessage}
                isConnected={isConnected}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="fixed top-1/2 left-8 hidden xl:block pointer-events-none"
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="text-7xl opacity-30">❓</div>
      </motion.div>

      <motion.div
        className="fixed bottom-8 left-8 hidden xl:block pointer-events-none"
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="text-6xl opacity-30">💡</div>
      </motion.div>
    </div>
  );
}