import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface QuestionDisplayProps {
  question: string;
  timeLeft: number; // seconds (deprecated)
  timeLeftMs?: number; // prefer ms for smoother UI
  questionNumber: number;
  roomCode: string;
  maxTimeSeconds?: number; // seconds (deprecated)
  maxTimeMs?: number; // prefer ms for progress calculation
}

export default function QuestionDisplay({
  question,
  timeLeft,
  timeLeftMs,
  questionNumber,
  roomCode,
  maxTimeSeconds = 30,
  maxTimeMs,
}: Readonly<QuestionDisplayProps>) {
  const effectiveMaxMs = maxTimeMs ?? (Math.max(1, maxTimeSeconds) * 1000);
  const effectiveTimeMs = typeof timeLeftMs === 'number' ? timeLeftMs : (Math.max(0, timeLeft) * 1000);

  const getTimerColor = () => {
    const percentage = (effectiveTimeMs / Math.max(1, effectiveMaxMs)) * 100;
    if (percentage > 66) return 'from-green-400 to-green-600';
    if (percentage > 33) return 'from-yellow-400 to-orange-500';
    return 'from-red-500 to-red-700';
  };

  const getTimerPercentage = () => {
    return Math.max(0, Math.min(100, (effectiveTimeMs / Math.max(1, effectiveMaxMs)) * 100));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <p className="text-white text-sm font-semibold">
              Sala: {roomCode} | Pregunta {questionNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="text-white" size={24} />
            <span className="text-white text-2xl font-bold">{(effectiveTimeMs / 1000).toFixed(1)}s</span>
          </div>
        </div>
        <div className="mt-3 bg-white/30 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${getTimerColor()}`}
            animate={{ width: `${getTimerPercentage()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="p-8">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 leading-tight">
            {question}
          </h2>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl"
          >
            🤔
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}