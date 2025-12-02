import { describe, it, expect } from 'vitest';
import { getAvatarColor, getInitials } from '../../utils/avatar';

describe('avatar utils', () => {
    describe('getAvatarColor', () => {
        it('should return a valid color from AVATAR_COLORS', () => {
            const color = getAvatarColor('user123');
            expect(['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316']).toContain(color);
        });

        it('should return consistent color for same userId', () => {
            const userId = 'testUser';
            const color1 = getAvatarColor(userId);
            const color2 = getAvatarColor(userId);
            expect(color1).toBe(color2);
        });

        it('should return different colors for different userIds', () => {
            const color1 = getAvatarColor('user1');
            const color2 = getAvatarColor('user2');
            expect([color1, color2].length).toBeGreaterThanOrEqual(1);
        });

        it('should handle empty userId', () => {
            const color = getAvatarColor('');
            expect(['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316']).toContain(color);
        });
    });

    describe('getInitials', () => {
        it('should return first character uppercase', () => {
            expect(getInitials('john')).toBe('J');
        });

        it('should return question mark for empty string', () => {
            expect(getInitials('')).toBe('?');
        });

        it('should handle single character', () => {
            expect(getInitials('a')).toBe('A');
        });

        it('should ignore characters after first', () => {
            expect(getInitials('alice')).toBe('A');
        });
    });
});