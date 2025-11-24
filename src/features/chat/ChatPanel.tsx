import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatMessage } from '../../types/chat.types';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
  isConnected?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  isConnected = true
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
      {/* Header con indicador de conexión */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <MessageCircle size={24} />
            <h2 className="text-xl font-bold">Chat de la Sala</h2>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
        <AnimatePresence>
          {messages.length > 0 ? (
            messages.map((msg) => (
              <ChatMessageComponent
                key={msg.id}
                message={msg}
                isCurrentUser={msg.userId === currentUserId}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
              <p>No hay mensajes aún. ¡Sé el primero en saludar!</p>
            </div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} disabled={!isConnected} />
    </div>
  );
};