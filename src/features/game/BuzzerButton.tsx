import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface BuzzerButtonProps {
  showBuzzer: boolean;
  buzzerPressed: boolean;
  playerWhoPressed: string | null;
  onPress: () => void;
  isBlocked: boolean;
}

export default function BuzzerButton({
  showBuzzer,
  buzzerPressed,
  playerWhoPressed,
  onPress,
  isBlocked,
}: BuzzerButtonProps) {
  return (
    <AnimatePresence mode="wait">
      {showBuzzer && !buzzerPressed && !isBlocked && (
        <motion.div
          key="buzzer"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPress}
            className="relative group"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(239, 68, 68, 0.5)',
                  '0 0 60px rgba(239, 68, 68, 0.8)',
                  '0 0 20px rgba(239, 68, 68, 0.5)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-48 h-48 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Zap size={80} className="text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 bg-red-400 rounded-full opacity-30 blur-xl"
            />
          </motion.button>
        </motion.div>
      )}

      {buzzerPressed && (
        <motion.div
          key="pressed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-green-400 to-green-600 rounded-3xl shadow-2xl p-8 text-center"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-4"
          >
            ⚡
          </motion.div>
          <h3 className="text-3xl font-bold text-white mb-2">
            ¡{playerWhoPressed} presionó el buzzer!
          </h3>
          <p className="text-white text-lg opacity-90">Esperando respuesta...</p>
        </motion.div>
      )}

      {isBlocked && showBuzzer && (
        <motion.div
          key="blocked"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-gray-400 to-gray-600 rounded-3xl shadow-2xl p-8 text-center"
        >
          <div className="text-6xl mb-4">🚫</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Estás bloqueado para esta pregunta
          </h3>
          <p className="text-white text-lg opacity-90">
            Otro jugador debe responder
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}