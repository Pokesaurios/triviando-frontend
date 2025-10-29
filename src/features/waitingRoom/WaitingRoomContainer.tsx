import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlayersList } from './PlayersList';
import { ChatPanel } from '../chat/ChatPanel';
import { getSocket } from '../../lib/socket';

interface Room {
  code: string;
  hostId: string;
  maxPlayers: number;
  status: string;
  players: Array<{ userId: string; name: string }>;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
}

interface WaitingRoomContainerProps {
  room: Room;
  currentUserId: string;
  currentUserName: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isChatConnected: boolean;
}

export const WaitingRoomContainer: React.FC<WaitingRoomContainerProps> = ({
  room,
  currentUserId,
  currentUserName,
  messages,
  onSendMessage,
  isChatConnected
}) => {
  const navigate = useNavigate();

  // Validación de seguridad para players
  const players = room?.players || [];
  const isHost = room?.hostId === currentUserId;
  const canStartGame = players.length >= 2;

  const handleStartGame = useCallback(() => {
    if (!canStartGame) {
      toast.error('Se necesitan al menos 2 jugadores para iniciar');
      return;
    }
    
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('game:start', { code: room.code });
      toast.success('¡Iniciando partida!');
      navigate(`/game/${room.code}`);
    } else {
      toast.error('No hay conexión con el servidor');
    }
  }, [canStartGame, navigate, room.code]);

  const handleLeaveRoom = useCallback(() => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('room:leave', { code: room.code });
    }
    navigate('/dashboard');
  }, [navigate, room.code]);

  const handleSendMessage = useCallback((messageText: string) => {
    if (!isChatConnected) {
      toast.error('No hay conexión. Intenta de nuevo.');
      return;
    }
    
    if (!messageText.trim()) {
      return;
    }
    
    onSendMessage(messageText);
  }, [onSendMessage, isChatConnected]);

  useEffect(() => {
    if (room?.status === 'playing' || room?.status === 'in-game') {
      navigate(`/game/${room.code}`);
    }
  }, [room?.status, room?.code, navigate]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Players Column */}
      <div className="lg:col-span-1">
        <PlayersList
          players={players}
          maxPlayers={room?.maxPlayers || 8}
          hostId={room?.hostId || ''}
          currentUserId={currentUserId}
          isHost={isHost}
          canStartGame={canStartGame}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>

      {/* Chat Column */}
      <div className="lg:col-span-2">
        <ChatPanel
          messages={messages}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          isConnected={isChatConnected}
        />
      </div>
    </div>
  );
};