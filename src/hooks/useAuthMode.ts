import { useState } from 'react';

export const useAuthMode = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  return {
    isLogin,
    toggleMode,
    switchToLogin,
    switchToRegister,
  };
};