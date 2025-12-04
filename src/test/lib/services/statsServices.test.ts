import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getGameResults } from '../../../lib/services/statsServices';
import * as apiClient from '../../../lib/api/apiClient';
import * as normalizers from '../../../lib/api/normalizers';
import type { BackendGameResultRaw } from '../../../types/backend.types';
import type { GameResultType } from '../../../types/stats.types';

vi.mock('../../../lib/api/apiClient');
vi.mock('../../../lib/api/normalizers');

describe('StatsServices', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getGameResults', () => {
        it('should return empty array when no game results exist', async () => {
            const mockResponse = {
                success: true,
                data: [],
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);

            const results = await getGameResults();

            expect(apiClient.apiClient.get).toHaveBeenCalledWith('/game-results', { requiresAuth: true });
            expect(normalizers.normalizeGameResult).not.toHaveBeenCalled();
            expect(results).toEqual([]);
            expect(results).toHaveLength(0);
        });

        it('should handle null data response', async () => {
            const mockResponse = {
                success: true,
                data: null,
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);

            const results = await getGameResults();

            expect(results).toEqual([]);
            expect(normalizers.normalizeGameResult).not.toHaveBeenCalled();
        });

        it('should handle undefined data response', async () => {
            const mockResponse = {
                success: true,
                data: undefined,
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);

            const results = await getGameResults();

            expect(results).toEqual([]);
            expect(normalizers.normalizeGameResult).not.toHaveBeenCalled();
        });

        it('should normalize single game result correctly', async () => {
            const mockRawResult: BackendGameResultRaw = {
                room_code: 'SINGLE1',
                trivia_id: {
                    _id: 'trivia-single',
                    topic: 'Geography',
                },
                finished_at: '2024-01-03T10:00:00Z',
                scores: {
                    'user-5': 120,
                },
                players: [
                    {
                        user_id: 'user-5',
                        name: 'Solo Player',
                        score: 120,
                    },
                ],
                winner: {
                    user_id: 'user-5',
                    name: 'Solo Player',
                    score: 120,
                },
            } as any;

            const mockNormalizedResult: GameResultType = {
                roomCode: 'SINGLE1',
                triviaId: {
                    _id: 'trivia-single',
                    topic: 'Geography',
                },
                finishedAt: '2024-01-03T10:00:00Z',
                scores: {
                    'user-5': 120,
                },
                players: [
                    {
                        userId: 'user-5',
                        name: 'Solo Player',
                        score: 120,
                    },
                ],
                winner: {
                    userId: 'user-5',
                    name: 'Solo Player',
                    score: 120,
                },
            };

            const mockResponse = {
                success: true,
                data: [mockRawResult],
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);
            vi.spyOn(normalizers, 'normalizeGameResult').mockReturnValue(mockNormalizedResult);

            const results = await getGameResults();

            expect(results).toHaveLength(1);
            expect(results[0]).toEqual(mockNormalizedResult);
        });

        it('should handle game results without winner', async () => {
            const mockRawResult: BackendGameResultRaw = {
                room_code: 'NOWINNER',
                trivia_id: {
                    _id: 'trivia-tie',
                },
                finished_at: '2024-01-04T14:00:00Z',
                scores: {
                    'user-6': 50,
                    'user-7': 50,
                },
                players: [
                    {
                        user_id: 'user-6',
                        name: 'Player Six',
                        score: 50,
                    },
                    {
                        user_id: 'user-7',
                        name: 'Player Seven',
                        score: 50,
                    },
                ],
            } as any;

            const mockNormalizedResult: GameResultType = {
                roomCode: 'NOWINNER',
                triviaId: {
                    _id: 'trivia-tie',
                },
                finishedAt: '2024-01-04T14:00:00Z',
                scores: {
                    'user-6': 50,
                    'user-7': 50,
                },
                players: [
                    {
                        userId: 'user-6',
                        name: 'Player Six',
                        score: 50,
                    },
                    {
                        userId: 'user-7',
                        name: 'Player Seven',
                        score: 50,
                    },
                ],
            };

            const mockResponse = {
                success: true,
                data: [mockRawResult],
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);
            vi.spyOn(normalizers, 'normalizeGameResult').mockReturnValue(mockNormalizedResult);

            const results = await getGameResults();

            expect(results).toHaveLength(1);
            expect(results[0].winner).toBeUndefined();
        });

        it('should handle game results without topic in triviaId', async () => {
            const mockRawResult: BackendGameResultRaw = {
                room_code: 'NOTOPIC',
                trivia_id: {
                    _id: 'trivia-no-topic',
                },
                finished_at: '2024-01-05T16:00:00Z',
                scores: {
                    'user-8': 75,
                },
                players: [
                    {
                        user_id: 'user-8',
                        name: 'Player Eight',
                        score: 75,
                    },
                ],
                winner: {
                    user_id: 'user-8',
                    name: 'Player Eight',
                    score: 75,
                },
            } as any;

            const mockNormalizedResult: GameResultType = {
                roomCode: 'NOTOPIC',
                triviaId: {
                    _id: 'trivia-no-topic',
                },
                finishedAt: '2024-01-05T16:00:00Z',
                scores: {
                    'user-8': 75,
                },
                players: [
                    {
                        userId: 'user-8',
                        name: 'Player Eight',
                        score: 75,
                    },
                ],
                winner: {
                    userId: 'user-8',
                    name: 'Player Eight',
                    score: 75,
                },
            };

            const mockResponse = {
                success: true,
                data: [mockRawResult],
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);
            vi.spyOn(normalizers, 'normalizeGameResult').mockReturnValue(mockNormalizedResult);

            const results = await getGameResults();

            expect(results).toHaveLength(1);
            expect(results[0].triviaId.topic).toBeUndefined();
        });

        it('should handle multiple players with varying scores', async () => {
            const mockRawResult: BackendGameResultRaw = {
                room_code: 'MULTI123',
                trivia_id: {
                    _id: 'trivia-multi',
                    topic: 'Mixed Topics',
                },
                finished_at: '2024-01-06T18:00:00Z',
                scores: {
                    'user-9': 95,
                    'user-10': 70,
                    'user-11': 85,
                    'user-12': 60,
                },
                players: [
                    { user_id: 'user-9', name: 'Player Nine', score: 95 },
                    { user_id: 'user-10', name: 'Player Ten', score: 70 },
                    { user_id: 'user-11', name: 'Player Eleven', score: 85 },
                    { user_id: 'user-12', name: 'Player Twelve', score: 60 },
                ],
                winner: {
                    user_id: 'user-9',
                    name: 'Player Nine',
                    score: 95,
                },
            } as any;

            const mockNormalizedResult: GameResultType = {
                roomCode: 'MULTI123',
                triviaId: {
                    _id: 'trivia-multi',
                    topic: 'Mixed Topics',
                },
                finishedAt: '2024-01-06T18:00:00Z',
                scores: {
                    'user-9': 95,
                    'user-10': 70,
                    'user-11': 85,
                    'user-12': 60,
                },
                players: [
                    { userId: 'user-9', name: 'Player Nine', score: 95 },
                    { userId: 'user-10', name: 'Player Ten', score: 70 },
                    { userId: 'user-11', name: 'Player Eleven', score: 85 },
                    { userId: 'user-12', name: 'Player Twelve', score: 60 },
                ],
                winner: {
                    userId: 'user-9',
                    name: 'Player Nine',
                    score: 95,
                },
            };

            const mockResponse = {
                success: true,
                data: [mockRawResult],
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);
            vi.spyOn(normalizers, 'normalizeGameResult').mockReturnValue(mockNormalizedResult);

            const results = await getGameResults();

            expect(results).toHaveLength(1);
            expect(results[0].players).toHaveLength(4);
            expect(Object.keys(results[0].scores)).toHaveLength(4);
        });

        it('should handle API errors gracefully', async () => {
            vi.spyOn(apiClient.apiClient, 'get').mockRejectedValue(
                new Error('Network error')
            );

            await expect(getGameResults()).rejects.toThrow('Network error');
            expect(normalizers.normalizeGameResult).not.toHaveBeenCalled();
        });
    });
});