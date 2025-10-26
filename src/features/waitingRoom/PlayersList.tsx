import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { PlayerItem } from './PlayerItem';
import { getAvatarColor } from '../../utils/avatar';

interface Player {
  userId: string;
  name: string;
}

interface PlayersListProps {
  players: Player[];
  maxPlayers: number;
  hostId: string;
  currentUserId: string;
  // Nuevas props para los botones
  isHost: boolean;
  canStartGame: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const PlayersList: React.FC<PlayersListProps> = ({
  players,
  maxPlayers,
  hostId,
  currentUserId,
  isHost,
  canStartGame,
  onStartGame,
  onLeaveRoom
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
        <div className="flex items-center gap-2 text-white">
          <Users size={24} />
          <h2 className="text-xl font-bold">
            Jugadores ({players.length}/{maxPlayers})
          </h2>
        </div>
      </div>
      
      {/* Lista de jugadores */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {players.length > 0 ? (
            players.map((player, index) => (
              <PlayerItem
                key={player.userId}
                playerId={player.userId}
                playerName={player.name}
                avatarColor={getAvatarColor(player.userId)}
                isHost={player.userId === hostId}
                isCurrentUser={player.userId === currentUserId}
                index={index}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay jugadores conectados
            </p>
          )}
        </AnimatePresence>
      </div>

      {/* Botones de acción */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {isHost ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartGame}
            disabled={!canStartGame}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            ¡Iniciar Juego!
          </motion.button>
        ) : (
          <div className="text-center py-3 bg-blue-50 rounded-xl">
            <p className="text-blue-800 font-semibold">
              Esperando a que el host inicie la partida...
            </p>
          </div>
        )}
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLeaveRoom}
          className="w-full bg-red-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          Salir de la Sala
        </motion.button>
      </div>
    </div>
  );
};