export interface GamePlayer {
  userId: string;
  name: string;
}

export interface GameState {
  triviaId: string;
  currentQuestionIndex: number;
  scores: Record<string, number>;
  players: GamePlayer[];
  status: 'reading' | 'open' | 'answering' | 'result' | 'finished';
  roundSequence: number;
  blocked: Record<string, boolean>;
  questionReadEndsAt?: number;
  answerWindowEndsAt?: number;
  tieBreakerPlayed?: boolean;
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
  playerId?: string | null;
  resolvedBy?: string | null;
  correct: boolean | null;
  message?: string;
  correctAnswer?: string;
  scores: Record<string, number>;
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