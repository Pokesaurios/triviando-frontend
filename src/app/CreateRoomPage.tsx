import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { LogoHeader } from '../components/ui/LogoHeader';
import { MenuButton } from '../components/ui/MenuButton';
import { ChevronRight, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toaster from 'react-hot-toast';
import { Alert } from '../components/ui/Alert';
import { validateMaxPlayers, validateTopic } from '../utils/validation';

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    const topicValidation = validateTopic(topic);
    if (!topicValidation) {
      setAlert({ type: 'error', text: 'El tema no puede estar vacío.' });
      return;
    }

    const maxPlayersValidation = validateMaxPlayers(Number(maxPlayers));
    if (!maxPlayersValidation.isValid) {
      setAlert({ type: 'error', text: maxPlayersValidation.error! });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          maxPlayers: Number(maxPlayers),
          quantity: Number(numQuestions),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error creando la sala');

      toaster.success('¡Sala creada exitosamente! 🎉');
      setRoomCode(data.code);
    } catch (err: unknown) {
      let message = 'Error desconocido';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      toaster.error(message);
      setAlert({ type: 'error', text: message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      toaster.success('Código copiado 📋');
    }
  };

  const handleGoToRoom = () => {
    if (roomCode) navigate(`/room/${roomCode}`);
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
            <div className="absolute top-0 right-0 z-20">
              <MenuButton onLogout={handleLogout} />
            </div>

            <LogoHeader variant="dashboard" />

            <div className="bg-white p-6 mt-5">
              {!roomCode ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Crear Sala de Trivia
                  </h2>
                  <form onSubmit={handleCreateRoom} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Tema
                      </label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors text-gray-600 disabled:bg-gray-100"
                        placeholder="Ej: Ciencia, Arte, Historia..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Número de jugadores
                      </label>
                      <input
                        type="number"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors text-gray-600 disabled:bg-gray-100"
                        placeholder="Ej: 4"
                      />
                    </div>

                    <div>
                      <label htmlFor="numQuestions" className="block text-sm font-bold text-gray-700 mb-2">
                        Número de preguntas
                      </label>
                      <div className="relative">
                        <select
                          id="numQuestions"
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(e.target.value)}
                          disabled={loading}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors text-gray-700 appearance-none bg-white cursor-pointer disabled:bg-gray-100"
                        >
                          <option value="5">5 Preguntas</option>
                          <option value="10">10 Preguntas</option>
                          <option value="15">15 Preguntas</option>
                          <option value="20">20 Preguntas</option>
                        </select>
                        <ChevronRight
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
                          size={20}
                        />
                      </div>
                    </div>

                    {alert && (
                      <div className="mt-2">
                        <Alert message={alert} />
                      </div>
                    )}

                    <div className="space-y-3 pt-3">
                      <motion.button
                        whileHover={{
                          scale: loading ? 1 : 1.05,
                          y: loading ? 0 : -2,
                        }}
                        whileTap={{ scale: loading ? 1 : 0.95 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Creando sala...' : 'Crear Sala'}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleBack}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        Volver
                      </motion.button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center space-y-6 py-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    ¡Sala creada exitosamente!
                  </h2>
                  <p className="text-lg font-medium text-gray-700">
                    Comparte este código con tus amigos:
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold tracking-widest bg-cyan-100 px-6 py-2 rounded-lg">
                      {roomCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      title="Copiar código"
                      aria-label="Copiar código"
                      type="button"
                      className="bg-cyan-500 text-white p-2 rounded-full hover:bg-cyan-600 transition-colors"
                    >
                      <Copy size={20} />
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGoToRoom}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Ir a la sala 🚀
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}