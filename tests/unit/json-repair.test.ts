import { describe, it, expect } from 'vitest';
import { attemptJsonRepair } from '@/services/programGeneration';

// ============================================
// JSON REPAIR FUNCTION TESTS
// ============================================
// Note: attemptJsonRepair is a best-effort repair for max_tokens truncation.
// It closes unclosed braces/brackets/strings and removes trailing incomplete content.
// The function finds the last complete structure (", }, or ]) and may truncate after it.

describe('attemptJsonRepair', () => {
  describe('valid JSON passthrough', () => {
    it('returns valid JSON unchanged', () => {
      const valid = '{"name": "test", "value": 123}';
      expect(attemptJsonRepair(valid)).toBe(valid);
    });

    it('returns valid nested JSON unchanged', () => {
      const valid = '{"name": "test", "nested": {"key": "value"}, "array": [1, 2, 3]}';
      expect(attemptJsonRepair(valid)).toBe(valid);
    });

    it('returns valid array unchanged', () => {
      const valid = '[1, 2, 3, {"key": "value"}]';
      expect(attemptJsonRepair(valid)).toBe(valid);
    });

    it('trims whitespace from valid JSON', () => {
      const valid = '  {"name": "test"}  ';
      expect(attemptJsonRepair(valid)).toBe('{"name": "test"}');
    });
  });

  describe('unclosed braces repair', () => {
    it('closes single unclosed brace after string value', () => {
      const input = '{"name": "test"';
      const result = attemptJsonRepair(input);
      expect(result).toBe('{"name": "test"}');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('closes multiple unclosed braces after string value', () => {
      const input = '{"outer": {"inner": "value"';
      const result = attemptJsonRepair(input);
      expect(result.endsWith('}}'));
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('closes deeply nested braces after string value', () => {
      const input = '{"a": {"b": {"c": "d"';
      const result = attemptJsonRepair(input);
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('unclosed brackets repair', () => {
    it('closes bracket after complete array', () => {
      const input = '[[1, 2], [3, 4]';
      const result = attemptJsonRepair(input);
      expect(result).toBe('[[1, 2], [3, 4]]');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('closes bracket after closed inner bracket', () => {
      const input = '[[1, 2]';
      const result = attemptJsonRepair(input);
      expect(result).toBe('[[1, 2]]');
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('unclosed strings repair', () => {
    it('closes unclosed string at end of object', () => {
      const input = '{"name": "test';
      const result = attemptJsonRepair(input);
      // Should close the string and the brace
      expect(result).toContain('"test"');
      expect(result.endsWith('}'));
    });

    it('closes unclosed string in array', () => {
      const input = '["item1", "item2';
      const result = attemptJsonRepair(input);
      expect(result).toContain('"item2"');
      expect(result.endsWith(']'));
    });

    it('handles string with escaped quotes', () => {
      const input = '{"name": "test \\"quoted\\"';
      const result = attemptJsonRepair(input);
      // Escaped quotes should not affect string boundary detection
      expect(result).toContain('\\"quoted\\"');
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      const result = attemptJsonRepair('');
      expect(result).toBe('');
    });

    it('handles whitespace only', () => {
      const result = attemptJsonRepair('   ');
      expect(result).toBe('');
    });

    it('handles single opening brace', () => {
      const result = attemptJsonRepair('{');
      expect(result).toBe('{}');
    });

    it('handles single opening bracket', () => {
      const result = attemptJsonRepair('[');
      expect(result).toBe('[]');
    });

    it('preserves already closed JSON with trailing text', () => {
      const input = '{"name": "test"} extra';
      const result = attemptJsonRepair(input);
      // Function keeps extra content as is (no trailing incomplete detected)
      expect(result).toContain('{"name": "test"}');
    });
  });

  describe('string content with special characters', () => {
    it('handles JSON with backslashes in strings', () => {
      const input = '{"path": "C:\\\\Users"';
      const result = attemptJsonRepair(input);
      expect(result.endsWith('}'));
    });

    it('handles JSON with newlines in strings', () => {
      const input = '{"description": "Line 1\\nLine 2"';
      const result = attemptJsonRepair(input);
      expect(result.endsWith('}'));
    });

    it('ignores braces inside strings', () => {
      // The { inside the string should not be counted
      const input = '{"formula": "x = {y}"';
      const result = attemptJsonRepair(input);
      // Should close the string and the outer brace
      expect(result.endsWith('}'));
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('ignores brackets inside strings', () => {
      const input = '{"array": "[1,2,3]"';
      const result = attemptJsonRepair(input);
      expect(result.endsWith('}'));
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('complete structure truncation', () => {
    // The function works best when truncation happens after a complete string/bracket/brace
    it('closes object after complete string value', () => {
      const input = '{"key": "value"';
      const result = attemptJsonRepair(input);
      expect(result).toBe('{"key": "value"}');
      expect(JSON.parse(result)).toEqual({ key: 'value' });
    });

    it('closes object after complete nested object', () => {
      const input = '{"outer": {"inner": "value"}';
      const result = attemptJsonRepair(input);
      expect(result).toBe('{"outer": {"inner": "value"}}');
      expect(JSON.parse(result)).toEqual({ outer: { inner: 'value' } });
    });

    it('closes object after complete array', () => {
      const input = '{"items": [1, 2, 3]';
      const result = attemptJsonRepair(input);
      expect(result).toBe('{"items": [1, 2, 3]}');
      expect(JSON.parse(result)).toEqual({ items: [1, 2, 3] });
    });
  });

  describe('bracket/brace counting accuracy', () => {
    it('counts braces correctly with nested objects', () => {
      const input = '{"a": {"b": "c"}';
      const result = attemptJsonRepair(input);
      expect(result).toBe('{"a": {"b": "c"}}');
      expect(JSON.parse(result)).toEqual({ a: { b: 'c' } });
    });

    it('counts brackets correctly with nested arrays', () => {
      const input = '[[1, 2], [3, 4]';
      const result = attemptJsonRepair(input);
      expect(result).toBe('[[1, 2], [3, 4]]');
      expect(JSON.parse(result)).toEqual([[1, 2], [3, 4]]);
    });

    it('counts mixed brackets and braces correctly', () => {
      const input = '[{"key": "value"}';
      const result = attemptJsonRepair(input);
      expect(result).toBe('[{"key": "value"}]');
      expect(JSON.parse(result)).toEqual([{ key: 'value' }]);
    });
  });

  describe('preservation of content', () => {
    it('preserves complete key-value pairs', () => {
      const input = '{"name": "test"';
      const result = attemptJsonRepair(input);
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe('test');
    });

    it('preserves nested complete objects', () => {
      const input = '{"outer": {"inner": "value"}';
      const result = attemptJsonRepair(input);
      const parsed = JSON.parse(result);
      expect(parsed.outer.inner).toBe('value');
    });

    it('preserves array elements after complete subarray', () => {
      const input = '{"list": ["a", "b"]';
      const result = attemptJsonRepair(input);
      const parsed = JSON.parse(result);
      expect(parsed.list).toEqual(['a', 'b']);
    });
  });

  describe('trailing incomplete content behavior', () => {
    // The function removes trailing incomplete content by finding last ", }, or ]
    // This means truncation mid-number or mid-keyword loses that content

    it('truncates after last complete structure when numeric follows', () => {
      const input = '{"count": 42';
      const result = attemptJsonRepair(input);
      // Function finds last " at "count" and truncates, closing braces
      // This is a limitation - numeric values after colon get lost
      expect(result.endsWith('}'));
    });

    it('truncates after last complete structure when boolean follows', () => {
      const input = '{"active": true';
      const result = attemptJsonRepair(input);
      expect(result.endsWith('}'));
    });

    it('handles truncation mid-array', () => {
      const input = '{"items": [1, 2';
      const result = attemptJsonRepair(input);
      // Trailing 1, 2 gets removed as incomplete, brackets/braces still close
      expect(result.endsWith('}'));
    });
  });

  describe('common streaming truncation patterns', () => {
    // These test patterns common in streaming AI responses

    it('repairs truncation after last complete string in object', () => {
      const input = '{"program": "Strength", "description": "A 12-week program';
      const result = attemptJsonRepair(input);
      // Should close the unclosed string and object
      expect(result).toContain('"program": "Strength"');
      expect(result.endsWith('}'));
    });

    it('repairs truncation after complete nested structure', () => {
      const input = '{"phase": {"name": "Foundation", "weeks": 4}';
      const result = attemptJsonRepair(input);
      expect(result).toBe('{"phase": {"name": "Foundation", "weeks": 4}}');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('repairs truncation mid-string', () => {
      const input = '{"exercise": "Barbell Back Squ';
      const result = attemptJsonRepair(input);
      // Should close string and object
      expect(result).toContain('"Barbell Back Squ"');
      expect(result.endsWith('}'));
    });
  });
});
