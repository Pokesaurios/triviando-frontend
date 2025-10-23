import { useState } from 'react';
import { AuthFormState, AuthMessage } from '../types/auth.types';
import { MESSAGES, ANIMATION_DURATIONS } from '../config/constants';
import { authService } from '../lib/services/authServices';

export const useAuthForm = (isLogin: boolean) => {
  const [formState, setFormState] = useState<AuthFormState>({
    email: '',
    password: '',
    username: '',
    isLoading: false,
    message: null,
  });

  const updateField = (field: keyof AuthFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const setMessage = (message: AuthMessage | null) => {
    setFormState((prev) => ({ ...prev, message }));
  };

  const setIsLoading = (isLoading: boolean) => {
    setFormState((prev) => ({ ...prev, isLoading }));
  };

  const resetForm = () => {
    setFormState({
      email: '',
      password: '',
      username: '',
      isLoading: false,
      message: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      let result;
      
      if (isLogin) {
        result = await authService.login({
          email: formState.email,
          password: formState.password
        });
      } else {
        result = await authService.register({
          username: formState.username,
          email: formState.email,
          password: formState.password
        });
      }

      if (result.success && result.token) {
        // Guardar token y datos del usuario
        localStorage.setItem('token', result.token);
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        
        setMessage({
          type: 'success',
          text: isLogin ? MESSAGES.LOGIN_SUCCESS : MESSAGES.REGISTER_SUCCESS,
        });

        setTimeout(() => {
          console.log('Redirigiendo al dashboard...');
          window.location.reload();
        }, 1000);
        
      } else {
        setMessage({
          type: 'error',
          text: result.error || (isLogin ? MESSAGES.LOGIN_ERROR : MESSAGES.REGISTER_ERROR),
        });
      }
    } catch (error) {
      console.error('Error en submit:', error);
      setMessage({
        type: 'error',
        text: 'Error de conexión con el servidor',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formState,
    updateField,
    setMessage,
    handleSubmit,
    resetForm,
  };
};