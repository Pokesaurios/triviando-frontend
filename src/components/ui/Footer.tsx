import { motion } from 'framer-motion';
import { fadeIn } from '../../config/animations';
import React from "react";

export const Footer: React.FC = () => {
  return (
    <motion.div
      {...fadeIn}
      className="text-center mt-6 text-white"
    >
      <p className="text-white font-semibold drop-shadow-md mb-2">
        Desarrollado por el equipo Pokesaurios
      </p>
      <img
        src="/pokesaurios.png"
        alt="Pokesaurios Logo"
        className="h-24 w-auto mx-auto drop-shadow-lg"
      />
    </motion.div>
  );
};