import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RoomCodeCard } from '../components/ui/RoomCodeCard';
import { DecorativeBackground } from '../components/ui/DecorativeBackground';
import { WaitingRoomContainer } from '../features/waitingRoom/WaitingRoomContainer';
import { useRoom } from '../hooks/useRoom';
import { useClipboard } from '../hooks/useClipboard';
import { useRoomSocket } from '../hooks/useRoomSocket';
import { useChat } from '../hooks/useChat';
import { connectSocket, getSocket } from '../lib/socket';
import { SOCKET_EVENTS } from '../config/constants';

export default function WaitingRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { copied, copyToClipboard } = useClipboard();
  
  const { 
    messages, 
    addMessage, 
    sendMessage, 
    isConnected,
    loadChatHistory 
  } = useChat();
  
  const { connected } = useRoomSocket(code || '', {
    onNewMessage: addMessage
  });
  
  const { data: room, isLoading, isError, error } = useRoom(
    code || '', 
    !!code,
    connected
  );
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const socket = getSocket();
      if (!socket || !socket.connected) {
        connectSocket(token);
      }
    }
  }, []);
  
  useEffect(() => {
    if (code && connected) {
      loadChatHistory(code);
    }
  }, [code, connected, loadChatHistory]);

  const handleCopyCode = () => {
    if (code) {
      copyToClipboard(code, 'Código copiado al portapapeles');
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || 'Error al cargar la sala');
      navigate('/dashboard');
    }
  }, [isError, error, navigate]);

  // Escuchar evento de nuevo jugador uniéndose
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleRoomUpdate = (data: any) => {
      // Solo mostrar notificación si un jugador se unió y no es el usuario actual
      if (data.event === 'playerJoined' && data.player) {
        console.log(`${data.player.name} se unió a la sala 🎉`);
        toast.success(`${data.player.name} se unió a la sala 🎉`, {
          duration: 3000,
          position: 'top-center',
        });
      }
    };

    socket.on(SOCKET_EVENTS.ROOM_UPDATE, handleRoomUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_UPDATE, handleRoomUpdate);
    };
  }, [currentUser.id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleGameStarted = () => {
      toast.success('¡El juego ha comenzado!');
      navigate(`/game/${code}`);
    };

    socket.on(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);

    return () => {
      socket.off(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);
    };
  }, [code, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <DecorativeBackground />
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <DecorativeBackground />
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Sala no encontrada</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <DecorativeBackground particleCount={15} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <RoomCodeCard 
            code={code || ''} 
            copied={copied} 
            onCopy={handleCopyCode} 
          />
        </motion.div>
        
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WaitingRoomContainer
            room={room}
            currentUserId={currentUser.id}
            messages={messages}
            onSendMessage={(messageText) => {
              if (!code || !currentUser.id) return;
              sendMessage(messageText, code);
            }}
            isChatConnected={isConnected}
          />
        </motion.div>
      </div>
    </div>
  );
}