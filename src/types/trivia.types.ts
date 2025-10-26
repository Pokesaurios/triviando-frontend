// types/trivia.types.ts

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GenerateTriviaRequest {
  topic: string;
  quantity: number;
}

export interface GenerateTriviaResponse {
  message: string;
  triviaId: string;
  totalQuestions: number;
  preview: Question[];
}