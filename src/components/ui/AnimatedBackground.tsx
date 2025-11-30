import { motion } from 'framer-motion';
import React, { useMemo } from "react";

export const AnimatedBackground: React.FC = () => {
  const BUBBLE_COUNT = 12;

  const bubbles = useMemo(() =>
    Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
      id: `bubble-${i}-${Math.random().toString(36).slice(2,9)}`,
      width: Math.random() * 100 + 50,
      height: Math.random() * 100 + 50,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      xOffset: Math.random() * 20 - 10,
      duration: Math.random() * 3 + 3,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="absolute bg-white/10 rounded-full"
          style={{
            width: b.width,
            height: b.height,
            left: b.left,
            top: b.top,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, b.xOffset, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};