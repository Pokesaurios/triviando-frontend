import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { LogoHeader } from '../components/ui/LogoHeader';
import { MenuButton } from '../components/ui/MenuButton';
import { Trophy, Calendar, Brain, Zap, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getGameResults } from '../lib/services/statsServices';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { GameResultType } from '../types/stats.types';

interface PlayerStats {
  totalGames: number;
  totalScore: number;
  correctAnswers: number;
  wrongAnswers: number;
  averageScore: number;
  accuracy: number;
  bestScore: number;
  gamesWon: number;
  topicsPlayed: { [key: string]: number };
  recentGames: GameResultType[];
}

export default function StatsPage() {
  const navigate = useNavigate();
  const userData = localStorage.getItem('user');
  // localStorage user is normalized (id, name, email)
  const userId = userData ? JSON.parse(userData).id : '';
  const username = userData ? JSON.parse(userData).name : 'Trivia';

  const { data: gameResults, isLoading } = useQuery({
    queryKey: ['gameResults', userId],
    queryFn: getGameResults
  });

  const userGames = gameResults?.filter(game => 
    game.players.some(player => player.name === username)
  );

  const stats: PlayerStats = userGames?.length ? {
    totalGames: userGames.length,
    totalScore: userGames.reduce((acc, game) => {
      const userScore = game.scores[userId] || 0;
      return acc + userScore;
    }, 0),
    correctAnswers: 0, // This information is not available in the current API
    wrongAnswers: 0, // This information is not available in the current API
    averageScore: userGames.reduce((acc, game) => {
      const userScore = game.scores[userId] || 0;
      return acc + userScore;
    }, 0) / userGames.length,
    accuracy: 0, // This information is not available in the current API
    bestScore: Math.max(...userGames.map(game => game.scores[userId] || 0)),
    gamesWon: userGames.filter(game => game.winner?.userId === userId).length,
    topicsPlayed: userGames.reduce((acc: {[key: string]: number}, game) => {
      const topic = game.triviaId.topic ?? 'Sin tema';
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {}),
    recentGames: [...userGames]
      .sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime())
      .slice(0, 5)
  } : {
    totalGames: 0,
    totalScore: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    averageScore: 0,
    accuracy: 0,
    bestScore: 0,
    gamesWon: 0,
    topicsPlayed: {},
    recentGames: []
  };

  // Removed duplicate declarations of userData, user, and username

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const handleBack = () => navigate('/dashboard');
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <AnimatedBackground />

      {/* Header reutilizable */}
      <div className="absolute top-4 right-4 z-20">
        <MenuButton onLogout={handleLogout} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 mt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.button
              onClick={handleBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-xl hover:bg-white/30 transition-all shadow-lg"
            >
              <ArrowLeft size={32} />
            </motion.button>

            <LogoHeader variant="dashboard" />

            <div className="w-12" />
          </div>

          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center bg-white rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg"
              >
                {username.charAt(0).toUpperCase()}
              </motion.div>
              <div className="text-left">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {username}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tarjetas principales */}
        <div className="grid lg:grid-cols-4 gap-4 mb-6">
          
        </div>

        {/* Sección de partidas jugadas y tematicas */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Partidas jugadas */}
            <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-400 to-green-600 p-5 text-white font-bold flex items-center gap-3">
              <Zap size={24} />
                <h2 className="text-xl">Partidas Jugadas</h2>
            </div>
            <div className="p-6 space-y-4 max-h-80 overflow-y-auto flex flex-col items-center">
                <div className="flex justify-between mb-3 w-full"></div>
                <p className="text-3xl font-bold text-gray-800"> {stats.totalGames} Partidas</p>
            </div>

          </motion.div>

          {/* Tematicas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-5 text-white font-bold flex items-center gap-3">
              <Brain size={24} />
              <h2 className="text-xl">Tematicas</h2>
            </div>
            <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
              {Object.entries(stats.topicsPlayed)
                .sort((a, b) => b[1] - a[1])
                .map(([topic, count], index) => (
                  <TopicsBar key={topic} index={index} topic={topic} count={count}
                    max={Math.max(...Object.values(stats.topicsPlayed))} />
                ))}
            </div>
          </motion.div>
        </div>

        {/* Últimas partidas */}
        <RecentGames games={stats.recentGames} />
      </div>
    </div>
  );
}

/* ─── COMPONENTES AUXILIARES ────────────────────────────── */

function TopicsBar({ index, topic, count, max }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 + index * 0.1 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-800 font-semibold">{topic}</span>
        <span className="text-xl font-bold text-purple-600">{count}</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(count / max) * 100}%` }}
          transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
          className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full shadow-lg"
        />
      </div>
    </motion.div>
  );
}

function RecentGames({ games }: { games: GameResultType[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="bg-white rounded-3xl shadow-2xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-5 text-white font-bold flex items-center gap-3">
        <Calendar size={24} />
        <h2 className="text-xl">Últimas Partidas</h2>
      </div>
      <div className="p-6 grid gap-4">
        {games.map((game, index) => {
          const isWinner = game.winner?.userId;
          const playerScore = game.winner?.score || 0;
          const date = new Date(game.finishedAt).toLocaleDateString();
          
          return (
            <motion.div
              key={game.roomCode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all border-l-4"
              style={{
                borderLeftColor: isWinner ? '#fbbf24' : '#9ca3af'
              }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                    {game.players.length}
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">{date}</p>
                    <p className="text-2xl font-bold text-gray-800">{playerScore} pts</p>
                    <p className="text-sm text-gray-600">{game.triviaId.topic}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 font-semibold">Jugadores</p>
                    <p className="text-xl font-bold text-blue-600">{game.players.length}</p>
                  </div>
                  {game.winner && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 font-semibold">Ganador</p>
                      <p className="text-xl font-bold text-green-600">{game.winner.name}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {game.winner && (
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      >
                        <Trophy className="text-yellow-500" size={32} />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
