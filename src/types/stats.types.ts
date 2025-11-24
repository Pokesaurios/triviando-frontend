export interface GameResultType {
  roomCode: string;
  triviaId: {
    _id: string;
    topic: string;
  };
  finishedAt: string;
  scores: Record<string, number>;
  players: {
    userId: string;
    userName: string;
    score: number;
  }[];
  winner?: {
    userId: string;
    userName: string;
    score: number;
  };
}