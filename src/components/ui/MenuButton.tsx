import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';

interface MenuButtonProps {
  onLogout: () => void;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ onLogout }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="absolute top-6 right-6 text-white"
      onClick={onLogout}
      title="Cerrar sesión"
    >
      <Menu size={32} />
    </motion.button>
  );
};