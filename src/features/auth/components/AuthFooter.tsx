import React from 'react';
import { motion } from 'framer-motion';

interface AuthFooterProps {
  showForgotPassword: boolean;
  teamName: string;
  teamLogo: string;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({ 
  showForgotPassword, 
  teamName, 
  teamLogo 
}) => {
  return (
    <>
      {showForgotPassword && (
        <div className="text-center mt-4">
          <button
            type="button"
            className="text-sm text-blue-500 hover:text-blue-700 font-semibold"
            aria-label="Recuperar contraseña"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-6 text-white"
      >
        <p className="text-white font-semibold drop-shadow-md mb-2">
          Desarrollado por el equipo {teamName}
        </p>
        <img
          src={teamLogo}
          alt={`${teamName} Logo`}
          className="h-24 w-auto mx-auto drop-shadow-lg"
        />
      </motion.div>
    </>
  );
};