import { helloWorld } from './hello';

describe('helloWorld', () => {
  describe('Return Value', () => {
    it('should return a string', () => {
      const result = helloWorld();
      expect(typeof result).toBe('string');
    });

    it('should return exactly "Hello, World!"', () => {
      const result = helloWorld();
      expect(result).toBe('Hello, World!');
    });

    it('should return the correct greeting with proper capitalization', () => {
      const result = helloWorld();
      expect(result).toMatch(/^Hello, World!$/);
    });

    it('should have correct length', () => {
      const result = helloWorld();
      expect(result.length).toBe(13); // "Hello, World!" has 13 characters
    });

    it('should include proper punctuation', () => {
      const result = helloWorld();
      expect(result).toContain(',');
      expect(result).toContain('!');
    });
  });

  describe('Consistency', () => {
    it('should return the same value on multiple calls', () => {
      const result1 = helloWorld();
      const result2 = helloWorld();
      const result3 = helloWorld();
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('Function Signature', () => {
    it('should accept no parameters', () => {
      expect(helloWorld.length).toBe(0);
    });

    it('should work even with unexpected arguments passed', () => {
      // TypeScript prevents passing arguments, but test for robustness
      const result = (helloWorld as any)(undefined, null, {});
      expect(result).toBe('Hello, World!');
    });
  });

  describe('Edge Cases', () => {
    it('should not return empty string', () => {
      const result = helloWorld();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should not return null or undefined', () => {
      const result = helloWorld();
      expect(result).not.toBeNull();
      expect(result).toBeDefined();
    });

    it('should not contain extra whitespace', () => {
      const result = helloWorld();
      // Should not have leading/trailing spaces and only one space after comma
      expect(result).toBe('Hello, World!');
      expect(result).not.toMatch(/^\s/); // No leading whitespace
      expect(result).not.toMatch(/\s$/); // No trailing whitespace
    });
  });

  describe('Type Safety', () => {
    it('should be a function', () => {
      expect(typeof helloWorld).toBe('function');
    });

    it('result should be a primitive string, not String object', () => {
      const result = helloWorld();
      expect(Object.prototype.toString.call(result)).toBe('[object String]');
    });
  });
});
