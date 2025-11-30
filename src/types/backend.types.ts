export interface BackendUserRaw {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface BackendQuestionRaw {
  question?: string;
  options?: string[];
  correctAnswer?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface BackendTriviaRaw {
  _id?: string;
  id?: string;
  topic?: string;
  questions?: BackendQuestionRaw[];
  creator?: string | { _id?: string };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface BackendPlayerRaw {
  _id?: string;
  userId?: string | { _id?: string } | null;
  name?: string;
  socketId?: string;
  joinedAt?: string | Date;
  // a veces los backends devuelven un sub-objeto `user`:
  user?: { _id?: string; id?: string; name?: string } | string | null;
}

export interface BackendRoomRaw {
  _id?: string;
  id?: string;
  code?: string;
  hostId?: string | { _id?: string };
  triviaId?: string | { _id?: string; topic?: string };
  status?: 'waiting' | 'in-game' | 'finished';
  maxPlayers?: number;
  players?: BackendPlayerRaw[] | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  expiresAt?: string | Date;
}

export interface BackendGameResultRaw {
  _id?: string;
  id?: string;
  roomCode?: string;
  triviaId?: string | { _id?: string; topic?: string };
  finishedAt?: string | Date;
  scores?: Record<string, number> | Map<string, number>;
  players?: Array<{
    userId?: string | { _id?: string };
    name?: string;
    userName?: string; // algunos endpoints usan userName
    score?: number;
  }> | null;
  winner?: {
    userId?: string | { _id?: string };
    name?: string;
    userName?: string;
    score?: number;
  } | null;
}
