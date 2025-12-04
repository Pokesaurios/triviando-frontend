// app/CreateTriviaPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { LogoHeader } from '../components/ui/LogoHeader';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { validateMaxPlayers, validateTopic } from '../utils/validation';
import toaster from 'react-hot-toast';
import { useCreateRoom } from '../hooks/useRoom';

export default function CreateTriviaPage() {
  const [topic, setTopic] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const navigate = useNavigate();

  const createRoomMutation = useCreateRoom();

  const handleGenerateTrivia = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    const topicValidation = validateTopic(topic);
    if (!topicValidation) {
      setAlert({ type: 'error', text: 'El tema de la trivia no puede estar vacío.' });
      return;
    }

    const maxPlayersValidation = validateMaxPlayers(Number(maxPlayers));
    if (!maxPlayersValidation.isValid) {
      setAlert({ type: 'error', text: maxPlayersValidation.error! });
      return;
    }

    // Crear sala (que a su vez genera la trivia)
    createRoomMutation.mutate({
      topic,
      maxPlayers: Number(maxPlayers),
      quantity: Number(numQuestions),
    });
  };

  useEffect(() => {
    if (createRoomMutation.isSuccess && createRoomMutation.data) {
      toaster.success('¡Sala creada exitosamente! 🎉');
      // Redirigir a la sala de espera con el código
      navigate(`/room/${createRoomMutation.data.code}`);
    }
  }, [createRoomMutation.isSuccess, createRoomMutation.data, navigate]);

  // Manejar errores
  useEffect(() => {
    if (createRoomMutation.isError) {
      const errorMessage = createRoomMutation.error?.message || 'Error al crear la sala';
      setAlert({ type: 'error', text: errorMessage });
      toaster.error(errorMessage);
    }
  }, [createRoomMutation.isError, createRoomMutation.error]);

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
            <div className="bg-white p-6 mt-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Crear Trivia con IA
              </h2>
              <form onSubmit={handleGenerateTrivia} className="space-y-5">
                <div>
                  <label htmlFor="topic" className="block text-sm font-bold text-gray-700 mb-2">
                    Tema de la Trivia
                  </label>
                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={createRoomMutation.isPending}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors text-gray-600 disabled:bg-gray-100"
                    placeholder="Ej: Historia del Arte, Ciencia, Deportes ..."
                  />
                  {alert?.type === 'error' && alert?.text?.includes('tema') && (
                    <div className="mt-2">
                      <Alert message={{ type: 'error', text: alert?.text ?? '' }} />
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="maxPlayers" className="block text-sm font-bold text-gray-700 mb-2">
                    Número de jugadores
                  </label>
                  <input
                    id="maxPlayers"
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                    disabled={createRoomMutation.isPending}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors text-gray-600 disabled:bg-gray-100"
                    placeholder="Ej: 20 ..."
                  />
                  {alert?.type === 'error' && alert?.text?.includes('jugadores') && (
                    <div className="mt-2">
                      <Alert message={{ type: 'error', text: alert?.text ?? '' }} />
                    </div>
                  )}
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
                      disabled={createRoomMutation.isPending}
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
                <div className="space-y-3 pt-2">
                  <motion.button
                    whileHover={{ scale: createRoomMutation.isPending ? 1 : 1.05, y: createRoomMutation.isPending ? 0 : -2 }}
                    whileTap={{ scale: createRoomMutation.isPending ? 1 : 0.95 }}
                    type="submit"
                    disabled={createRoomMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createRoomMutation.isPending ? 'Creando sala...' : 'Generar Trivia'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleBack}
                    disabled={createRoomMutation.isPending}
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