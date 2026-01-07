/**
 * Lean Program Generation
 *
 * Main entry point for the lean generation flow:
 * 1. Filter exercises for user's equipment/environment
 * 2. Build lean prompt with exercise list
 * 3. Call AI for slim program (500-1500 tokens)
 * 4. Enrich slim program to full program (DB lookups + templates)
 *
 * Target: <30s generation time, fits Vercel 60s limit
 */

import Anthropic from '@anthropic-ai/sdk';
import type { UserProfile, GenerationContext, GeneratedProgram, GeneratedPhase } from './types';
import type { SlimProgram, SlimPhase } from './leanTypes';
import { validateSlimProgram, validateSlimPhase } from './leanTypes';
import { filterExercisesForUser } from './exerciseFilter';
import { LEAN_SYSTEM_PROMPT, buildLeanPrompt, buildLeanPhasePrompt } from './leanPrompts';
import { enrichProgram, enrichSinglePhase } from './enrichment';

// Lazy-initialized Anthropic client
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

// Model selection
const MODELS = {
  fast: 'claude-sonnet-4-20250514',      // Sonnet for speed
  quality: 'claude-opus-4-5-20251101',   // Opus for complex cases
} as const;

interface LeanGenerationOptions {
  model?: 'fast' | 'quality' | 'auto';
  maxTokens?: number;
  saveToDb?: boolean;
}

interface LeanGenerationResult {
  success: boolean;
  program?: GeneratedProgram;
  error?: string;
  metadata: {
    generationTimeMs: number;
    aiTimeMs: number;
    enrichmentTimeMs: number;
    inputTokens: number;
    outputTokens: number;
    model: string;
    exerciseCount: number;
  };
}

/**
 * Select model based on user profile complexity
 */
function selectModel(profile: UserProfile, option: 'fast' | 'quality' | 'auto'): string {
  if (option === 'fast') return MODELS.fast;
  if (option === 'quality') return MODELS.quality;

  // Auto-select based on complexity
  const needsQuality =
    (profile.injuries && profile.injuries.length > 0) ||
    profile.experienceLevel === 'advanced' ||
    profile.additionalInfo?.toLowerCase().includes('competition') ||
    profile.additionalInfo?.toLowerCase().includes('meet') ||
    profile.additionalInfo?.toLowerCase().includes('postpartum') ||
    profile.additionalInfo?.toLowerCase().includes('rehab');

  return needsQuality ? MODELS.quality : MODELS.fast;
}

/**
 * Parse AI response to SlimProgram
 */
function parseSlimProgram(text: string): SlimProgram {
  // Clean up the response
  let cleaned = text.trim();

  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();

  // Parse JSON
  const parsed = JSON.parse(cleaned);

  // Validate structure
  if (!validateSlimProgram(parsed)) {
    throw new Error('Invalid slim program structure');
  }

  return parsed;
}

/**
 * Main lean generation function
 */
export async function generateProgramLean(
  profile: UserProfile,
  context?: GenerationContext,
  options: LeanGenerationOptions = {}
): Promise<LeanGenerationResult> {
  const startTime = Date.now();
  const model = selectModel(profile, options.model || 'auto');
  const maxTokens = options.maxTokens || 4096;

  try {
    // Step 1: Filter exercises for this user
    const exerciseList = await filterExercisesForUser(profile, {
      maxExercises: 80,
    });

    if (exerciseList.exercises.length < 10) {
      return {
        success: false,
        error: 'Not enough exercises available for the specified equipment and environment',
        metadata: {
          generationTimeMs: Date.now() - startTime,
          aiTimeMs: 0,
          enrichmentTimeMs: 0,
          inputTokens: 0,
          outputTokens: 0,
          model,
          exerciseCount: exerciseList.exercises.length,
        },
      };
    }

    // Step 2: Build lean prompt
    const prompt = buildLeanPrompt(profile, exerciseList, context);

    // Step 3: Call AI
    const aiStartTime = Date.now();
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: LEAN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const aiTimeMs = Date.now() - aiStartTime;

    // Extract text response
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Step 4: Parse slim program
    const slimProgram = parseSlimProgram(textContent.text);

    // Step 5: Enrich to full program
    const enrichmentStartTime = Date.now();
    const fullProgram = await enrichProgram(slimProgram, profile);
    const enrichmentTimeMs = Date.now() - enrichmentStartTime;

    return {
      success: true,
      program: fullProgram,
      metadata: {
        generationTimeMs: Date.now() - startTime,
        aiTimeMs,
        enrichmentTimeMs,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model,
        exerciseCount: exerciseList.exercises.length,
      },
    };
  } catch (error) {
    console.error('Lean generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        generationTimeMs: Date.now() - startTime,
        aiTimeMs: 0,
        enrichmentTimeMs: 0,
        inputTokens: 0,
        outputTokens: 0,
        model,
        exerciseCount: 0,
      },
    };
  }
}

