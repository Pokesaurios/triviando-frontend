import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
middlewareManager,
loggingMiddleware,
responseLoggingMiddleware,
timeoutMiddleware,
} from '../../../lib/api/middleware';

describe('MiddlewareManager', () => {
  beforeEach(() => {
    middlewareManager['requestMiddlewares'] = [];
  });

  describe('addRequestMiddleware', () => {
    it('should add a request middleware', () => {
      const mockMiddleware = vi.fn();
      middlewareManager.addRequestMiddleware(mockMiddleware);
      
      expect(middlewareManager['requestMiddlewares']).toHaveLength(1);
      expect(middlewareManager['requestMiddlewares'][0]).toBe(mockMiddleware);
    });

    it('should add multiple request middlewares', () => {
      const middleware1 = vi.fn();
      const middleware2 = vi.fn();
      
      middlewareManager.addRequestMiddleware(middleware1);
      middlewareManager.addRequestMiddleware(middleware2);
      
      expect(middlewareManager['requestMiddlewares']).toHaveLength(2);
    });
  });

  describe('addResponseMiddleware', () => {
    it('should add a response middleware', () => {
      const mockMiddleware = vi.fn();
      middlewareManager.addResponseMiddleware(mockMiddleware);
      
      expect(middlewareManager['responseMiddlewares']).toHaveLength(1);
      expect(middlewareManager['responseMiddlewares'][0]).toBe(mockMiddleware);
    });
  });
});

describe('loggingMiddleware', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should record information from the GET request', () => {
    const request = 'https://api.example.com/users';
    const init = { method: 'GET' };
    
    const result = loggingMiddleware(request, init);
    
    expect(console.log).toHaveBeenCalledWith('[API Request] GET https://api.example.com/users');
    expect(console.log).toHaveBeenCalledWith('[API Request Body]', undefined);
    expect(result).toBe(init);
  });

  it('should record information from the POST request with body', () => {
    const request = 'https://api.example.com/users';
    const body = JSON.stringify({ name: 'Test' });
    const init = { method: 'POST', body };
    
    loggingMiddleware(request, init);
    
    expect(console.log).toHaveBeenCalledWith('[API Request] POST https://api.example.com/users');
    expect(console.log).toHaveBeenCalledWith('[API Request Body]', body);
  });

  it('should use GET by default if no method is specified', () => {
    const request = 'https://api.example.com/users';
    
    loggingMiddleware(request);
    
    expect(console.log).toHaveBeenCalledWith('[API Request] GET https://api.example.com/users');
  });
});

describe('responseLoggingMiddleware', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should record information about the response', async () => {
    const mockResponse = new Response(null, {
      status: 200,
      statusText: 'OK'
    });
    Object.defineProperty(mockResponse, 'url', {
      value: 'https://api.example.com/users'
    });
    
    const result = await responseLoggingMiddleware(mockResponse);
    
    expect(console.log).toHaveBeenCalledWith('[API Response] 200 https://api.example.com/users');
    expect(result).toBe(mockResponse);
  });

  it('should record responses with different status codes', async () => {
    const mockResponse = new Response(null, {
      status: 404,
      statusText: 'Not Found'
    });
    Object.defineProperty(mockResponse, 'url', {
      value: 'https://api.example.com/notfound'
    });
    
    await responseLoggingMiddleware(mockResponse);
    
    expect(console.log).toHaveBeenCalledWith('[API Response] 404 https://api.example.com/notfound');
  });
});

describe('timeoutMiddleware', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('debería agregar un AbortController con el timeout predeterminado', () => {
    const middleware = timeoutMiddleware();
    const init = { method: 'GET' };
    
    const result = middleware('https://api.example.com', init);
    
    expect(result.signal).toBeInstanceOf(AbortSignal);
    expect(result.method).toBe('GET');
  });

  it('debería usar el timeout personalizado', () => {
    const customTimeout = 5000;
    const middleware = timeoutMiddleware(customTimeout);
    
    const result = middleware('https://api.example.com', {});
    
    expect(result.signal).toBeInstanceOf(AbortSignal);
  });

  it('debería abortar la petición después del timeout', () => {
    const middleware = timeoutMiddleware(1000);
    const result = middleware('https://api.example.com', {});
    
    expect(result.signal?.aborted).toBe(false);
    
    vi.advanceTimersByTime(1000);
    
    expect(result.signal?.aborted).toBe(true);
  });

  it('debería mantener otras propiedades de init', () => {
    const middleware = timeoutMiddleware();
    const init = { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    };
    
    const result = middleware('https://api.example.com', init);
    
    expect(result.method).toBe('POST');
    expect(result.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(result.body).toBe(init.body);
  });
});

describe('Integración de Middlewares', () => {
  it('debería poder encadenar múltiples middlewares de request', () => {
    const middleware1 = vi.fn((init) => ({ ...init, custom1: true }));
    const middleware2 = vi.fn((init) => ({ ...init, custom2: true }));
    
    middlewareManager.addRequestMiddleware(middleware1);
    middlewareManager.addRequestMiddleware(middleware2);
    
    expect(middlewareManager['requestMiddlewares']).toHaveLength(2);
  });
});