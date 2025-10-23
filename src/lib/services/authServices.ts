import { apiClient } from '../api/apiClient';
import { LoginCredentials, RegisterCredentials, User, AuthResponse } from '../../types/auth.types';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  ME: '/auth/me',
};

interface AuthServiceResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthServiceResponse> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );

    if (response.success && response.data) {
      this.saveAuthData(response.data.token, response.data.user);
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
      };
    }

    return {
      success: false,
      error: response.error || 'Error al iniciar sesión',
    };
  }

  async register(credentials: RegisterCredentials): Promise<AuthServiceResponse> {
    const registerData = {
      name: credentials.username,
      email: credentials.email,
      password: credentials.password,
    };

    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.REGISTER,
      registerData
    );

    if (response.success && response.data) {
      this.saveAuthData(response.data.token, response.data.user);
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
      };
    }

    return {
      success: false,
      error: response.error || 'Error al registrar usuario',
    };
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT, {}, { requiresAuth: true });
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      this.clearAuthData();
    }
  }

  getCurrentUser(): User | null {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        return null;
      }
    }

    return null;
  }

  async fetchCurrentUser(): Promise<User | null> {
    const response = await apiClient.get<User>(AUTH_ENDPOINTS.ME, {
      requiresAuth: true,
    });

    if (response.success && response.data) {
      // Actualizar los datos en localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }

    return null;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  async refreshToken(): Promise<boolean> {
    const response = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      {},
      { requiresAuth: true }
    );

    if (response.success && response.data) {
      this.saveAuthData(response.data.token, response.data.user);
      return true;
    }

    return false;
  }

  private saveAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// Exportar instancia única del servicio
export const authService = new AuthService();