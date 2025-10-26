import { io, Socket } from 'socket.io-client';
import { 
  SOCKET_CONFIG, 
  MESSAGES 
} from '../config/constants';

export const socket: Socket = io(SOCKET_CONFIG.URL, SOCKET_CONFIG.OPTIONS);

// Función para conectar el socket con autenticación
export const connectSocket = (token: string) => {
  if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
    
    socket.on(SOCKET_CONFIG.EVENTS.CONNECT, () => {
      console.log(MESSAGES.SOCKET_CONNECTED, socket.id);
    });

    socket.on(SOCKET_CONFIG.EVENTS.DISCONNECT, (reason) => {
      console.log(MESSAGES.SOCKET_DISCONNECTED, reason);
    });

    socket.on(SOCKET_CONFIG.EVENTS.CONNECT_ERROR, (error) => {
      console.error(MESSAGES.SOCKET_ERROR, error);
    });
  }
};

// Función para desconectar el socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log(MESSAGES.SOCKET_MANUAL_DISCONNECT);
  }
};