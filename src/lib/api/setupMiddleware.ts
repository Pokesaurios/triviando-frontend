import {
  middlewareManager,
  loggingMiddleware,
  responseLoggingMiddleware,
  tokenExpirationMiddleware,
  timeoutMiddleware,
} from './middleware';

/**
 * Configurar todos los middlewares de la aplicación
 * Llamar esta función al inicio de la aplicación
 */
export const setupMiddleware = () => {
  // Middleware de desarrollo (solo en dev)
  if (import.meta.env.DEV) {
    middlewareManager.addRequestMiddleware(loggingMiddleware);
    middlewareManager.addResponseMiddleware(responseLoggingMiddleware);
  }

  // Middleware de timeout (30 segundos)
  middlewareManager.addRequestMiddleware(timeoutMiddleware(30000));

  // Middleware para manejar token expirado
  middlewareManager.addResponseMiddleware(tokenExpirationMiddleware);

  console.log('✅ Middlewares configurados correctamente');
};