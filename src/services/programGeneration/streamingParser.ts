/**
 * Streaming Parser for Incremental Phase Generation
 *
 * Handles buffer management and delimiter detection for streaming
 * program generation. Parses phases as they complete rather than
 * waiting for the full response.
 *
 * Delimiters:
 * - @@PHASE_END@@ - Marks end of a complete phase JSON object
 * - @@PROGRAM_META@@ - Marks start of program metadata (name, description, totalWeeks)
 */

import { validatePhase, ValidatedPhase } from './schema';

export const PHASE_DELIMITER = '@@PHASE_END@@';
export const META_DELIMITER = '@@PROGRAM_META@@';

export interface ProgramMeta {
  name: string;
  description: string;
  totalWeeks: number;
}

export interface ParseResult {
  type: 'phase' | 'meta' | 'none';
  phase?: ValidatedPhase;
  meta?: ProgramMeta;
  error?: string;
}

/**
 * StreamingPhaseParser accumulates streaming text and emits
 * complete phases as they're detected via delimiters.
 */
export class StreamingPhaseParser {
  private buffer: string = '';
  private completedPhases: ValidatedPhase[] = [];
  private programMeta: ProgramMeta | null = null;
  private metaMode: boolean = false;

  /**
   * Add new text chunk to buffer and check for complete phases
   * @returns Array of parse results (phases or meta found)
   */
  addChunk(chunk: string): ParseResult[] {
    this.buffer += chunk;
    const results: ParseResult[] = [];

    // Check for meta delimiter - switches parsing mode
    if (this.buffer.includes(META_DELIMITER)) {
      const parts = this.buffer.split(META_DELIMITER);

      // Process any remaining phase content before meta
      if (parts[0].trim()) {
        const phaseResults = this.extractPhases(parts[0]);
        results.push(...phaseResults);
      }

      // Switch to meta mode and keep remainder
      this.metaMode = true;
      this.buffer = parts.slice(1).join(META_DELIMITER);
    }

    if (this.metaMode) {
      // Try to parse meta from buffer
      const metaResult = this.tryParseMeta();
      if (metaResult) {
        results.push(metaResult);
      }
    } else {
      // Extract complete phases from buffer
      const phaseResults = this.extractPhases(this.buffer);
      results.push(...phaseResults);
    }

    return results;
  }

  /**
   * Extract complete phases from text using PHASE_DELIMITER
   */
  private extractPhases(text: string): ParseResult[] {
    const results: ParseResult[] = [];

    if (!text.includes(PHASE_DELIMITER)) {
      return results;
    }

    const parts = text.split(PHASE_DELIMITER);

    // Process all complete phases (all parts except the last which may be incomplete)
    for (let i = 0; i < parts.length - 1; i++) {
      const phaseJson = parts[i].trim();
      if (!phaseJson) continue;

      const result = this.parsePhase(phaseJson);
      results.push(result);
    }

    // Keep the last part (potentially incomplete) in buffer
    this.buffer = parts[parts.length - 1];

    return results;
  }

  /**
   * Parse and validate a single phase JSON string
   */
  private parsePhase(jsonStr: string): ParseResult {
    try {
      // Clean up JSON string
      let cleaned = jsonStr.trim();

      // Remove any markdown code block markers
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();

      const data = JSON.parse(cleaned);

      // Normalize measure types before validation
      this.normalizeMeasureTypes(data);

      const validation = validatePhase(data);

      if (validation.success && validation.data) {
        this.completedPhases.push(validation.data);
        return { type: 'phase', phase: validation.data };
      } else {
        const errorMsg = validation.errors?.issues.map(i => i.message).join(', ') || 'Unknown validation error';
        return { type: 'none', error: `Phase validation failed: ${errorMsg}` };
      }
    } catch (e) {
      return { type: 'none', error: `Failed to parse phase JSON: ${e instanceof Error ? e.message : 'Unknown error'}` };
    }
  }

  /**
   * Normalize measure types to valid enum values
   */
  private normalizeMeasureTypes(phase: any): void {
    const validMeasureTypes = ['reps', 'time', 'distance'];

    for (const workout of phase.workouts || []) {
      for (const exercise of workout.exercises || []) {
        if (exercise.measure && !validMeasureTypes.includes(exercise.measure.type)) {
          exercise.measure.type = 'reps';
        }
      }
    }
  }

  /**
   * Try to parse program metadata from buffer
   */
  private tryParseMeta(): ParseResult | null {
    const trimmed = this.buffer.trim();
    if (!trimmed) return null;

    try {
      // Clean up JSON string
      let cleaned = trimmed;
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();

      // Try to parse - might fail if incomplete
      const data = JSON.parse(cleaned);

      if (data.name && data.description && typeof data.totalWeeks === 'number') {
        this.programMeta = {
          name: data.name,
          description: data.description,
          totalWeeks: data.totalWeeks,
        };
        this.buffer = '';
        return { type: 'meta', meta: this.programMeta };
      }
    } catch {
      // JSON not complete yet, keep buffering
    }

    return null;
  }

  /**
   * Get all completed phases so far
   */
  getCompletedPhases(): ValidatedPhase[] {
    return [...this.completedPhases];
  }

  /**
   * Get program metadata if received
   */
  getProgramMeta(): ProgramMeta | null {
    return this.programMeta;
  }

  /**
   * Get current buffer contents (for debugging)
   */
  getBuffer(): string {
    return this.buffer;
  }

  /**
   * Check if we're in meta parsing mode
   */
  isInMetaMode(): boolean {
    return this.metaMode;
  }

  /**
   * Reset parser state
   */
  reset(): void {
    this.buffer = '';
    this.completedPhases = [];
    this.programMeta = null;
    this.metaMode = false;
  }
}
