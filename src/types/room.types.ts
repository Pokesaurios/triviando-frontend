// types/room.types.ts

export interface Player {
  userId: string;
  name: string;
  joinedAt: string;
}

export interface Room {
  code: string;
  hostId: string;
  triviaId: string;
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  players: Player[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomRequest {
  topic: string;
  maxPlayers: number;
  quantity: number;
}

export interface CreateRoomResponse {
  message: string;
  code: string;
  triviaId: string;
  maxPlayers: number;
  host: string;
}

export interface JoinRoomRequest {
  code: string;
}

export interface JoinRoomResponse {
  message: string;
  room: Room;
}

export interface GetRoomResponse {
  source: string;
  room: Room;
}