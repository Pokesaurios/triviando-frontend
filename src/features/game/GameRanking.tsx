import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Medal } from 'lucide-react';
import { useMemo } from 'react';
import type { GamePlayer } from '../../types/game.types';

interface GameRankingProps {
  players: GamePlayer[];
  scores: Record<string, number>;
  currentUserId: string;
}

export default function GameRanking({ players, scores, currentUserId }: GameRankingProps) {
  // Ordenar jugadores por puntaje de mayor a menor
  const rankedPlayers = useMemo(() => {
    console.log('🔄 Recalculando ranking con scores:', scores);
    console.log('👥 Jugadores:', players);
    
    return [...players]
      .map(player => ({
        ...player,
        score: scores[player.userId] || 0
      }))
      .sort((a, b) => b.score - a.score);
  }, [players, scores]); // ⚠️ Dependencias críticas: recalcular cuando cambien

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Award className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">
          {index + 1}
        </div>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-400 to-yellow-600';
      case 1:
        return 'from-gray-300 to-gray-500';
      case 2:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-indigo-400 to-indigo-600';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">Ranking</h2>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {rankedPlayers.map((player, index) => {
            const isCurrentUser = player.userId === currentUserId;
            
            return (
              <motion.div
                key={player.userId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  layout: { duration: 0.3, ease: 'easeInOut' },
                  opacity: { duration: 0.2 }
                }}
                className={`relative overflow-hidden rounded-xl ${
                  isCurrentUser 
                    ? 'ring-2 ring-indigo-500 ring-offset-2' 
                    : ''
                }`}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(index)} opacity-10`} />
                
                <div className="relative flex items-center gap-3 p-4">
                  {/* Rank icon */}
                  <div className="flex-shrink-0">
                    {getRankIcon(index)}
                  </div>

                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${
                      isCurrentUser ? 'text-indigo-600' : 'text-gray-800'
                    }`}>
                      {player.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-indigo-500">(Tú)</span>
                      )}
                    </p>
                  </div>

                  {/* Score with animation */}
                  <motion.div
                    key={`score-${player.userId}-${player.score}`}
                    initial={{ scale: 1.2, color: '#10b981' }}
                    animate={{ scale: 1, color: '#1f2937' }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 text-right"
                  >
                    <p className="text-2xl font-bold text-gray-800">
                      {player.score}
                    </p>
                    <p className="text-xs text-gray-500">puntos</p>
                  </motion.div>
                </div>

                {/* Top 3 shine effect */}
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
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {rankedPlayers.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Esperando jugadores...</p>
        </div>
      )}
    </div>
  );
}