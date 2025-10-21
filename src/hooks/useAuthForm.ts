import { useState } from 'react';
import { AuthFormState, AuthMessage } from '../types/auth.types';
import { MESSAGES, ANIMATION_DURATIONS } from '../config/constants';

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

    // Simulación de llamada a API
    setTimeout(() => {
      setMessage({
        type: 'success',
        text: isLogin ? MESSAGES.LOGIN_SUCCESS : MESSAGES.REGISTER_SUCCESS,
      });
      setIsLoading(false);
    }, ANIMATION_DURATIONS.FORM_SUBMIT);
  };

  return {
    formState,
    updateField,
    setMessage,
    handleSubmit,
    resetForm,
  };
};