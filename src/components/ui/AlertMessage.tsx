import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AlertMessageProps {
  type: 'success' | 'error';
  text: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({ type, text }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 p-3 rounded-lg ${
        type === 'error'
          ? 'bg-red-100 text-red-700'
          : 'bg-green-100 text-green-700'
      }`}
    >
      {type === 'error' ? (
        <AlertCircle size={20} />
      ) : (
        <CheckCircle size={20} />
      )}
      <span className="text-sm font-semibold">{text}</span>
    </motion.div>
  );
};