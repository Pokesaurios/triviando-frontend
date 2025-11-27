import { describe, it, expect } from 'vitest';
import { normalizeGameResult, normalizePlayer, normalizeRoom } from './normalizers';

describe('normalizers', () => {
  it('normalizePlayer handles nested user and _id', () => {
    const raw = { userId: { _id: 'abc123' }, name: 'Alice', joinedAt: '2025-01-01T00:00:00Z' };
    const p = normalizePlayer(raw as any);
    expect(p.userId).toBe('abc123');
    expect(p.name).toBe('Alice');
    expect(typeof p.joinedAt).toBe('string');
  });

  it('normalizeRoom maps players and ids', () => {
    const raw = {
      _id: 'room1',
      code: 'ABC123',
      triviaId: { _id: 't1' },
      hostId: { _id: 'h1' },
      players: [ { userId: 'u1', name: 'Bob' } ],
    };
    const r = normalizeRoom(raw as any);
    expect(r.code).toBe('ABC123');
    expect(r.roomId).toBe('room1');
    expect(r.triviaId).toBe('t1');
    expect(Array.isArray(r.players)).toBe(true);
    expect(r.players[0].userId).toBe('u1');
  });

  it('normalizeGameResult converts scores Map/object and players', () => {
    const raw: any = {
      roomCode: 'R1',
      triviaId: { _id: 't1', topic: 'Topic' },
      finishedAt: '2025-01-01T00:00:00Z',
      scores: { 'u1': 10, 'u2': 5 },
      players: [ { userId: 'u1', name: 'Alice', score: 10 }, { userId: 'u2', name: 'Bob', score: 5 } ],
      winner: { userId: 'u1', name: 'Alice', score: 10 }
    };

    const gr = normalizeGameResult(raw);
    expect(gr.roomCode).toBe('R1');
    expect(gr.triviaId._id).toBe('t1');
    expect(gr.scores['u1']).toBe(10);
    expect(gr.players.length).toBe(2);
    expect(gr.winner?.userId).toBe('u1');
  });
});

