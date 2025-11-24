import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { AuthFormState } from '../../types/auth.types';

interface AuthFormProps {
  isLogin: boolean;
  formState: AuthFormState;
  onSubmit: (e: React.FormEvent) => void;
  onFieldChange: (field: keyof AuthFormState, value: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  isLogin,
  formState,
  onSubmit,
  onFieldChange,
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
            value={formState.userName}
            onChange={(value) => onFieldChange('userName', value)}
            placeholder="TriviaChampion"
            icon={User}
            required={!isLogin}
          />
        </motion.div>
      )}

      <InputField
        label="Email"
        type="email"
        value={formState.email}
        onChange={(value) => onFieldChange('email', value)}
        placeholder="tumail@ejemplo.com"
        icon={Mail}
        required
      />

      <InputField
        label="Contraseña"
        type="password"
        value={formState.password}
        onChange={(value) => onFieldChange('password', value)}
        placeholder="••••••••"
        icon={Lock}
        required
      />

      {formState.message && <Alert message={formState.message} />}

      <Button
        type="submit"
        disabled={formState.isLoading}
        className="w-full"
      >
        {formState.isLoading ? (
          <LoadingSpinner />
        ) : (
          isLogin ? '¡Jugar Ahora!' : '¡Crear Cuenta!'
        )}
      </Button>
    </form>
  );
};