import { describe, it, expect, beforeEach, vi } from 'vitest';
import { roomServices } from '../../../lib/services/roomServices';
import * as apiClient from '../../../lib/api/apiClient';
import * as normalizers from '../../../lib/api/normalizers';
import { API_ENDPOINTS } from '../../../config/endpoints';
import type { BackendRoomRaw } from '../../../types/backend.types';

vi.mock('../../../lib/api/apiClient');
vi.mock('../../../lib/api/normalizers');

describe('RoomServices', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createRoom', () => {
        it('should create room successfully and normalize response', async () => {
            const mockRawRoom: BackendRoomRaw = {
                _id: 'room-123',
                code: 'ABC123',
                host_id: 'user-1',
                trivia_id: 'trivia-1',
                status: 'waiting',
                max_players: 10,
                players: [],
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            } as any;

            const mockNormalizedRoom = {
                code: 'ABC123',
                roomId: 'room-123',
                hostId: 'user-1',
                triviaId: 'trivia-1',
                status: 'waiting',
                maxPlayers: 10,
                players: [],
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            };

            const mockResponse = {
                success: true,
                data: {
                    ok: true,
                    room: mockRawRoom,
                },
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);
            vi.spyOn(normalizers, 'normalizeRoom').mockReturnValue(mockNormalizedRoom as any);

            const result = await roomServices.createRoom({
                topic: 'Science',
                maxPlayers: 10,
                quantity: 15,
            });

            expect(apiClient.apiClient.post).toHaveBeenCalledWith(
                API_ENDPOINTS.ROOMS.CREATE,
                { topic: 'Science', maxPlayers: 10, quantity: 15 },
                { requiresAuth: true }
            );
            expect(normalizers.normalizeRoom).toHaveBeenCalledWith(mockRawRoom);
            expect(result.room).toEqual(mockNormalizedRoom);
        });

        it('should return data without normalization if room is not present', async () => {
            const mockResponse = {
                success: true,
                data: {
                    ok: true,
                    message: 'Room created',
                },
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            const result = await roomServices.createRoom({
                topic: 'History',
                maxPlayers: 5,
                quantity: 10,
            });

            expect(result).toEqual({ ok: true, message: 'Room created' });
            expect(normalizers.normalizeRoom).not.toHaveBeenCalled();
        });

        it('should throw error on failed room creation', async () => {
            const mockResponse = {
                success: false,
                error: 'Invalid topic',
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            await expect(
                roomServices.createRoom({
                    topic: '',
                    maxPlayers: 10,
                    quantity: 15,
                })
            ).rejects.toThrow('Invalid topic');
        });

        it('should throw default error message when error is not provided', async () => {
            const mockResponse = {
                success: false,
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            await expect(
                roomServices.createRoom({
                    topic: 'Science',
                    maxPlayers: 10,
                    quantity: 15,
                })
            ).rejects.toThrow('Error al crear la sala');
        });

        it('should handle minimum player count', async () => {
            const mockResponse = {
                success: true,
                data: {
                    ok: true,
                    room: {
                        _id: 'room-123',
                        code: 'ABC123',
                        max_players: 2,
                        players: [],
                    } as any,
                },
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);
            vi.spyOn(normalizers, 'normalizeRoom').mockReturnValue({
                code: 'ABC123',
                maxPlayers: 2,
                players: [],
            } as any);

            const result = await roomServices.createRoom({
                topic: 'Math',
                maxPlayers: 2,
                quantity: 5,
            });

            expect(result.room?.maxPlayers).toBe(2);
        });
    });

    describe('joinRoom', () => {
        it('should join room successfully and normalize response', async () => {
            const mockRawRoom: BackendRoomRaw = {
                _id: 'room-456',
                code: 'XYZ789',
                host_id: 'user-1',
                status: 'waiting',
                max_players: 10,
                players: [
                    {
                        user_id: 'user-2',
                        name: 'Player 1',
                        joined_at: '2024-01-01T00:00:00Z',
                    },
                ],
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            } as any;

            const mockNormalizedRoom = {
                code: 'XYZ789',
                roomId: 'room-456',
                hostId: 'user-1',
                status: 'waiting',
                maxPlayers: 10,
                players: [
                    {
                        userId: 'user-2',
                        name: 'Player 1',
                        joinedAt: '2024-01-01T00:00:00Z',
                    },
                ],
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            };

            const mockResponse = {
                success: true,
                data: {
                    ok: true,
                    room: mockRawRoom,
                    message: 'Joined successfully',
                },
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);
            vi.spyOn(normalizers, 'normalizeRoom').mockReturnValue(mockNormalizedRoom as any);

            const result = await roomServices.joinRoom({
                code: 'XYZ789',
            });

            expect(apiClient.apiClient.post).toHaveBeenCalledWith(
                API_ENDPOINTS.ROOMS.JOIN,
                { code: 'XYZ789' },
                { requiresAuth: true }
            );
            expect(normalizers.normalizeRoom).toHaveBeenCalledWith(mockRawRoom);
            expect(result.room).toEqual(mockNormalizedRoom);
        });

        it('should return data without normalization if room is not present', async () => {
            const mockResponse = {
                success: true,
                data: {
                    ok: true,
                    message: 'Joined successfully',
                },
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            const result = await roomServices.joinRoom({
                code: 'XYZ789',
            });

            expect(result).toEqual({ ok: true, message: 'Joined successfully' });
            expect(normalizers.normalizeRoom).not.toHaveBeenCalled();
        });

        it('should throw error on failed room join', async () => {
            const mockResponse = {
                success: false,
                error: 'Invalid room code',
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            await expect(
                roomServices.joinRoom({ code: 'INVALID' })
            ).rejects.toThrow('Invalid room code');
        });

        it('should throw default error message when error is not provided', async () => {
            const mockResponse = {
                success: false,
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            await expect(
                roomServices.joinRoom({ code: 'XYZ789' })
            ).rejects.toThrow('Error al unirse a la sala');
        });

        it('should handle room at full capacity error', async () => {
            const mockResponse = {
                success: false,
                error: 'Room is full',
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            await expect(
                roomServices.joinRoom({ code: 'FULL123' })
            ).rejects.toThrow('Room is full');
        });
    });

    describe('getRoomByCode', () => {
        it('should get room by code and normalize response', async () => {
            const mockRawRoom: BackendRoomRaw = {
                _id: 'room-789',
                code: 'GET123',
                host_id: 'user-1',
                trivia_id: 'trivia-1',
                status: 'in_progress',
                max_players: 8,
                players: [
                    {
                        user_id: 'user-1',
                        name: 'Host',
                        joined_at: '2024-01-01T00:00:00Z',
                    },
                ],
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            } as any;

            const mockNormalizedRoom = {
                code: 'GET123',
                roomId: 'room-789',
                hostId: 'user-1',
                triviaId: 'trivia-1',
                status: 'in_progress',
                maxPlayers: 8,
                players: [
                    {
                        userId: 'user-1',
                        name: 'Host',
                        joinedAt: '2024-01-01T00:00:00Z',
                    },
                ],
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            };

            const mockResponse = {
                success: true,
                data: {
                    source: 'database',
                    room: mockRawRoom,
                },
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);
            vi.spyOn(normalizers, 'normalizeRoom').mockReturnValue(mockNormalizedRoom as any);

            const result = await roomServices.getRoomByCode('GET123');

            expect(apiClient.apiClient.get).toHaveBeenCalledWith(
                API_ENDPOINTS.ROOMS.GET_BY_CODE('GET123'),
                { requiresAuth: true }
            );
            expect(normalizers.normalizeRoom).toHaveBeenCalledWith(mockRawRoom);
            expect(result).toEqual(mockNormalizedRoom);
        });

        it('should fallback to raw room if normalization fails', async () => {
            const mockRawRoom: BackendRoomRaw = {
                _id: 'room-789',
                code: 'GET123',
                host_id: 'user-1',
                players: [],
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            } as any;

            const mockResponse = {
                success: true,
                data: {
                    source: 'cache',
                    room: mockRawRoom,
                },
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);
            vi.spyOn(normalizers, 'normalizeRoom').mockImplementation(() => {
                throw new Error('Normalization failed');
            });

            const result = await roomServices.getRoomByCode('GET123');

            expect(result).toEqual(mockRawRoom);
        });

        it('should throw error when room is not found', async () => {
            const mockResponse = {
                success: false,
                error: 'Room not found',
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);

            await expect(
                roomServices.getRoomByCode('NOTFOUND')
            ).rejects.toThrow('Room not found');
        });

        it('should throw default error message when error is not provided', async () => {
            const mockResponse = {
                success: false,
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);

            await expect(
                roomServices.getRoomByCode('GET123')
            ).rejects.toThrow('Error al obtener la sala');
        });

        it('should handle empty room data', async () => {
            const mockResponse = {
                success: true,
                data: {
                    source: 'database',
                    room: null,
                },
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);

            const result = await roomServices.getRoomByCode('GET123');

            expect(result).toBeNull();
            expect(normalizers.normalizeRoom).not.toHaveBeenCalled();
        });

        it('should handle room code case sensitivity', async () => {
            const mockRawRoom: BackendRoomRaw = {
                _id: 'room-case',
                code: 'abc123',
                players: [],
            } as any;

            const mockResponse = {
                success: true,
                data: {
                    source: 'database',
                    room: mockRawRoom,
                },
            };

            vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockResponse);
            vi.spyOn(normalizers, 'normalizeRoom').mockReturnValue({
                code: 'abc123',
                players: [],
            } as any);

            await roomServices.getRoomByCode('abc123');

            expect(apiClient.apiClient.get).toHaveBeenCalledWith(
                API_ENDPOINTS.ROOMS.GET_BY_CODE('abc123'),
                { requiresAuth: true }
            );
        });
    });
});