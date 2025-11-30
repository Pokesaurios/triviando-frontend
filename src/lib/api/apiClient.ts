import { API_CONFIG } from '../../config/constants';

// Tipos para las opciones de las peticiones
interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

// Tipos para las respuestas de la API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Método privado para obtener headers comunes
  private getHeaders(requiresAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Método privado para manejar errores
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError, 'Response text:', text);
      return {
        success: false,
        error: 'Error en la respuesta del servidor',
      };
    }

    if (response.ok) {
      return {
        success: true,
        data,
      };
    }

    // Manejar errores específicos
    if (response.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      globalThis.location.href = '/login';
    }

    return {
      success: false,
      error: data.message || `Error: ${response.status}`,
    };
  }

  // Método GET
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { requiresAuth = false, ...fetchOptions } = options;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(requiresAuth),
        ...fetchOptions,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('Error en GET request:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor',
      };
    }
  }

  // Método POST
  async post<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { requiresAuth = false, ...fetchOptions } = options;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(requiresAuth),
        body: JSON.stringify(body),
        ...fetchOptions,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('Error en POST request:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor',
      };
    }
  }

  // Método PUT
  async put<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { requiresAuth = false, ...fetchOptions } = options;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(requiresAuth),
        body: JSON.stringify(body),
        ...fetchOptions,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('Error en PUT request:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor',
      };
    }
  }

  // Método DELETE
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { requiresAuth = false, ...fetchOptions } = options;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(requiresAuth),
        ...fetchOptions,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('Error en DELETE request:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor',
      };
    }
  }
}

// Instancia única del cliente
export const apiClient = new ApiClient(API_CONFIG.BASE_URL);