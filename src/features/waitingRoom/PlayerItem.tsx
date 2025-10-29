import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { PlayerAvatar } from '../../components/ui/PlayerAvatar';

interface PlayerItemProps {
  playerId: string;
  playerName: string;
  avatarColor: string;
  isHost: boolean;
  isCurrentUser: boolean;
  index: number;
}

export const PlayerItem: React.FC<PlayerItemProps> = ({
  playerId,
  playerName,
  avatarColor,
  isHost,
  isCurrentUser,
  index
}) => {
  return (
    <motion.div
      key={playerId}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-shadow"
    >
      <PlayerAvatar 
        name={playerName} 
        color={avatarColor} 
        size="md"
        animated 
      />
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-gray-800">
            {playerName || 'Jugador desconocido'}
          </p>
          {isHost && (
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Crown size={16} className="text-yellow-500" />
            </motion.div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {isHost ? 'Anfitrión' : 'Jugador'}
          {isCurrentUser && ' (Tú)'}
        </p>
      </div>
      
      {isCurrentUser && (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </motion.div>
  );
};