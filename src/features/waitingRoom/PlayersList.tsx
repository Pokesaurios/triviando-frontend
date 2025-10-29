import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { PlayerItem } from './PlayerItem';
import { getAvatarColor } from '../../utils/avatar';

interface Player {
  userId: string;
  name: string;
  joinedAt?: Date;
}

interface PlayersListProps {
  players: Player[];
  maxPlayers: number;
  hostId: string;
  currentUserId: string;
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

  const validPlayers = Array.isArray(players) ? players : [];
  
  validPlayers.forEach(player => {
    console.log(`Player ID: ${player.userId} | Name: "${player.name || 'FALTA NOMBRE'}" | Type: ${typeof player.name}`);
  });

  const normalizedPlayers = validPlayers.map(player => ({
    ...player,
    name: player.name && player.name.trim() !== '' 
      ? player.name 
      : 'Usuario Desconocido'
  }));

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
        <div className="flex items-center gap-2 text-white">
          <Users size={24} />
          <h2 className="text-xl font-bold">
            Jugadores ({normalizedPlayers.length}/{maxPlayers})
          </h2>
        </div>
      </div>
      
      {/* Lista de jugadores */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {normalizedPlayers.length > 0 ? (
            normalizedPlayers.map((player, index) => {
              
              return (
                <PlayerItem
                  key={player.userId}
                  playerId={player.userId}
                  playerName={player.name}
                  avatarColor={getAvatarColor(player.userId)}
                  isHost={player.userId === hostId}
                  isCurrentUser={player.userId === currentUserId}
                  index={index}
                />
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-gray-500 text-center py-4">
                No hay jugadores conectados
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Botones de acción */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {isHost ? (
          <motion.button
            whileHover={{ scale: canStartGame ? 1.02 : 1 }}
            whileTap={{ scale: canStartGame ? 0.98 : 1 }}
            onClick={onStartGame}
            disabled={!canStartGame}
            className={`w-full font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              canStartGame
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canStartGame ? (
              <>
                ¡Iniciar Juego!
              </>
            ) : (
              <>
                Esperando más jugadores (mín. 2)
              </>
            )}
          </motion.button>
        ) : (
          <div className="text-center py-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-blue-800 font-semibold">
              Esperando a que el host inicie la partida...
            </p>
          </div>
        )}
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLeaveRoom}
          className="w-full bg-red-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2"
        >
          Salir de la Sala
        </motion.button>
      </div>
    </div>
  );
};