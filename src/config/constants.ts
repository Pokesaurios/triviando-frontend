export const APP_NAME = 'TrivIAndo';

export const MESSAGES = {
  LOGIN_SUCCESS: '¡Bienvenido a TrivIAndo!',
  REGISTER_SUCCESS: '¡Cuenta creada exitosamente!',
  LOGIN_ERROR: 'Credenciales incorrectas',
  REGISTER_ERROR: 'Error al crear la cuenta',
  CONNECTION_ERROR: 'Error de conexión con el servidor'
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
  BASE_URL: 'https://triviando-backend-g5fph6h2fybhd7cj.canadacentral-01.azurewebsites.net/api/v1',
};
// Configuración del Socket
export const SOCKET_CONFIG = {
  URL: import.meta.env.VITE_SOCKET_URL || 'https://triviando-backend-g5fph6h2fybhd7cj.canadacentral-01.azurewebsites.net/',
  OPTIONS: {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket', 'polling'] as ("websocket" | "polling")[],
  },
  EVENTS: {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
  },
};

export const SOCKET_EVENTS = {
  ROOM_UPDATE: 'room:update',
  GAME_START: 'game:start',
  GAME_UPDATE: 'game:update',
  PLAYER_JOINED: 'player:joined',
  PLAYER_LEFT: 'player:left',
};