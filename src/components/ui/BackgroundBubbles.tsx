import React from 'react';
import { motion } from 'framer-motion';

interface BackgroundBubblesProps {
  count?: number;
}

export const BackgroundBubbles: React.FC<BackgroundBubblesProps> = ({ count = 20 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={`bubble-${i}`}
          className="absolute bg-white/10 rounded-full"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};