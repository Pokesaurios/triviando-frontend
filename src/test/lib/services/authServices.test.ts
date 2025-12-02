import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '../../../lib/services/authServices';
import * as apiClient from '../../../lib/api/apiClient';
import * as socket from '../../../lib/socket';

vi.mock('../../../lib/api/apiClient');
vi.mock('../../../lib/socket');

const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

;(globalThis as any).localStorage = localStorageMock as Storage;

describe('AuthService', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('login', () => {
        it('should login successfully and save auth data', async () => {
            const mockResponse = {
                success: true,
                data: {
                    token: 'test-token',
                    user: { id: '1', email: 'test@test.com', name: 'Test User' },
                },
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            const result = await authService.login({ email: 'test@test.com', password: 'password' });

            expect(result.success).toBe(true);
            expect(result.token).toBe('test-token');
            expect(socket.connectSocket).toHaveBeenCalledWith('test-token');
            expect(localStorage.getItem('token')).toBe('test-token');
        });

        it('should return error on failed login', async () => {
            const mockResponse = { success: false, error: 'Invalid credentials' };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            const result = await authService.login({ email: 'test@test.com', password: 'wrong' });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid credentials');
        });
    });

    describe('register', () => {
        it('should register successfully', async () => {
            const mockResponse = {
                success: true,
                data: {
                    token: 'new-token',
                    user: { id: '2', email: 'new@test.com', name: 'New User' },
                },
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            const result = await authService.register({
                username: 'New User',
                email: 'new@test.com',
                password: 'password123',
            });

            expect(result.success).toBe(true);
            expect(socket.connectSocket).toHaveBeenCalledWith('new-token');
        });

        it('should return error on failed registration', async () => {
            const mockResponse = { success: false, error: 'Email already exists' };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            const result = await authService.register({
                username: 'User',
                email: 'existing@test.com',
                password: 'password',
            });

            expect(result.success).toBe(false);
        });
    });

    describe('logout', () => {
        it('should logout and clear auth data', async () => {
            localStorage.setItem('token', 'test-token');

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue({ success: true });

            await authService.logout();

            expect(socket.cleanupSocket).toHaveBeenCalled();
            expect(localStorage.getItem('token')).toBeNull();
        });
    });

    describe('getCurrentUser', () => {
        it('should return null if no user in storage', () => {
            const result = authService.getCurrentUser();

            expect(result).toBeNull();
        });
    });

    describe('isAuthenticated', () => {
        it('should return true if token exists', () => {
            localStorage.setItem('token', 'test-token');

            expect(authService.isAuthenticated()).toBe(true);
        });

        it('should return false if no token', () => {
            expect(authService.isAuthenticated()).toBe(false);
        });
    });

    describe('getToken', () => {
        it('should return token from localStorage', () => {
            localStorage.setItem('token', 'test-token');

            expect(authService.getToken()).toBe('test-token');
        });
    });

    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            const mockResponse = {
                success: true,
                data: {
                    token: 'refreshed-token',
                    user: { id: '1', email: 'test@test.com', name: 'Test User' },
                },
            };

            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockResponse);

            const result = await authService.refreshToken();

            expect(result).toBe(true);
            expect(socket.connectSocket).toHaveBeenCalledWith('refreshed-token');
        });

        it('should return false on refresh failure', async () => {
            vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue({ success: false });

            const result = await authService.refreshToken();

            expect(result).toBe(false);
        });
    });
});