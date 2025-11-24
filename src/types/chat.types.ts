export interface ChatMessage {
  id: string; 
  userId: string;
  user: string;
  message: string;
  timestamp: string;
  avatarColor?: string;
}

export interface ChatFormData {
  message: string;
}

export interface ChatSendPayload {
  message: string;
  code: string;
}