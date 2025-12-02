import { describe, it, expect } from 'vitest';
import { validateMaxPlayers, validateTopic } from '../../utils/validation';

describe('validateMaxPlayers', () => {
    it('should return invalid for NaN', () => {
        const result = validateMaxPlayers(NaN);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('El número de jugadores debe ser mayor que 0.');
    });

    it('should return invalid for zero', () => {
        const result = validateMaxPlayers(0);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('El número de jugadores debe ser mayor que 0.');
    });

    it('should return invalid for negative numbers', () => {
        const result = validateMaxPlayers(-5);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('El número de jugadores debe ser mayor que 0.');
    });

    it('should return invalid for more than 20 players', () => {
        const result = validateMaxPlayers(21);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('El número máximo de jugadores es 20.');
    });

    it('should return valid for 1 player', () => {
        const result = validateMaxPlayers(1);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should return valid for 20 players', () => {
        const result = validateMaxPlayers(20);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should return valid for mid-range players', () => {
        const result = validateMaxPlayers(10);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
    });
});

describe('validateTopic', () => {
    it('should return false for empty string', () => {
        expect(validateTopic('')).toBe(false);
    });

    it('should return false for whitespace only', () => {
        expect(validateTopic('   ')).toBe(false);
    });

    it('should return true for valid topic', () => {
        expect(validateTopic('History')).toBe(true);
    });

    it('should return true for topic with spaces', () => {
        expect(validateTopic('Science and Technology')).toBe(true);
    });
});