import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function App() {
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(true);
  const [hasAnswered, setHasAnswered] = useState(false);
  const totalTime = 10;

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft <= 0) setIsActive(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          setIsActive(false);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const handleAnswer = () => {
    if (isActive && !hasAnswered) {
      setHasAnswered(true);
      setIsActive(false);
    }
  };

  const progressPercentage = (timeLeft / totalTime) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-b from-purple-500 to-purple-600">
      <div className="absolute top-4 left-4 text-white text-sm font-semibold">
        Botón para responder
      </div>

      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        <motion.div
          className="bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-3xl shadow-2xl overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Pregunta 1 de 5
              </h2>
              <MessageCircle className="text-white" size={28} />
            </div>

            <p className="text-gray-900 font-bold text-center mb-6">
              ¿En qué año se fundó Colombia como país?
            </p>

            <div className="bg-white rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center">
              <motion.button
                whileHover={isActive ? { scale: 1.1 } : {}}
                whileTap={isActive ? { scale: 0.95 } : {}}
                onClick={handleAnswer}
                disabled={!isActive}
                className={`w-40 h-40 rounded-full shadow-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-b from-red-500 to-red-700 cursor-pointer'
                    : 'bg-gradient-to-b from-gray-400 to-gray-500 cursor-not-allowed'
                }`}
                style={{
                  boxShadow: isActive
                    ? '0 10px 30px rgba(239, 68, 68, 0.5)'
                    : '0 10px 30px rgba(0, 0, 0, 0.2)',
                }}
              >
                <motion.div
                  animate={
                    isActive
                      ? {
                          scale: [1, 1.05, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1,
                    repeat: isActive ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-b from-red-400 to-red-600" />
                </motion.div>
              </motion.button>

              <div className="mt-8 w-full max-w-xs">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    initial={{ width: '100%' }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>

              <p className="text-center text-sm text-gray-600 font-semibold mt-4">
                {isActive
                  ? 'Presiona el botón para responder de primeras'
                  : hasAnswered
                  ? '¡Respuesta registrada!'
                  : '¡Tiempo terminado!'}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
