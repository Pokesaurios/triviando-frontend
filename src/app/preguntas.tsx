import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Trophy, MessageCircle } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  avatar_color: string;
  score: number;
}



interface QuestionScreenProps {
  question?: string;
  category?: string;
  difficulty?: string;
  players?: Player[];
  currentPlayer?: { id: string; username: string };
  roomCode?: string;
  questionNumber?: number;
  totalQuestions?: number;
}

export default function QuestionScreen({
  question = "¿Cuál es el lenguaje de programación más utilizado en desarrollo web?",
  players = [
    { id: '1', username: 'Jugador1', avatar_color: '#3B82F6', score: 150 },
    { id: '2', username: 'TriviaKing', avatar_color: '#8B5CF6', score: 120 },
    { id: '3', username: 'QuizMaster', avatar_color: '#EC4899', score: 100 },
  ],
  currentPlayer = { id: '1', username: 'Jugador1' },
  roomCode = 'ABC123',
  questionNumber = 3,
  totalQuestions = 10
}: QuestionScreenProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [showBuzzer, setShowBuzzer] = useState(false);
  const [buzzerPressed, setBuzzerPressed] = useState(false);
  const [playerWhoPressed, setPlayerWhoPressed] = useState<string | null>(null);


  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowBuzzer(true);
    }
  }, [timeLeft]);

 
  const handleBuzzerPress = () => {
    if (!buzzerPressed) {
      setBuzzerPressed(true);
      setPlayerWhoPressed(currentPlayer.username);
    }
  };


  const getTimerColor = () => {
    if (timeLeft > 20) return 'from-green-400 to-green-600';
    if (timeLeft > 10) return 'from-yellow-400 to-orange-500';
    return 'from-red-500 to-red-700';
  };

  const getTimerPercentage = () => (timeLeft / 30) * 100;


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
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
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">


          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white font-bold">
            Pregunta {questionNumber}/{totalQuestions}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <p className="text-sm opacity-90">Sala: {roomCode}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="text-white" size={24} />
                    <span className="text-white text-2xl font-bold">{timeLeft}s</span>
                  </div>
                </div>

                <div className="mt-3 bg-white/30 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${getTimerColor()}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${getTimerPercentage()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="p-8">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-center"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 leading-tight">
                    {question}
                  </h2>

                  {!showBuzzer && (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl"
                    >
                      🤔
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>

            <AnimatePresence>
              {showBuzzer && !buzzerPressed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className="flex justify-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBuzzerPress}
                    className="relative group"
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(239, 68, 68, 0.5)',
                          '0 0 60px rgba(239, 68, 68, 0.8)',
                          '0 0 20px rgba(239, 68, 68, 0.5)',
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-48 h-48 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-2xl"
                    >
                      <Zap size={80} className="text-white" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-red-400 rounded-full opacity-30 blur-xl"
                    />
                  </motion.button>
                </motion.div>
              )}

              {buzzerPressed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-400 to-green-600 rounded-3xl shadow-2xl p-8 text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl mb-4"
                  >
                    ⚡
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    ¡{playerWhoPressed} presionó el buzzer!
                  </h3>
                  <p className="text-white text-lg opacity-90">
                    Esperando respuesta...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                <div className="flex items-center gap-2 text-white">
                  <Trophy size={20} />
                  <h3 className="font-bold">Ranking</h3>
                </div>
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        player.id === currentPlayer.id
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-lg font-bold text-gray-600 w-6">
                          {index + 1}
                        </span>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: player.avatar_color }}
                        >
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800 text-sm truncate">
                          {player.username}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                        {player.score}
                      </span>
                    </motion.div>
                  ))}
              </div>
            </motion.div>

            <div className="lg:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{ height: '400px' }}
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                <div className="flex items-center gap-2 text-white">
                  <MessageCircle size={20} />
                  <h3 className="font-bold">Chat</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gradient-to-b from-gray-50 to-white">
              </div>

              
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        className="fixed top-1/2 left-8 hidden xl:block pointer-events-none"
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
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
          ease: "easeInOut",
        }}
      >
        <div className="text-6xl opacity-30">💡</div>
      </motion.div>
    </div>
  );
}