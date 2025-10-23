export const APP_NAME = 'TrivIAndo';

export const MESSAGES = {
  LOGIN_SUCCESS: '¡Bienvenido a TrivIAndo!',
  REGISTER_SUCCESS: '¡Cuenta creada exitosamente!',
  LOGIN_ERROR: 'Credenciales incorrectas',
  REGISTER_ERROR: 'Error al crear la cuenta',
  CONNECTION_ERROR: 'Error de conexión con el servidor',
};

export const ANIMATION_DURATIONS = {
  FORM_SUBMIT: 1500,
  HOVER_SCALE: 1.02,
  TAP_SCALE: 0.95,
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  FORGOT_PASSWORD: '/forgot-password',
};

// Nueva constante para la URL base de la API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:4000/api/v1',
};