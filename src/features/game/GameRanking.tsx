import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { GamePlayer } from '../../types/game.types';

interface GameRankingProps {
  players: GamePlayer[];
  scores: Record<string, number>;
  currentUserId: string;
}

export default function GameRanking({ players, scores, currentUserId }: GameRankingProps) {
  // Validar y filtrar jugadores válidos
  const validPlayers = players.filter(p => p && p.userId && p.name);

  const rankedPlayers = validPlayers
    .map((player) => ({
      ...player,
      score: scores[player.userId] || 0,
    }))
    .sort((a, b) => b.score - a.score);

  const getAvatarColor = (index: number) => {
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];
    return colors[index % colors.length];
  };

  // Si no hay jugadores válidos, mostrar mensaje
  if (rankedPlayers.length === 0) {
    return (
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
        <div className="p-4">
          <p className="text-gray-500 text-center">Cargando jugadores...</p>
        </div>
      </motion.div>
    );
  }

  return (
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

      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {rankedPlayers.map((player, index) => {
          const playerName = player.name || 'Jugador';
          const isCurrentUser = player.userId === currentUserId;
          
          return (
            <motion.div
              key={player.userId || index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                isCurrentUser
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lg font-bold text-gray-600 w-6">{index + 1}</span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: getAvatarColor(index) }}
                >
                  {playerName.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-gray-800 text-sm truncate">
                  {playerName}
                </span>
              </div>
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                {player.score}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}