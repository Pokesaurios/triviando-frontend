import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '../../../lib/api/apiClient';

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

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('ApiClient', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('GET requests', () => {
        it('should make a successful GET request', async () => {
            const mockData = { id: 1, name: 'Test' };
            vi.stubGlobal('fetch', vi.fn(() =>
                Promise.resolve(new Response(JSON.stringify(mockData), { status: 200 }))
            ));

            const result = await apiClient.get('/test');
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockData);
        });

        it('should include auth header when requiresAuth is true', async () => {
            const token = 'test-token';
            localStorage.setItem('token', token);
            const fetchMock = vi.fn(() =>
                Promise.resolve(new Response(JSON.stringify({}), { status: 200 }))
            );
            vi.stubGlobal('fetch', fetchMock);

            await apiClient.get('/protected', { requiresAuth: true });
            expect(fetchMock).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: `Bearer ${token}`,
                    }),
                })
            );
        });

        it('should handle GET request errors', async () => {
            vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

            const result = await apiClient.get('/test');
            expect(result.success).toBe(false);
            expect(result.error).toContain('Error de conexión');
        });
    });

    describe('POST requests', () => {
        it('should make a successful POST request with body', async () => {
            const mockData = { id: 1 };
            const postBody = { name: 'Test' };
            vi.stubGlobal('fetch', vi.fn(() =>
                Promise.resolve(new Response(JSON.stringify(mockData), { status: 200 }))
            ));

            const result = await apiClient.post('/test', postBody);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockData);
        });

        it('should handle POST request errors', async () => {
            vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

            const result = await apiClient.post('/test', {});
            expect(result.success).toBe(false);
            expect(result.error).toContain('Error de conexión');
        });
    });

    describe('PUT requests', () => {
        it('should make a successful PUT request', async () => {
            const mockData = { id: 1, updated: true };
            vi.stubGlobal('fetch', vi.fn(() =>
                Promise.resolve(new Response(JSON.stringify(mockData), { status: 200 }))
            ));

            const result = await apiClient.put('/test/1', { name: 'Updated' });
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockData);
        });
    });

    describe('DELETE requests', () => {
        it('should make a successful DELETE request', async () => {
            vi.stubGlobal('fetch', vi.fn(() =>
                Promise.resolve(new Response(JSON.stringify({ deleted: true }), { status: 200 }))
            ));

            const result = await apiClient.delete('/test/1');
            expect(result.success).toBe(true);
        });
    });

    describe('Error handling', () => {

        it('should handle JSON parse errors gracefully', async () => {
            vi.stubGlobal('fetch', vi.fn(() =>
                Promise.resolve(new Response('Invalid JSON', { status: 200 }))
            ));

            const result = await apiClient.get('/test');
            expect(result.success).toBe(false);
            expect(result.error).toContain('Error en la respuesta del servidor');
        });

        it('should handle server errors with message', async () => {
            const errorMessage = 'Custom error message';
            vi.stubGlobal('fetch', vi.fn(() =>
                Promise.resolve(
                    new Response(JSON.stringify({ message: errorMessage }), { status: 500 })
                )
            ));

            const result = await apiClient.get('/test');
            expect(result.success).toBe(false);
            expect(result.error).toBe(errorMessage);
        });

        it('should handle empty response body', async () => {
            vi.stubGlobal('fetch', vi.fn(() =>
                Promise.resolve(new Response('', { status: 200 }))
            ));

            const result = await apiClient.get('/test');
            expect(result.success).toBe(true);
            expect(result.data).toEqual({});
        });
    });
});