// components/ui/PlayerAvatar.tsx
import { motion } from 'framer-motion';

interface PlayerAvatarProps {
  name: string;
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        {getInitials(name)}
      </motion.div>

      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
      )}
    </div>
  );
}