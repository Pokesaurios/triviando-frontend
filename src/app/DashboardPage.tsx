import { motion } from 'framer-motion';
import { useState } from 'react';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { LogoHeader } from '../components/ui/LogoHeader';
import { MenuButton } from '../components/ui/MenuButton';

export default function DashboardPage() {
  const [user] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : { username: 'Usuario' };
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
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
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="relative">
            <div className="absolute top-0 right-0 z-20">
              <MenuButton onLogout={handleLogout} />
            </div>
            
            <div>
              <LogoHeader variant="dashboard" />
              
              <div className="bg-white p-6 mt-5">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  ¡Bienvenido, {user.name}!
                </h2>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Crear Nueva Trivia
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Unirse a Trivia
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Mis Estadísticas
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}