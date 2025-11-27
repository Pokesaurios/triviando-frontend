import { motion } from 'framer-motion';
import { tapScale } from '../../config/animations';
import React from "react";

interface AuthTabsProps {
  isLogin: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({
  isLogin,
  onLoginClick,
  onRegisterClick,
}) => {
  return (
    <div className="flex gap-2 mb-6">
      <motion.button
        {...tapScale}
        onClick={onLoginClick}
        className={`flex-1 py-2 px-4 rounded-full font-bold transition-all ${
          isLogin
            ? 'bg-purple-600 text-white shadow-lg'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        Iniciar Sesión
      </motion.button>
      <motion.button
        {...tapScale}
        onClick={onRegisterClick}
        className={`flex-1 py-2 px-4 rounded-full font-bold transition-all ${
          !isLogin
            ? 'bg-purple-500 text-white shadow-lg'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        Registrarse
      </motion.button>
    </div>
  );
};