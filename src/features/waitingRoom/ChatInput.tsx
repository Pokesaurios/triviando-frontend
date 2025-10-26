import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  maxLength = 200 
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          maxLength={maxLength}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!message.trim()}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Enviar mensaje"
        >
          <Send size={24} />
        </motion.button>
      </div>
    </form>
  );
};