import { apiClient } from '../api/apiClient';
import { LoginCredentials, RegisterCredentials, User, AuthResponse } from '../../types/auth.types';
import { BackendUserRaw } from '../../types/backend.types';
import { connectSocket, cleanupSocket } from '../socket';
import { API_ENDPOINTS } from '../../config/endpoints';
import { normalizeUser } from '../api/normalizers';


interface AuthServiceResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthServiceResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    if (response.success && response.data) {
      this.saveAuthData(response.data.token, response.data.user);
      
      // Conectar socket después de login exitoso
      connectSocket(response.data.token);
      
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
      API_ENDPOINTS.AUTH.REGISTER,
      registerData
    );
    
    if (response.success && response.data) {
      this.saveAuthData(response.data.token, response.data.user);
      
      // Conectar socket después de registro exitoso
      connectSocket(response.data.token);
      
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
      await apiClient.post(
        API_ENDPOINTS.AUTH.LOGOUT, {}, { requiresAuth: true }
      );
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      cleanupSocket();
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
    const response = await apiClient.get<BackendUserRaw>(API_ENDPOINTS.AUTH.ME, {
      requiresAuth: true,
    });
    
    if (response.success && response.data) {
      const normalized = normalizeUser(response.data);
      // Actualizar los datos en localStorage
      localStorage.setItem('user', JSON.stringify(normalized));
      return normalized;
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
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      {},
      { requiresAuth: true }
    );
    
    if (response.success && response.data) {
      this.saveAuthData(response.data.token, response.data.user);
      
      connectSocket(response.data.token);
      
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

export const authService = new AuthService();
export const getToken = () => authService.getToken();