import React, { useRef, useEffect } from 'react';
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
  // Referencia al contenedor de mensajes (el elemento con overflow-y-auto).
  const containerRef = useRef<HTMLDivElement>(null);

  // Hacer scroll sólo dentro del contenedor para evitar desplazar la página entera.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Sólo hacer auto-scroll si el usuario está cerca del final (por ejemplo, 150px)
    // de lo contrario respetamos la posición del usuario (está leyendo mensajes anteriores).
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const shouldAutoScroll = distanceFromBottom < 150;

    if (!shouldAutoScroll) return;

    // Usar scrollTo en el propio contenedor para que no afecte al document body.
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } catch {
      // Fallback si el navegador no soporta behavior option.
      el.scrollTop = el.scrollHeight;
    }
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
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
        <AnimatePresence>
          {messages.length > 0 ? (
            messages.map((msg, i) => {
              // Use msg.id when available; fallback to a stable composite key
              const key = msg.id || `${msg.userId}-${msg.timestamp}-${i}`;
              return (
                <ChatMessageComponent
                  key={key}
                  message={msg}
                  isCurrentUser={msg.userId === currentUserId}
                />
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
              <p>No hay mensajes aún. ¡Sé el primero en saludar!</p>
            </div>
          )}
        </AnimatePresence>
        {/* Elemento final opcional (no usado para scroll). */}
        <div />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} disabled={!isConnected} />
    </div>
  );
};