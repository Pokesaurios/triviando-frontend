import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { LogoHeader } from '../components/ui/LogoHeader';
import { Alert } from '../components/ui/Alert';
import { useJoinRoom } from '../hooks/useRoom';
import toaster from 'react-hot-toast';

export default function JoinRoomPage() {
  const [roomCode, setRoomCode] = useState('');
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const navigate = useNavigate();
  const joinRoomMutation = useJoinRoom();
  
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomCode.trim()) {
      setAlert({ type: 'error', text: 'Por favor ingresa un código de sala' });
      return;
    }

    if (roomCode.length !== 6) {
      setAlert({ type: 'error', text: 'El código debe tener 6 caracteres' });
      return;
    }

    joinRoomMutation.mutate({ code: roomCode.toUpperCase() });
  };

  // Manejar redirección cuando se une exitosamente
  useEffect(() => {
    if (joinRoomMutation.isSuccess && joinRoomMutation.data?.room) {
      toaster.success('¡Te has unido a la sala! 🎉');
      navigate(`/room/${joinRoomMutation.data.room.code}`);
    }
  }, [joinRoomMutation.isSuccess, joinRoomMutation.data, navigate]);

  // Manejar errores
  useEffect(() => {
    if (joinRoomMutation.isError) {
      const errorMessage = joinRoomMutation.error?.message || 'Error al unirse a la sala';
      setAlert({ type: 'error', text: errorMessage });
      toaster.error(errorMessage);
    }
  }, [joinRoomMutation.isError, joinRoomMutation.error]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-b from-purple-500 to-purple-600">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-xl"
      >
        <motion.div
          className="bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-3xl shadow-2xl overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="relative">
            
            <LogoHeader variant="dashboard" />
            <div className="bg-white p-8 mt-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Unirse a una Sala
              </h2>
              <form onSubmit={handleJoinRoom} className="space-y-5">
                <div>
                  <label htmlFor="roomCode" className="block text-sm font-bold text-gray-700 mb-2">
                    Código de la Sala
                  </label>
                  <input
                    id="roomCode"
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    disabled={joinRoomMutation.isPending}
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors text-gray-600 text-center text-2xl font-bold tracking-widest disabled:bg-gray-100"
                    placeholder="X4BZ7Q"
                  />
                  {alert?.type === 'error' && (
                    <div className="mt-2">
                      <Alert message={{ type: 'error', text: alert?.text ?? '' }} />
                    </div>
                  )}
                </div>
                <div className="space-y-3 pt-2">
                  <motion.button
                    whileHover={{ scale: joinRoomMutation.isPending ? 1 : 1.05, y: joinRoomMutation.isPending ? 0 : -2 }}
                    whileTap={{ scale: joinRoomMutation.isPending ? 1 : 0.95 }}
                    type="submit"
                    disabled={joinRoomMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    
                    {joinRoomMutation.isPending ? 'Uniéndose...' : 'Unirse a la Sala'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleBack}
                    disabled={joinRoomMutation.isPending}
                    className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    Volver
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}