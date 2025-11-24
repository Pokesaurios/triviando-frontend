import { ChatMessage } from './chat.types';
import { GameState } from './game.types';
export interface Player {
  userId: string;
  name: string;
  joinedAt: string | Date;
  avatarColor?: string;
}

export interface Room {
  code: string;
  roomId?: string;
  triviaId?: string;
  hostId?: string;
  host?: string;
  status?: string;
  maxPlayers?: number;
  players: Player[];
  chatHistory?: ChatMessage[];
  createdAt?: string;
  updatedAt?: string;
  gameState?: GameState;
}

export interface CreateRoomRequest {
  topic: string;
  maxPlayers: number;
  quantity: number;
}

export interface CreateRoomResponse {
  ok: boolean;
  room?: Room;
  message?: string;
  error?: string;
}

export interface JoinRoomRequest {
  code: string;
}
export interface JoinRoomResponse {
  ok: boolean;
  room?: Room;
  message?: string;
  error?: string;
}
export interface GetRoomResponse {
  source: string;
  room: Room;
}
export interface ReconnectResponse {
  ok: boolean;
  room?: Room;
  message?: string;
  error?: string;
}