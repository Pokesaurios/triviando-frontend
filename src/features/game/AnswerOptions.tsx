import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface AnswerOptionsProps {
  readonly options: string[];
  readonly onSelect: (index: number) => void;
  readonly timeLeft: number;
  readonly isWaitingAck?: boolean;
}

export default function AnswerOptions({ options, onSelect, timeLeft, isWaitingAck }: AnswerOptionsProps) {
  const letters = ['A', 'B', 'C', 'D'];
  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-yellow-500 to-orange-500',
    'from-purple-500 to-purple-600',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-3xl shadow-2xl p-8"
    >
      <div className="mb-6 flex items-center justify-center gap-3">
        <Clock className="text-orange-500" size={32} />
        <span className="text-4xl font-bold text-gray-800">{timeLeft}s</span>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        ¡Selecciona tu respuesta!
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={option}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(index)}
            disabled={isWaitingAck}
            className={`bg-gradient-to-r ${colors[index]} text-white font-bold py-6 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-left flex items-center gap-4 ${isWaitingAck ? 'opacity-60 cursor-wait' : ''}`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {letters[index]}
            </div>
            <span className="text-lg">{option}</span>
          </motion.button>
        ))}
      </div>
      {isWaitingAck && (
        <div className="mt-4 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </motion.div>
  );
}