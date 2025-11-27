import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { AuthMessage } from '../../types/auth.types';
import React from "react";

interface AlertProps {
  message: AuthMessage;
}

export const Alert: React.FC<AlertProps> = ({ message }) => {
  const isError = message.type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle;
  const bgColor = isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 p-3 rounded-lg ${bgColor}`}
    >
      <Icon size={20} />
      <span className="text-sm font-semibold">{message.text}</span>
    </motion.div>
  );
};