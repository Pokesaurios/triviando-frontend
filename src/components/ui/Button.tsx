import { motion } from 'framer-motion';
import { tapScale } from '../../config/animations';
import React from "react";

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tab';
  className?: string;
  fullWidth?: boolean;
  isActive?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  type = 'button',
  onClick,
  disabled = false,
  children,
  variant = 'primary',
  className = '',
  fullWidth = false,
  isActive = false,
}) => {
  const baseClasses = 'font-bold py-3 px-6 rounded-xl shadow-lg transition-all';
  const variantClasses: Record<string, string> = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl',
    secondary: 'bg-gray-200 text-gray-600',
    tab: 'bg-transparent text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg',
  };
  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';
  const widthClass = fullWidth ? 'w-full' : '';
  const activeClass = isActive ? 'ring-2 ring-offset-2 ring-blue-300' : '';

  return (
    <motion.button
      {...tapScale}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${widthClass} ${activeClass} ${className}`}
    >
      {children}
    </motion.button>
  );
};