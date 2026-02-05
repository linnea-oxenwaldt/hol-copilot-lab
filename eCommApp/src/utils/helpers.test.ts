import { describe, it, expect } from 'vitest';
import { formatPrice, calculateTotal, validateEmail } from './helpers';

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    it('should format a number as USD currency', () => {
      expect(formatPrice(29.99)).toBe('$29.99');
    });

    it('should format zero correctly', () => {
      expect(formatPrice(0)).toBe('$0.00');
    });

    it('should format large numbers correctly', () => {
      expect(formatPrice(1234.56)).toBe('$1,234.56');
    });

    it('should round to two decimal places', () => {
      expect(formatPrice(10.999)).toBe('$11.00');
    });

    it('should handle negative numbers', () => {
      expect(formatPrice(-50.25)).toBe('-$50.25');
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total for single item', () => {
      const items = [{ price: 10, quantity: 2 }];
      expect(calculateTotal(items)).toBe(20);
    });

    it('should calculate total for multiple items', () => {
      const items = [
        { price: 10, quantity: 2 },
        { price: 20, quantity: 3 },
        { price: 5, quantity: 1 }
      ];
      expect(calculateTotal(items)).toBe(85);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotal([])).toBe(0);
    });

    it('should handle decimal prices', () => {
      const items = [{ price: 9.99, quantity: 3 }];
      expect(calculateTotal(items)).toBeCloseTo(29.97, 2);
    });

    it('should handle zero quantity', () => {
      const items = [{ price: 100, quantity: 0 }];
      expect(calculateTotal(items)).toBe(0);
    });

    it('should handle zero price', () => {
      const items = [{ price: 0, quantity: 5 }];
      expect(calculateTotal(items)).toBe(0);
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co')).toBe(true);
      expect(validateEmail('name+tag@test.com')).toBe(true);
      expect(validateEmail('a@b.c')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@nodomain.com')).toBe(false);
      expect(validateEmail('noatsign.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('spaces in@email.com')).toBe(false);
    });

    it('should return false for email with multiple @ symbols', () => {
      expect(validateEmail('double@@email.com')).toBe(false);
    });
  });
});
