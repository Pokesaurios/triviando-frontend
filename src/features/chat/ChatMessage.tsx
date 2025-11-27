import { motion } from 'framer-motion';
import { PlayerAvatar } from '../../components/ui/PlayerAvatar';
import { ChatMessage as ChatMessageType } from '../../types/chat.types';
import { getAvatarColor } from '../../utils/avatar';
import React from "react";

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  const color = message.avatarColor || getAvatarColor(message.userId || message.user || 'default');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
    >
      <PlayerAvatar 
        name={message.user || 'Usuario'}
        color={color}
        size="sm"
      />
      
      <div className={`flex-1 ${isCurrentUser ? 'text-right' : ''}`}>
        <p className="text-xs text-gray-500 mb-1">{message.user || 'Usuario'}</p>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`inline-block max-w-[80%] p-3 rounded-2xl shadow-md ${
            isCurrentUser
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-none'
              : 'bg-white text-gray-800 rounded-tl-none border-2 border-gray-100'
          }`}
        >
          <p className="break-words">{message.message}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};