/**
 * Parse AI response to SlimPhase (single phase)
 */
function parseSlimPhase(text: string): SlimPhase {
  let cleaned = text.trim();

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();
  const parsed = JSON.parse(cleaned);

  if (!validateSlimPhase(parsed)) {
    throw new Error('Invalid slim phase structure');
  }

  return parsed;
}

interface LeanPhaseResult {
  success: boolean;
  phase?: GeneratedPhase;
  error?: string;
  metadata: {
    generationTimeMs: number;
    aiTimeMs: number;
    enrichmentTimeMs: number;
    inputTokens: number;
    outputTokens: number;
    model: string;
    exerciseCount: number;
  };
}

/**
 * Generate a single phase using lean generation
 * Used by the /api/programs/generate/phase endpoint
 */
export async function generatePhaseLean(
  profile: UserProfile,
  phaseNumber: number,
  totalPhases: number,
  previousPhasesFocus?: string[],
  options: LeanGenerationOptions = {}
): Promise<LeanPhaseResult> {
  const startTime = Date.now();
  const model = selectModel(profile, options.model || 'auto');
  const maxTokens = options.maxTokens || 2048; // Single phase needs fewer tokens

  try {
    // Step 1: Filter exercises for this user
    const exerciseList = await filterExercisesForUser(profile, {
      maxExercises: 80,
    });

    // Debug: Log filtered exercises
    console.log(`[Lean Phase ${phaseNumber}] Equipment type: ${profile.equipment.type}`);
    console.log(`[Lean Phase ${phaseNumber}] Available equipment: ${JSON.stringify(profile.equipment.available)}`);
    console.log(`[Lean Phase ${phaseNumber}] Filtered ${exerciseList.exercises.length} exercises`);
    console.log(`[Lean Phase ${phaseNumber}] Sample exercises: ${exerciseList.exercises.slice(0, 5).map(e => e.slug).join(', ')}`);

    if (exerciseList.exercises.length < 10) {
      return {
        success: false,
        error: 'Not enough exercises available for the specified equipment and environment',
        metadata: {
          generationTimeMs: Date.now() - startTime,
          aiTimeMs: 0,
          enrichmentTimeMs: 0,
          inputTokens: 0,
          outputTokens: 0,
          model,
          exerciseCount: exerciseList.exercises.length,
        },
      };
    }

    // Step 2: Build lean phase prompt
    const prompt = buildLeanPhasePrompt(profile, exerciseList, phaseNumber, totalPhases, previousPhasesFocus);

    // Step 3: Call AI
    const aiStartTime = Date.now();
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: LEAN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const aiTimeMs = Date.now() - aiStartTime;

    // Extract text response
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Step 4: Parse slim phase
    const slimPhase = parseSlimPhase(textContent.text);

    // Debug: Log AI's exercise choices
    const aiSlugs = slimPhase.workouts.flatMap(w => w.exercises.map(e => e.slug));
    console.log(`[Lean Phase ${phaseNumber}] AI returned ${aiSlugs.length} exercises: ${aiSlugs.slice(0, 10).join(', ')}`);

    // Step 5: Enrich to full phase
    const enrichmentStartTime = Date.now();
    const fullPhase = await enrichSinglePhase(slimPhase, phaseNumber, profile);
    const enrichmentTimeMs = Date.now() - enrichmentStartTime;

    return {
      success: true,
      phase: fullPhase,
      metadata: {
        generationTimeMs: Date.now() - startTime,
        aiTimeMs,
        enrichmentTimeMs,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model,
        exerciseCount: exerciseList.exercises.length,
      },
    };
  } catch (error) {
    console.error('Lean phase generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        generationTimeMs: Date.now() - startTime,
        aiTimeMs: 0,
        enrichmentTimeMs: 0,
        inputTokens: 0,
        outputTokens: 0,
        model,
        exerciseCount: 0,
      },
    };
  }
}

