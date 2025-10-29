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
import { GamePlayer } from '../types/game.types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

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
  } = useGameSocket(code || '');

  const { 
    messages, 
    addMessage, 
    sendMessage,
    isConnected 
  } = useChat();

  // Initialize socket connection and get user
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.id) {
      navigate('/login');
      return;
    }

    setCurrentUserId(user.id);

    // Ensure socket is connected
    const socket = getSocket();
    if (!socket || !socket.connected) {
      connectSocket(token);
    }
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
      
      socket.emit('room:reconnect', { code }, (response: any) => {
        console.log('📥 Reconnect response:', response);
        
        if (response.ok && response.room) {
          // Validar y mapear jugadores correctamente
          const roomPlayers = response.room.players || [];
          const validPlayers = roomPlayers
            .filter((p: any) => p && p.userId)
            .map((p: any) => ({
              userId: p.userId.toString ? p.userId.toString() : p.userId,
              name: p.name || 'Jugador',
            }));
          
          console.log('👥 Valid players:', validPlayers);
          setPlayers(validPlayers);
          
          // If there's gameState in the response, it means game is in progress
          if (response.room.gameState) {
            console.log('🎮 Game state restored:', response.room.gameState);
          }
          
          setIsReconnecting(false);
        } else {
          console.error('❌ Failed to reconnect:', response);
          navigate('/dashboard');
        }
      });
    };

    // Wait for socket to be connected
    if (socket.connected) {
      reconnectToRoom();
    } else {
      socket.once('connect', reconnectToRoom);
    }

    return () => {
      socket.off('connect', reconnectToRoom);
    };
  }, [code, navigate]);

  // Update players from gameState
  useEffect(() => {
    if (gameState?.players) {
      setPlayers(gameState.players);
    }
  }, [gameState]);

  // Handle chat messages
  const handleSendMessage = (messageText: string) => {
    if (!code || !currentUserId) return;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    sendMessage(messageText, code, currentUserId, user.name || 'Usuario');
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  if (!code) {
    return null;
  }

  // Show loading while reconnecting
  if (isReconnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show game result screen
  if (gameEnded && winner) {
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
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white font-bold">
            Pregunta {currentQuestionNumber}/{totalQuestions}
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
                totalQuestions={totalQuestions}
                roomCode={code}
              />
            )}

            {/* Buzzer or answer options */}
            {showAnswerOptions && currentOptions ? (
              <AnswerOptions
                options={currentOptions}
                onSelect={submitAnswer}
                timeLeft={answerTimeLeft}
              />
            ) : (
              <BuzzerButton
                showBuzzer={showBuzzer}
                buzzerPressed={buzzerPressed}
                playerWhoPressed={playerWhoPressed}
                onPress={pressBuzzer}
                isBlocked={isBlocked}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Ranking */}
            <GameRanking
              players={players}
              scores={gameState?.scores || {}}
              currentUserId={currentUserId}
            />

            {/* Chat */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ height: '400px' }}>
              <ChatPanel
                roomCode={code}
                messages={messages}
                onSendMessage={handleSendMessage}
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