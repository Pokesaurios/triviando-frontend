import { motion } from 'framer-motion';
import { Trophy, Award } from 'lucide-react';
import { GamePlayer } from '../../types/game.types';

interface GameResultProps {
  winner: { userId: string; name: string; score: number };
  players: GamePlayer[];
  scores: Record<string, number>;
  onGoHome: () => void;
}

export default function GameResult({ winner, players, scores, onGoHome }: GameResultProps) {
  // Validar jugadores
  const validPlayers = players.filter(p => p && p.userId && p.name);
  
  const rankedPlayers = validPlayers
    .map((player) => ({
      ...player,
      score: scores[player.userId] || 0,
      name: player.name || 'Jugador',
    }))
    .sort((a, b) => b.score - a.score);

  const getAvatarColor = (index: number) => {
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#3B82F6', '#8B5CF6', '#EC4899'];
    return colors[index % colors.length];
  };

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🏅';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {['🎉', '🎊', '✨', '🌟', '⭐'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Winner section */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-8 text-center">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              <Trophy className="w-24 h-24 mx-auto text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold text-white mb-2">¡Juego Terminado!</h1>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mt-6"
            >
              <p className="text-white text-2xl font-semibold mb-2">Ganador</p>
              <p className="text-white text-4xl font-bold">{winner.name}</p>
              <p className="text-white text-6xl font-bold mt-2">{winner.score} pts</p>
            </motion.div>
          </div>

          {/* Podium section */}
          <div className="p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Award className="text-purple-600" size={28} />
              <h2 className="text-3xl font-bold text-gray-800">Clasificación Final</h2>
            </div>

            <div className="space-y-3">
              {rankedPlayers.map((player, index) => (
                <motion.div
                  key={player.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="text-4xl">{getMedalEmoji(index)}</div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: getAvatarColor(index) }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg">{player.name}</p>
                    <p className="text-gray-600 text-sm">Posición #{index + 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      {player.score}
                    </p>
                    <p className="text-gray-500 text-sm">puntos</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGoHome}
              className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              Volver al Inicio
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}