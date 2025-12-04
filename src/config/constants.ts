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
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
};
// Configuración del Socket
export const SOCKET_CONFIG = {
  URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000/',
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
  // Room lifecycle
  ROOM_UPDATE: 'room:update',
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_RECONNECT: 'room:reconnect',

  // Chat
  ROOM_CHAT: 'room:chat',
  ROOM_CHAT_NEW: 'room:chat:new',

  // Game control
  GAME_START: 'game:start',
  GAME_STARTED: 'game:started',
  GAME_UPDATE: 'game:update',
  GAME_ENDED: 'game:ended',

  // Round / buzzer flow
  ROUND_SHOW_QUESTION: 'round:showQuestion',
  ROUND_OPEN_BUTTON: 'round:openButton',
  ROUND_PLAYER_WON_BUTTON: 'round:playerWonButton',
  ROUND_ANSWER_REQUEST: 'round:answerRequest',
  ROUND_ANSWER: 'round:answer',
  ROUND_RESULT: 'round:result',
  ROUND_BUTTON_PRESS: 'round:buttonPress',
};