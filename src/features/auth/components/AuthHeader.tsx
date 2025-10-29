import React from 'react';
import { motion } from 'framer-motion';

interface AuthHeaderProps {
  logo: string;
  title: string;
  tagline: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ logo, title, tagline }) => {
  return (
    <div className="bg-gradient-to-b from-blue-500 to-purple-500 p-8 text-center relative">
      <motion.div
        animate={{
          rotate: [0, -10, 10, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
        className="inline-block"
      >
        <img
          src={logo}
          alt={`${title} Logo`}
          className="h-24 w-auto mx-auto drop-shadow-lg"
        />
      </motion.div>
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="text-4xl font-bold text-white mt-4 drop-shadow-md"
        style={{ fontFamily: 'Poppins, cursive' }}
      >
        {title}
      </motion.h1>
      <p className="text-white/90 mt-2 font-semibold">
        {tagline}
      </p>
    </div>
  );
};