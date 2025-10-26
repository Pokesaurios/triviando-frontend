/**
 * Centralización de todos los endpoints de la API
 * Facilita el mantenimiento y evita duplicación
 */

export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Usuarios
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },

   // salas
   ROOMS: {
    CREATE: '/rooms/create',
    JOIN: '/rooms/join',
    GET_BY_CODE: (code: string) => `/rooms/${code}`,
  }, 

  // Trivias
  TRIVIA: {
    GENERATE: '/trivia/generate',
  },

} as const;