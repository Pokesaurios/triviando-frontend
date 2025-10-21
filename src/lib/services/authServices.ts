import { LoginCredentials, RegisterCredentials } from '../../types/auth.types';

// Simulación de API - Reemplazar con llamadas reales
export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ success: boolean; token?: string; error?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulación de validación
        if (credentials.email && credentials.password) {
          resolve({
            success: true,
            token: 'fake-jwt-token-' + Date.now(),
          });
        } else {
          resolve({
            success: false,
            error: 'Credenciales inválidas',
          });
        }
      }, 1500);
    });
  },

  register: async (credentials: RegisterCredentials): Promise<{ success: boolean; token?: string; error?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulación de registro
        if (credentials.email && credentials.password && credentials.username) {
          resolve({
            success: true,
            token: 'fake-jwt-token-' + Date.now(),
          });
        } else {
          resolve({
            success: false,
            error: 'Datos incompletos',
          });
        }
      }, 1500);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Limpiar token, etc.
        resolve();
      }, 500);
    });
  },

  getCurrentUser: async (): Promise<{ id: string; email: string; username: string } | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulación de obtener usuario actual
        const token = localStorage.getItem('token');
        if (token) {
          resolve({
            id: '1',
            email: 'user@example.com',
            username: 'TriviaChampion',
          });
        } else {
          resolve(null);
        }
      }, 500);
    });
  },
};