export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateMaxPlayers = (players: number): {
  isValid: boolean;
  error?: string;
} => {
  if (isNaN(players) || players <= 0) {
    return { isValid: false, error: 'El número de jugadores debe ser mayor que 0.' };
  }
  if (players > 20) {
    return { isValid: false, error: 'El número máximo de jugadores es 20.' };
  }
  return { isValid: true };
};

export const validateTopic = (topic: string): boolean => {
  return topic.trim().length > 0;
}