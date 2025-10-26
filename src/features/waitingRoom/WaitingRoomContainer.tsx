import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlayersList } from './PlayersList';
import { ChatPanel } from './ChatPanel';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from '../../types/chat.types';
import { getAvatarColor } from '../../utils/avatar';

interface Room {
  code: string;
  hostId: string;
  maxPlayers: number;
  status: string;
  players: Array<{ userId: string; name: string }>;
}

interface WaitingRoomContainerProps {
  room: Room;
  currentUserId: string;
  currentUserName: string;
}

export const WaitingRoomContainer: React.FC<WaitingRoomContainerProps> = ({
  room,
  currentUserId,
  currentUserName
}) => {
  const navigate = useNavigate();
  const { messages, addMessage } = useChat();
  
  // Validación de seguridad para players
  const players = room?.players || [];
  const isHost = room?.hostId === currentUserId;
  const canStartGame = players.length >= 2;

  const handleStartGame = useCallback(() => {
    if (!canStartGame) {
      toast.error('Se necesitan al menos 2 jugadores para iniciar');
      return;
    }
    toast.success('¡Iniciando partida!');
    navigate(`/game/${room.code}`);
  }, [canStartGame, navigate, room.code]);

  const handleLeaveRoom = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleSendMessage = useCallback((messageText: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      player_id: currentUserId,
      username: currentUserName,
      message: messageText,
      created_at: new Date().toISOString(),
      avatar_color: getAvatarColor(currentUserId)
    };
    addMessage(message);
  }, [currentUserId, currentUserName, addMessage]);

  // Redirect when game starts
  useEffect(() => {
    if (room?.status === 'playing') {
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
        />
      </div>
    </div>
  );
};