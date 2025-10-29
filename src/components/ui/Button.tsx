import { motion } from 'framer-motion';
import { tapScale } from '../../config/animations';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  type = 'button',
  onClick,
  disabled = false,
  children,
  variant = 'primary',
  className = '',
}) => {
  const baseClasses = 'font-bold py-3 px-6 rounded-xl shadow-lg transition-all';
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl',
    secondary: 'bg-gray-200 text-gray-600',
  };
  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <motion.button
      {...tapScale}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {children}
    </motion.button>
  );
};