// Tipos para el middleware
// noinspection GrazieInspection

type MiddlewareFunction = (
  request: RequestInfo | URL,
  init?: RequestInit
) => Promise<RequestInit | void> | RequestInit | void;

type ResponseMiddleware = (response: Response) => Promise<Response> | Response;

class MiddlewareManager {
  private requestMiddlewares: MiddlewareFunction[] = [];
  private responseMiddlewares: ResponseMiddleware[] = [];

  // Agregar middleware de request
  addRequestMiddleware(middleware: MiddlewareFunction): void {
    this.requestMiddlewares.push(middleware);
  }

  // Agregar middleware de response
  addResponseMiddleware(middleware: ResponseMiddleware): void {
    this.responseMiddlewares.push(middleware);
  }

  // Ejecutar todos los middlewares de request
// Ejecutar todos los middlewares de response
}

// Instancia única del gestor de middleware
export const middlewareManager = new MiddlewareManager();

// Middleware de logging
export const loggingMiddleware: MiddlewareFunction = (request, init) => {
  console.log(`[API Request] ${init?.method || 'GET'} ${request}`);
  console.log('[API Request Body]', init?.body);
  return init;
};

// Middleware de respuesta para logging
export const responseLoggingMiddleware: ResponseMiddleware = async (response) => {
  console.log(`[API Response] ${response.status} ${response.url}`);
  return response;
};

// Middleware de autenticación automática
// Middleware para manejar token expirado
export const tokenExpirationMiddleware: ResponseMiddleware = async (response) => {
  if (response.status === 401) {
    const url = new URL(response.url);
    // No redirigir si ya estamos en login o register
    if (!url.pathname.includes('/auth/login') && !url.pathname.includes('/auth/register')) {
      console.warn('Token expirado, redirigiendo a login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      globalThis.location.href = '/login';
    }
  }
  return response;
};

// Middleware para reintentos
// Middleware para timeout
export const timeoutMiddleware = (timeoutMs: number = 30000) => {
  return (_request: RequestInfo | URL, init?: RequestInit): RequestInit => {
    const controller = new AbortController();
    void setTimeout(() => controller.abort(), timeoutMs);

    return {
      ...init,
      signal: controller.signal,
    };
  };
};