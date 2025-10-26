// app/WaitingRoomPage.tsx
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
import { connectSocket } from '../lib/socket';

export default function WaitingRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { copied, copyToClipboard } = useClipboard();
  
  // Fetch room data with automatic polling
  const { data: room, isLoading, isError, error } = useRoom(code || '', !!code);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Asegurar que el socket esté conectado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);
    }
  }, []);
  
  // Handle copy room code
  const handleCopyCode = () => {
    if (code) {
      copyToClipboard(code, 'Código copiado al portapapeles');
    }
  };
  
  // Redirect if error
  useEffect(() => {
    if (isError) {
      toast.error(error?.message || 'Error al cargar la sala');
      navigate('/dashboard');
    }
  }, [isError, error, navigate]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <DecorativeBackground />
        <LoadingSpinner />
      </div>
    );
  }
  
  // Room not found state
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
            currentUserName={currentUser.name || 'Usuario'}
          />
        </motion.div>
      </div>
    </div>
  );
}