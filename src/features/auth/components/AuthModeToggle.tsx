import React from 'react';
import { Button } from '../../../components/ui/Button';

interface AuthModeToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

export const AuthModeToggle: React.FC<AuthModeToggleProps> = ({ isLogin, onToggle }) => {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant="tab"
        isActive={isLogin}
        onClick={() => isLogin || onToggle()}
        fullWidth
      >
        Iniciar Sesión
      </Button>
      <Button
        variant="tab"
        isActive={!isLogin}
        onClick={() => !isLogin || onToggle()}
        fullWidth
      >
        Registrarse
      </Button>
    </div>
  );
};