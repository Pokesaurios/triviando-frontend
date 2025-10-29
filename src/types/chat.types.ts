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
  id: string;
  player_id: string;
  username: string;
  message: string;
  created_at: string;
  avatar_color: string;
  roomCode: string;
}