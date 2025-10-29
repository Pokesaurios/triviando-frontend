import { ChatMessageFromServer } from './chat.types';

export interface BackendPlayerRaw {
  userId?: string | { _id?: string } | null;
  _id?: string;
  name?: string;
  user?: { _id?: string; name?: string } | string | null;
  joinedAt?: string | Date;
}

export interface BackendRoomRaw {
  code?: string;
  roomId?: string;
  triviaId?: string;
  hostId?: string;
  maxPlayers?: number;
  status?: string;
  players?: BackendPlayerRaw[];
  chatHistory?: ChatMessageFromServer[];
  createdAt?: string;
  updatedAt?: string;
  gameState?: unknown;
}

export interface ReconnectResponse {
  ok: boolean;
  room?: BackendRoomRaw;
  message?: string;
}

export interface JoinRoomSocketResponse {
  ok: boolean;
  room?: BackendRoomRaw;
  message?: string;
}
