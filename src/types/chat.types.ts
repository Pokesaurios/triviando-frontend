export interface ChatMessage {
  id: string;
  player_id: string;
  username: string;
  message: string;
  created_at: string;
  avatar_color: string;
}

export interface ChatFormData {
  message: string;
}
export interface ChatSendPayload {
  message: string;
  roomCode: string;
}

export interface ChatMessageFromServer {
  id?: string;
  // canonical frontend shape
  player_id?: string;
  username?: string;
  message?: string;
  created_at?: string;
  avatar_color?: string;
  roomCode?: string;
  // alternative server shapes (aliases)
  userId?: string;
  user?: string;
  userName?: string;
  timestamp?: string;
}