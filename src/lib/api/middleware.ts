// Tipos para el middleware
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
  async executeRequestMiddlewares(
    request: RequestInfo | URL,
    init: RequestInit = {}
  ): Promise<RequestInit> {
    let modifiedInit = { ...init };

    for (const middleware of this.requestMiddlewares) {
      const result = await middleware(request, modifiedInit);
      if (result) {
        modifiedInit = { ...modifiedInit, ...result };
      }
    }

    return modifiedInit;
  }

  // Ejecutar todos los middlewares de response
  async executeResponseMiddlewares(response: Response): Promise<Response> {
    let modifiedResponse = response;

    for (const middleware of this.responseMiddlewares) {
      modifiedResponse = await middleware(modifiedResponse);
    }

    return modifiedResponse;
  }
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
export const authMiddleware: MiddlewareFunction = (request, init) => {
  const token = localStorage.getItem('token');
  
  if (token && init?.headers) {
    const headers = new Headers(init.headers);
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return { ...init, headers };
  }
  
  return init;
};

// Middleware para manejar token expirado
export const tokenExpirationMiddleware: ResponseMiddleware = async (response) => {
  if (response.status === 401) {
    const url = new URL(response.url);
    // No redirigir si ya estamos en login o register
    if (!url.pathname.includes('/auth/login') && !url.pathname.includes('/auth/register')) {
      console.warn('Token expirado, redirigiendo a login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
  return response;
};

// Middleware para reintentos
export const retryMiddleware = (maxRetries: number = 3) => {
  return async (request: RequestInfo | URL, init?: RequestInit): Promise<RequestInit | void> => {
    if (!init) init = {};
    
    let retryCount = 0;
    init.retryCount = retryCount;
    init.maxRetries = maxRetries;
    
    return init;
  };
};

// Middleware para timeout
export const timeoutMiddleware = (timeoutMs: number = 30000) => {
  return (request: RequestInfo | URL, init?: RequestInit): RequestInit => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    return {
      ...init,
      signal: controller.signal,
    };
  };
};