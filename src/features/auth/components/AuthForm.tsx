import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import { InputField } from '../../../components/ui/InputField';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { AuthMessage } from '../../../types/auth.types';

interface AuthFormProps {
  isLogin: boolean;
  email: string;
  password: string;
  username: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  message: AuthMessage | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  isLogin,
  email,
  password,
  username,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  onSubmit,
  isLoading,
  message,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!isLogin && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <InputField
            label="Nombre de Usuario"
            type="text"
            value={username}
            onChange={onUsernameChange}
            placeholder="TriviaChampion"
            icon={User}
            required={!isLogin}
          />
        </motion.div>
      )}

      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={onEmailChange}
        placeholder="tumail@ejemplo.com"
        icon={Mail}
        required
      />

      <InputField
        label="Contraseña"
        type="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="••••••••"
        icon={Lock}
        required
      />

      {message && <AlertMessage type={message.type} text={message.text} />}

      <Button
        type="submit"
        variant="primary"
        disabled={isLoading}
        fullWidth
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          isLogin ? '¡Jugar Ahora!' : '¡Crear Cuenta!'
        )}
      </Button>
    </form>
  );
};