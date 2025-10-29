// components/ui/RoomCodeCard.tsx
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

interface RoomCodeCardProps {
  code: string;
  copied: boolean;
  onCopy: () => void;
}

export const RoomCodeCard: React.FC<RoomCodeCardProps> = ({ code, copied, onCopy }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="inline-block bg-white rounded-2xl px-8 py-4 shadow-2xl"
    >
      <p className="text-sm text-gray-600 font-semibold mb-1">Código de Sala</p>
      <div className="flex items-center gap-3">
        <span 
          className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" 
          style={{ fontFamily: 'monospace' }}
        >
          {code}
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onCopy}
          className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-3 rounded-xl hover:shadow-lg transition-shadow"
          aria-label="Copiar código"
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </motion.button>
      </div>
    </motion.div>
  );
};