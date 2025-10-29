import { motion } from 'framer-motion';
import { Trophy, Home, Crown, Award, Medal } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import type { GamePlayer } from '../../types/game.types';

interface GameResultProps {
  winner: { userId: string; name: string; score: number };
  players: GamePlayer[];
  scores: Record<string, number>;
  onGoHome: () => void;
}

export default function GameResult({ winner, players, scores, onGoHome }: GameResultProps) {
  const { width, height } = useWindowSize();
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
  const isWinner = winner.userId === currentUserId;

  // Crear ranking completo con todos los jugadores y sus scores
  const rankedPlayers = [...players]
    .map(player => ({
      ...player,
      score: scores[player.userId] || 0
    }))
    .sort((a, b) => b.score - a.score);

  console.log('🏆 GameResult - Jugadores rankeados:', rankedPlayers);
  console.log('🏆 GameResult - Scores:', scores);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 1:
        return <Award className="w-7 h-7 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 2:
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default:
        return 'bg-gradient-to-r from-indigo-400 to-indigo-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      {/* Confetti solo si el usuario actual ganó */}
      {isWinner && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {/* Header con trofeo */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1.1, 1.1, 1.1, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="inline-block"
          >
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {isWinner ? '🎉 ¡Felicitaciones!' : '¡Juego Terminado!'}
          </h1>
          
          <p className="text-xl text-gray-600">
            {isWinner ? '¡Eres el campeón!' : `${winner.name} ganó el juego`}
          </p>
        </motion.div>

        {/* Ranking completo */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Clasificación Final
          </h2>

          {rankedPlayers.map((player, index) => {
            const isCurrentUser = player.userId === currentUserId;
            
            return (
              <motion.div
                key={player.userId}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`relative overflow-hidden rounded-xl ${
                  isCurrentUser 
                    ? 'ring-2 ring-indigo-500 ring-offset-2' 
                    : ''
                }`}
              >
                <div className={`absolute inset-0 ${getRankBadgeColor(index)} opacity-10`} />
                
                <div className="relative flex items-center gap-4 p-4">
                  {/* Rank icon or number */}
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    {getRankIcon(index) || (
                      <div className="text-2xl font-bold text-gray-400">
                        #{index + 1}
                      </div>
                    )}
                  </div>

                  {/* Player name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-lg font-bold truncate ${
                      isCurrentUser ? 'text-indigo-600' : 'text-gray-800'
                    }`}>
                      {player.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-sm text-indigo-500">(Tú)</span>
                      )}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-3xl font-bold text-gray-800">
                      {player.score}
                    </p>
                    <p className="text-xs text-gray-500">puntos</p>
                  </div>
                </div>

                {/* Shine effect for top 3 */}
                {index < 3 && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: 'linear'
                    }}
                  >
                    <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Winner stats destacados */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-semibold opacity-90 mb-1">🏆 Campeón</p>
              <p className="text-2xl font-bold">{winner.name}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{winner.score}</p>
              <p className="text-sm opacity-90">puntos</p>
            </div>
          </div>
        </motion.div>

        {/* Botón para volver */}
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onGoHome}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Home className="w-5 h-5" />
          Volver al inicio
        </motion.button>
      </motion.div>
    </div>
  );
}