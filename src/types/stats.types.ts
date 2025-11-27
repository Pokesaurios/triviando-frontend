export interface GameResultType {
  roomCode: string;
  triviaId: {
    _id: string;
    topic?: string;
  };
  finishedAt: string;
  scores: Record<string, number>;
  players: {
    userId: string;
    name: string; // anteriormente userName
    score: number;
  }[];
  winner?: {
    userId: string;
    name: string;
    score: number;
  };
}