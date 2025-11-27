// noinspection GrazieInspection

import { io, Socket } from 'socket.io-client';
import { SOCKET_CONFIG } from '../config/constants';

const MESSAGES = {
  SOCKET_CONNECTED: "Socket conectado:",
  SOCKET_DISCONNECTED: "Socket desconectado:",
  SOCKET_ERROR: "Error de conexión del socket:",
  SOCKET_MANUAL_DISCONNECT: "Socket desconectado manualmente",
  NO_TOKEN: "No se encontró token para autenticación"
};

let socket: Socket | null = null;

export function createAuthedSocket(token: string): Socket {
  // Si ya existe un socket conectado, retornarlo
  if (socket && socket.connected) {
    return socket;
  }
  
  // Si existe pero, está desconectado, limpiarlo
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
  }
  
  // Crear nuevo socket con autoConnect en true
  socket = io(SOCKET_CONFIG.URL, {
    autoConnect: true, 
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    auth: { token }
  });
  
  setupSocketEvents(socket);
  
  return socket;
}

const setupSocketEvents = (socketInstance: Socket) => {
  socketInstance.on(SOCKET_CONFIG.EVENTS.CONNECT, () => {
    console.log(MESSAGES.SOCKET_CONNECTED, socketInstance.id);
  });
  
  socketInstance.on(SOCKET_CONFIG.EVENTS.DISCONNECT, (reason) => {
    console.log(MESSAGES.SOCKET_DISCONNECTED, reason);
    
    // Reconectar automáticamente si el servidor desconectó
    if (reason === 'io server disconnect') {
      socketInstance.connect();
    }
  });
  
  socketInstance.on(SOCKET_CONFIG.EVENTS.CONNECT_ERROR, (error) => {
    console.error(MESSAGES.SOCKET_ERROR, error);
  });

  // Debug de todos los eventos
  socketInstance.onAny((event, ...args) => {
    console.log(`📨 Socket event: ${event}`, args);
  });
};

export const connectSocket = (token: string) => {
  if (!token) {
    console.warn(MESSAGES.NO_TOKEN);
    return;
  }
  
  // Si no existe socket, crear uno nuevo
  if (!socket) {
    createAuthedSocket(token);
  } else if (!socket.connected) {
    // Si existe pero, está desconectado, actualizar auth y reconectar
    socket.auth = { token };
    socket.connect();
  }
};
export const getSocket = (): Socket | null => {
  return socket;
};

export const cleanupSocket = () => {
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
  }
};