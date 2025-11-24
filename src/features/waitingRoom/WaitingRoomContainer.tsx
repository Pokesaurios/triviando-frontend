import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlayersList } from './PlayersList';
import { ChatPanel } from '../chat/ChatPanel';
import { getSocket } from '../../lib/socket';
import { SOCKET_EVENTS } from '../../config/constants';
import { ChatMessage } from '../../types/chat.types';
import { Room } from '../../types/room.types';

interface WaitingRoomContainerProps {
  room: Room;
  currentUserId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isChatConnected: boolean;
}

export const WaitingRoomContainer: React.FC<WaitingRoomContainerProps> = ({
  room,
  currentUserId,
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
      let handled = false;
      try {
        socket.emit(SOCKET_EVENTS.GAME_START, { code: room.code }, (ack?: { ok?: boolean; message?: string }) => {
          handled = true;
          if (ack?.ok) {
            toast.success('¡Iniciando partida!');
            navigate(`/game/${room.code}`);
          } else {
            toast.error(ack?.message || 'Error al iniciar la partida');
          }
        });
        setTimeout(() => {
          if (!handled) {
            toast('Iniciando partida...', { duration: 3000 });
          }
        }, 2000);
      } catch (err) {
        console.error('[handleStartGame] emit error', err);
        toast.error('Error al solicitar inicio de partida');
      }
    } else {
      toast.error('No hay conexión con el servidor');
    }
  }, [canStartGame, navigate, room.code]);

  const handleLeaveRoom = useCallback(() => {
    const socket = getSocket();
    if (socket && socket.connected) {
      let completed = false;
      try {
        socket.emit('room:leave', { code: room.code }, (ack?: { ok?: boolean; message?: string }) => {
          completed = true;
          if (ack?.ok) {
            toast.success('Has abandonado la sala');
          } else if (ack?.message) {
            toast(ack.message, { duration: 3000 });
          }
          try { socket.disconnect(); } catch { /* ignore */ }
          navigate('/dashboard');
        });
      } catch (err) {
        console.warn('[handleLeaveRoom] emit error', err);
      }

      setTimeout(() => {
        if (!completed) {
          try { socket.disconnect(); } catch { /* ignore */ }
          navigate('/dashboard');
        }
      }, 1000);
      return;
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