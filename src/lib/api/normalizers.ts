// src/lib/api/normalizers.ts
import { BackendUserRaw, BackendTriviaRaw, BackendRoomRaw, BackendPlayerRaw, BackendGameResultRaw } from '../../types/backend.types';
import { User } from '../../types/auth.types';
import { Question } from '../../types/trivia.types';
import { Room, Player } from '../../types/room.types';
import { GameResultType } from '../../types/stats.types';

function toId(maybe: any): string | undefined {
  if (!maybe) return undefined;
  if (typeof maybe === 'string') return maybe;
  if (maybe._id) return String(maybe._id);
  if (maybe.id) return String(maybe.id);
  return undefined;
}

export function normalizeUser(raw: BackendUserRaw): User {
  const id = toId(raw._id ?? raw.id) ?? '';
  return {
    id,
    name: raw.name ?? '',
    email: raw.email ?? '',
  };
}

export function normalizeQuestion(raw: any): Question {
  return {
    question: raw.question ?? '',
    options: Array.isArray(raw.options) ? raw.options : [],
    correctAnswer: raw.correctAnswer ?? '',
    difficulty: raw.difficulty ?? 'easy',
  };
}

export function normalizeTrivia(raw: BackendTriviaRaw): any {
  return {
    id: toId(raw._id ?? raw.id) ?? undefined,
    topic: raw.topic ?? '',
    questions: Array.isArray(raw.questions) ? raw.questions.map(normalizeQuestion) : [],
  };
}

export function normalizePlayer(raw: BackendPlayerRaw): Player {
  const userId = toId(raw.userId ?? raw.user ?? raw._id) ?? '';
  return {
    userId,
    name: raw.name ?? (raw.user && (raw.user as any).name) ?? '',
    joinedAt: raw.joinedAt ? String(raw.joinedAt) : new Date().toISOString(),
  } as any;
}

export function normalizeRoom(raw: BackendRoomRaw): Room {
  return {
    code: raw.code ?? '',
    roomId: toId(raw._id ?? raw.id),
    triviaId: toId(raw.triviaId ?? undefined),
    hostId: toId(raw.hostId ?? undefined),
    status: raw.status ?? 'waiting',
    maxPlayers: raw.maxPlayers ?? 4,
    players: Array.isArray(raw.players) ? raw.players.map(normalizePlayer) : [],
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  } as any;
}

export function normalizeGameResult(raw: BackendGameResultRaw): GameResultType {
  const triviaIdObj = typeof raw.triviaId === 'string' ? { _id: raw.triviaId } : (raw.triviaId ?? { _id: '' });
  const players = (Array.isArray(raw.players) ? raw.players : []).map((p) => ({
    userId: toId(p.userId ?? (p as any)._id) ?? '',
    name: p.name ?? p.userName ?? '',
    score: p.score ?? 0,
  }));

  const winner = raw.winner ? {
    userId: toId(raw.winner.userId ?? (raw.winner as any)._id) ?? '',
    name: raw.winner.name ?? raw.winner.userName ?? '',
    score: raw.winner.score ?? 0,
  } : undefined;

  const scores: Record<string, number> = {};
  if (raw.scores instanceof Map) {
    raw.scores.forEach((v: number, k: string) => { scores[k] = v; });
  } else if (raw.scores && typeof raw.scores === 'object') {
    Object.entries(raw.scores).forEach(([k, v]) => { scores[k] = Number(v); });
  }

  return {
    roomCode: raw.roomCode ?? '',
    triviaId: { _id: triviaIdObj._id ?? '' , topic: (triviaIdObj as any).topic },
    finishedAt: raw.finishedAt ? String(raw.finishedAt) : new Date().toISOString(),
    scores,
    players,
    winner,
  };
}
