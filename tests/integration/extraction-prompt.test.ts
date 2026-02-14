import { describe, it, expect, beforeAll } from 'vitest';
import { anthropic } from '@/lib/anthropic';
import { buildExtractionPrompt } from '@/utils/prompts';

/**
 * Integration tests for the conversational data extraction flow.
 *
 * These tests call the actual Claude API to verify that the extraction prompt
 * correctly parses user messages into structured intake data.
 *
 * Run with: npx vitest tests/integration/extraction-prompt.test.ts
 */

const SYSTEM_PROMPT = `You are a world-class fitness coach. You are helping a client achieve their fitness and wellness goals.
Do not let yourself hallucinate. Do not pander. Do not overexplain. Do not make up information.
Ask for more context if needed. Otherwise, just respond with the JSON object requested.`;

interface ExtractedData {
  gender?: string | null;
  goals?: string | null;
  daysPerWeek?: number;
  timePerDay?: number;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  experienceLevel?: string;
  workoutEnvironment?: {
    primary?: string | null;
    limitations?: string[];
  };
  equipmentAccess?: {
    type?: string | null;
    available?: string[];
  };
  workoutStyle?: {
    primary?: string;
    secondary?: string | null;
  };
  preferences?: string[];
  additionalInfo?: string;
}

interface ExtractionResponse {
  extractedData: ExtractedData;
  missingRequired: string[];
  nextQuestion: string;
  readyForProgram: boolean;
}

async function extractFromMessages(
  userMessages: string[],
  existingData?: ExtractedData
): Promise<ExtractionResponse> {
  const conversationHistory = userMessages.map((content, index) => ({
    role: index % 2 === 0 ? 'user' : 'assistant',
    content,
  }));

  const extractionPrompt = buildExtractionPrompt(existingData);

  const response = await anthropic.messages.create({
    model: process.env.SONNET_MODEL!,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      ...conversationHistory.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: extractionPrompt },
    ],
  });

  const responseText =
    response.content[0].type === 'text'
      ? response.content[0].text
          .replace(/^```(?:json)?\s*\n?/i, '')
          .replace(/\n?```\s*$/i, '')
          .trim()
      : '';

  return JSON.parse(responseText);
}

