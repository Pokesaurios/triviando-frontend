import { motion } from 'framer-motion';
import { getInitials } from '../../utils/avatar';
interface PlayerAvatarProps {
  name?: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
}

export function PlayerAvatar({ name, color, size = 'md', isOnline }: PlayerAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
  };

  return (
    <div className="relative inline-block">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`
          ${sizeClasses[size]}
          rounded-full
          flex items-center justify-center
          font-bold text-white
          shadow-lg
          relative
        `}
        style={{ backgroundColor: color }}
      >
        {getInitials(name || '')}
      </motion.div>

      {isOnline !== undefined && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      )}
    </div>
  );
}