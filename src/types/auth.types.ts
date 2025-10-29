export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface AuthMessage {
  type: 'error' | 'success';
  text: string;
}

export interface AuthFormState {
  email: string;
  password: string;
  username: string;
  isLoading: boolean;
  message: AuthMessage | null;
}

// Nueva interfaz para la respuesta del usuario
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}