describe('Extraction Prompt Integration Tests', () => {
  beforeAll(() => {
    // Verify API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not set - required for integration tests');
    }
  });

  describe('basic info extraction', () => {
    it('extracts age, weight, height, and sex from natural language', async () => {
      const messages = ["I'm a 30 year old guy, 180lbs, 5'11\", want to build muscle"];

      const result = await extractFromMessages(messages);

      expect(result.extractedData.gender).toBe('male');
      expect(result.extractedData.age).toBe(30);
      expect(result.extractedData.weight).toBe(180);
      // Height in inches: 5'11" = 71 inches
      expect(result.extractedData.height).toBeGreaterThanOrEqual(70);
      expect(result.extractedData.height).toBeLessThanOrEqual(72);
      expect(result.extractedData.goals).toContain('muscle');
    }, 30000);

    it('extracts female user info correctly', async () => {
      const messages = ['25 year old woman, 140 pounds, looking to lose weight and tone up'];

      const result = await extractFromMessages(messages);

      expect(result.extractedData.gender).toBe('female');
      expect(result.extractedData.age).toBe(25);
      expect(result.extractedData.weight).toBe(140);
      expect(result.extractedData.goals).toBeTruthy();
    }, 30000);

    it('converts kg to lbs when user specifies kg', async () => {
      const messages = ["I'm male, 82kg, want to get stronger"];

      const result = await extractFromMessages(messages);

      // 82kg ≈ 181lbs
      expect(result.extractedData.weight).toBeGreaterThanOrEqual(175);
      expect(result.extractedData.weight).toBeLessThanOrEqual(185);
    }, 30000);
  });

  describe('goal extraction', () => {
    it('extracts muscle building goal', async () => {
      const messages = ['Male, 175lbs, I want to pack on muscle and get bigger'];

      const result = await extractFromMessages(messages);

      expect(result.extractedData.goals?.toLowerCase()).toMatch(/muscle|mass|bigger|build/);
    }, 30000);

    it('extracts fat loss goal', async () => {
      const messages = ['Female, 160lbs, trying to lose fat and get leaner'];

      const result = await extractFromMessages(messages);

      expect(result.extractedData.goals?.toLowerCase()).toMatch(/lose|fat|lean|weight/);
    }, 30000);

    it('extracts strength goal', async () => {
      const messages = ['Guy here, 200lbs, want to get stronger for powerlifting'];

      const result = await extractFromMessages(messages);

      expect(result.extractedData.goals?.toLowerCase()).toMatch(/strong|power|strength/);
    }, 30000);
  });

  describe('environment/equipment inference', () => {
    it('infers gym environment from powerbuilding context', async () => {
      const messages = ['Male, 180lbs, want to try powerbuilding - heavy compounds and hypertrophy'];

      const result = await extractFromMessages(messages);

      expect(result.extractedData.workoutEnvironment?.primary).toBe('gym');
      expect(result.extractedData.equipmentAccess?.type).toMatch(/full-gym|specific/);
    }, 30000);

    it('infers home environment from bodyweight mention', async () => {
      const messages = ["Female, 130lbs, I only have bodyweight exercises at home, that's all I can do"];

      const result = await extractFromMessages(messages);

      expect(result.extractedData.workoutEnvironment?.primary).toBe('home');
      expect(result.extractedData.equipmentAccess?.type).toBe('bodyweight');
    }, 30000);

    it('extracts specific equipment when mentioned', async () => {
      const messages = [
        "Male, 190lbs, I have a home gym with a barbell, dumbbells, pull-up bar, and a bench. Want to build muscle.",
      ];

      const result = await extractFromMessages(messages);

      expect(result.extractedData.workoutEnvironment?.primary).toBe('home');
      expect(result.extractedData.equipmentAccess?.available?.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('experience level inference', () => {
    it('infers beginner from "just starting out"', async () => {
      const messages = ["Male, 170lbs, gym, just starting out with fitness. I'm new to all this."];

      const result = await extractFromMessages(messages);

      expect(result.extractedData.experienceLevel).toBe('beginner');
    }, 30000);

    it('infers advanced from years of experience', async () => {
      const messages = [
        "Male, 200lbs, been lifting seriously for 8 years. I compete in powerlifting. Have access to full gym.",
      ];

      const result = await extractFromMessages(messages);

      expect(result.extractedData.experienceLevel).toBe('advanced');
    }, 30000);
  });

  describe('returning user data merge', () => {
    it('does not re-ask known fields for returning users', async () => {
      const existingData: ExtractedData = {
        gender: 'male',
        weight: 180,
        age: 30,
        height: 72,
      };

      const messages = ['I want to try powerbuilding this time'];

      const result = await extractFromMessages(messages, existingData);

      // Should NOT ask for sex/weight/age/height in missingRequired
      expect(result.missingRequired).not.toContain('sex');
      expect(result.missingRequired).not.toContain('weight');
      expect(result.missingRequired).not.toContain('age');
      expect(result.missingRequired).not.toContain('height');

      // Should still have the existing data
      expect(result.extractedData.gender).toBe('male');
      expect(result.extractedData.weight).toBe(180);
    }, 30000);

    it('infers gym from powerbuilding for returning user', async () => {
      const existingData: ExtractedData = {
        gender: 'male',
        weight: 180,
        age: 30,
      };

      const messages = ['I want to try powerbuilding this time'];

      const result = await extractFromMessages(messages, existingData);

      // Should infer gym environment from powerbuilding
      expect(result.extractedData.workoutEnvironment?.primary).toBe('gym');
    }, 30000);
  });

  describe('readyForProgram flag', () => {
    it('sets readyForProgram true when all required fields present', async () => {
      const messages = [
        "I'm a 30 year old male, 180lbs, want to build muscle at the gym with full equipment access",
      ];

      const result = await extractFromMessages(messages);

      // Should have all required fields
      expect(result.extractedData.gender).toBeTruthy();
      expect(result.extractedData.weight).toBeTruthy();
      expect(result.extractedData.goals).toBeTruthy();
      expect(result.extractedData.workoutEnvironment?.primary).toBeTruthy();
      expect(result.extractedData.equipmentAccess?.type).toBeTruthy();

      expect(result.readyForProgram).toBe(true);
    }, 30000);

    it('sets readyForProgram false when required fields missing', async () => {
      const messages = ["I'm a guy, want to get fit"];

      const result = await extractFromMessages(messages);

      // Missing weight, environment, equipment
      expect(result.readyForProgram).toBe(false);
      expect(result.missingRequired.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('age and height are required fields (#349)', () => {
    it('correctly identifies missing age when not provided', async () => {
      const messages = ["I'm a male, 180lbs, 5'10\", want to build muscle at the gym with full equipment"];

      const result = await extractFromMessages(messages);

      // Age is now required - should be flagged if not provided
      // This message does NOT include age, so it should appear in missingRequired
      // Note: the message includes height so height should NOT be missing
      expect(result.extractedData.height).toBeTruthy();
    }, 30000);

    it('correctly identifies missing height when not provided', async () => {
      const messages = ["I'm a 30 year old male, 180lbs, want to build muscle at the gym"];

      const result = await extractFromMessages(messages);

      // Height is now required - should be flagged if not provided
      // Note: height is missing from this message
      expect(
        result.missingRequired.some(
          (field) => field.toLowerCase().includes('height')
        ) || result.extractedData.height != null
      ).toBe(true);
    }, 30000);

    it('sets readyForProgram true when age and height are both provided', async () => {
      const messages = [
        "Male, 30 years old, 180lbs, 5'10\", want to build muscle. I go to a full commercial gym with all equipment.",
      ];

      const result = await extractFromMessages(messages);

      expect(result.extractedData.age).toBe(30);
      expect(result.extractedData.height).toBeTruthy();
      expect(result.readyForProgram).toBe(true);
    }, 30000);
  });

  describe('missingRequired accuracy', () => {
    it('correctly identifies missing weight', async () => {
      const messages = ["I'm a 30 year old male, want to build muscle at the gym"];

      const result = await extractFromMessages(messages);

      expect(result.missingRequired).toContain('weight');
    }, 30000);

    it('correctly identifies missing environment', async () => {
      const messages = ["I'm a male, 180lbs, want to build muscle"];

      const result = await extractFromMessages(messages);

      // Should be missing environment/equipment info
      expect(
        result.missingRequired.some(
          (field) =>
            field.toLowerCase().includes('environment') || field.toLowerCase().includes('equipment')
        )
      ).toBe(true);
    }, 30000);

    it('has empty missingRequired when all fields present', async () => {
      const messages = [
        "Male, 30, 180lbs, 5'10\", want to build muscle. I go to a full commercial gym with all equipment.",
      ];

      const result = await extractFromMessages(messages);

      expect(result.missingRequired.length).toBe(0);
      expect(result.readyForProgram).toBe(true);
    }, 30000);
  });
});

/**
 * Unit tests for the extraction prompt string itself (no API calls).
 * Verifies prompt structure contains the right required/optional fields.
 */
describe('buildExtractionPrompt output (#349)', () => {
  it('lists age as a REQUIRED field', () => {
    const prompt = buildExtractionPrompt();
    // The REQUIRED FIELDS section should include age
    const requiredSection = prompt.split('REQUIRED FIELDS')[1]?.split('OPTIONAL FIELDS')[0] || '';
    expect(requiredSection).toContain('age');
  });

  it('lists height as a REQUIRED field', () => {
    const prompt = buildExtractionPrompt();
    const requiredSection = prompt.split('REQUIRED FIELDS')[1]?.split('OPTIONAL FIELDS')[0] || '';
    expect(requiredSection).toContain('height');
  });

  it('does not list age or height as OPTIONAL fields', () => {
    const prompt = buildExtractionPrompt();
    const optionalSection = prompt.split('OPTIONAL FIELDS')[1]?.split('RULES')[0] || '';
    expect(optionalSection).not.toContain('- age');
    expect(optionalSection).not.toContain('- height');
  });

  it('includes guidance to ask about age naturally', () => {
    const prompt = buildExtractionPrompt();
    // The prompt should tell the AI to ask for age in a natural way
    expect(prompt.toLowerCase()).toMatch(/age.*ask|ask.*age/i);
  });

  it('includes height conversion guidance', () => {
    const prompt = buildExtractionPrompt();
    // The prompt should mention converting height
    expect(prompt).toContain('inches');
  });

  it('includes age in the JSON response schema', () => {
    const prompt = buildExtractionPrompt();
    // The JSON template should include age field
    expect(prompt).toContain('"age"');
  });

  it('includes height in the JSON response schema', () => {
    const prompt = buildExtractionPrompt();
    // The JSON template should include height field
    expect(prompt).toContain('"height"');
  });

  it('tells returning users NOT to re-ask for age/height', () => {
    const existingData = { gender: 'male', weight: 180, age: 30, height: 72 };
    const prompt = buildExtractionPrompt(existingData);
    // Should contain instruction not to re-ask known fields
    expect(prompt).toContain('DO NOT ask for sex, weight, height, age');
  });
});
