export interface GamePlayer {
  userId: string;
  name: string;
  score?: number;
}

export interface GameQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty?: string;
}

export interface GameState {
  triviaId: string;
  currentQuestionIndex: number;
  scores: Record<string, number>;
  players: GamePlayer[];
  status: 'waiting' | 'reading' | 'buzzer-open' | 'answering' | 'result' | 'finished';
  roundSequence: number;
  blocked: Record<string, boolean>;
}

export interface RoundShowQuestionEvent {
  roundSequence: number;
  questionText: string;
  readMs: number;
}

export interface RoundOpenButtonEvent {
  roundSequence: number;
  pressWindowMs: number;
}

export interface RoundPlayerWonButtonEvent {
  roundSequence: number;
  playerId: string;
  name: string;
}

export interface RoundAnswerRequestEvent {
  roundSequence: number;
  options: string[];
  answerTimeoutMs: number;
  endsAt: number;
}

export interface RoundResultEvent {
  roundSequence: number;
  playerId?: string;
  correct?: boolean | null;
  message?: string;
  correctAnswer?: string;
  scores?: Record<string, number>;
  resolvedBy?: string | null;
}

export interface GameEndedEvent {
  scores: Record<string, number>;
  winner: {
    userId: string;
    name: string;
    score: number;
  };
}

export interface GameStartedEvent {
  ok: boolean;
  totalQuestions: number;
}