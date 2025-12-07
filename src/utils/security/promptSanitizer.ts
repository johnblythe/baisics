/**
 * Prompt Injection Protection
 *
 * Sanitizes user input before including in AI prompts to prevent:
 * - Instruction injection ("ignore previous instructions...")
 * - Role hijacking ("you are now a...")
 * - Output manipulation ("respond with..." / "output...")
 * - System prompt extraction attempts
 *
 * @see https://owasp.org/www-project-top-10-for-large-language-model-applications/
 */

// Patterns that indicate prompt injection attempts
const INJECTION_PATTERNS = [
  // Instruction override attempts
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i,
  /ignore\s+(your\s+)?(previous\s+)?instructions/i,
  /disregard\s+(all\s+)?(previous|prior|above|earlier)/i,
  /forget\s+(everything|all|what)/i,
  /new\s+instructions?:/i,
  /override\s+(instructions?|rules?|system)/i,

  // Role hijacking
  /you\s+are\s+(now|actually|really)\s+(a|an)/i,
  /act\s+as\s+(a|an|if)/i,
  /pretend\s+(to\s+be|you('re| are))/i,
  /role\s*:\s*(system|assistant|user)/i,
  /\[system\]/i,
  /\[assistant\]/i,

  // Output manipulation (more specific to avoid false positives)
  /respond\s+(only\s+)?with\s+(json|xml|code|the\s+following|exactly|the\s+word|only)/i,
  /output\s+(only\s+)?the\s+following/i,
  /say\s+(exactly|only)\s+(this|what|the)/i,
  /print\s+(your|the)\s+(system|prompt|instructions)/i,

  // System prompt extraction
  /what('s| is| are)\s+(your|the)\s+(system\s+)?prompt/i,
  /show\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions)/i,
  /reveal\s+(your|the)\s+(system|instructions|prompt)/i,
  /repeat\s+(your|the)\s+(system|instructions|prompt)/i,

  // Delimiter injection
  /```\s*(system|assistant|user)/i,
  /<\|?(system|im_start|im_end)\|?>/i,
  /\[\[.*\]\]/i, // Double bracket injection

  // JSON/code injection in text fields
  /"role"\s*:\s*"(system|assistant)"/i,
  /"content"\s*:\s*"/i,
];

// Words/phrases to flag but not necessarily block
const SUSPICIOUS_PHRASES = [
  'ignore',
  'disregard',
  'forget',
  'override',
  'bypass',
  'jailbreak',
  'dan mode',
  'developer mode',
  'sudo',
  'admin',
  'root access',
];

export interface SanitizeResult {
  sanitized: string;
  wasModified: boolean;
  flaggedPatterns: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Sanitize a single string input
 */
export function sanitizeInput(input: string, fieldName?: string): SanitizeResult {
  if (!input || typeof input !== 'string') {
    return {
      sanitized: input || '',
      wasModified: false,
      flaggedPatterns: [],
      riskLevel: 'low',
    };
  }

  const flaggedPatterns: string[] = [];
  let sanitized = input;
  let wasModified = false;

  // Check for injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      const match = sanitized.match(pattern);
      if (match) {
        flaggedPatterns.push(match[0]);
        // Replace with sanitized version - wrap in quotes to neutralize
        sanitized = sanitized.replace(pattern, '[FILTERED]');
        wasModified = true;
      }
    }
  }

  // Escape potential delimiter characters that could break prompt structure
  const originalLength = sanitized.length;

  // Neutralize markdown code blocks that might contain role markers
  sanitized = sanitized.replace(/```(system|assistant|user|json)/gi, '``` $1');

  // Escape XML-like tags that might be interpreted as control sequences
  sanitized = sanitized.replace(/<(system|assistant|user|prompt|instruction)/gi, '&lt;$1');

  // Neutralize potential JSON injection in free text
  sanitized = sanitized.replace(/"(role|content|system|assistant)"\s*:/gi, '"$1" :');

  if (sanitized.length !== originalLength || sanitized !== input.replace(/```(system|assistant|user|json)/gi, '``` $1')) {
    wasModified = true;
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (flaggedPatterns.length > 0) {
    riskLevel = 'high';
  } else {
    // Check for suspicious but not definitively malicious phrases
    const lowerInput = input.toLowerCase();
    const suspiciousCount = SUSPICIOUS_PHRASES.filter((phrase) =>
      lowerInput.includes(phrase)
    ).length;
    if (suspiciousCount >= 2) {
      riskLevel = 'medium';
    }
  }

  return {
    sanitized,
    wasModified,
    flaggedPatterns,
    riskLevel,
  };
}

/**
 * Sanitize an array of strings
 */
export function sanitizeArray(inputs: string[], fieldName?: string): {
  sanitized: string[];
  flaggedItems: number[];
  highestRisk: 'low' | 'medium' | 'high';
} {
  const sanitized: string[] = [];
  const flaggedItems: number[] = [];
  let highestRisk: 'low' | 'medium' | 'high' = 'low';

  for (let i = 0; i < inputs.length; i++) {
    const result = sanitizeInput(inputs[i], fieldName);
    sanitized.push(result.sanitized);

    if (result.wasModified || result.riskLevel !== 'low') {
      flaggedItems.push(i);
    }

    if (result.riskLevel === 'high') {
      highestRisk = 'high';
    } else if (result.riskLevel === 'medium' && highestRisk !== 'high') {
      highestRisk = 'medium';
    }
  }

  return { sanitized, flaggedItems, highestRisk };
}

/**
 * Sanitize a UserProfile object for prompt inclusion
 */
export function sanitizeUserProfile(profile: {
  trainingGoal?: string;
  injuries?: string[];
  preferences?: string[];
  additionalInfo?: string;
  environment?: {
    limitations?: string[];
  };
  equipment?: {
    available?: string[];
  };
}): {
  sanitizedProfile: typeof profile;
  wasModified: boolean;
  riskReport: {
    field: string;
    riskLevel: 'low' | 'medium' | 'high';
    flaggedPatterns: string[];
  }[];
} {
  const riskReport: {
    field: string;
    riskLevel: 'low' | 'medium' | 'high';
    flaggedPatterns: string[];
  }[] = [];

  let wasModified = false;
  const sanitizedProfile = { ...profile };

  // Sanitize trainingGoal
  if (profile.trainingGoal) {
    const result = sanitizeInput(profile.trainingGoal, 'trainingGoal');
    sanitizedProfile.trainingGoal = result.sanitized;
    if (result.wasModified) wasModified = true;
    if (result.riskLevel !== 'low' || result.flaggedPatterns.length > 0) {
      riskReport.push({
        field: 'trainingGoal',
        riskLevel: result.riskLevel,
        flaggedPatterns: result.flaggedPatterns,
      });
    }
  }

  // Sanitize additionalInfo (highest risk field)
  if (profile.additionalInfo) {
    const result = sanitizeInput(profile.additionalInfo, 'additionalInfo');
    sanitizedProfile.additionalInfo = result.sanitized;
    if (result.wasModified) wasModified = true;
    if (result.riskLevel !== 'low' || result.flaggedPatterns.length > 0) {
      riskReport.push({
        field: 'additionalInfo',
        riskLevel: result.riskLevel,
        flaggedPatterns: result.flaggedPatterns,
      });
    }
  }

  // Sanitize arrays
  if (profile.injuries?.length) {
    const result = sanitizeArray(profile.injuries, 'injuries');
    sanitizedProfile.injuries = result.sanitized;
    if (result.flaggedItems.length > 0) {
      wasModified = true;
      riskReport.push({
        field: 'injuries',
        riskLevel: result.highestRisk,
        flaggedPatterns: [],
      });
    }
  }

  if (profile.preferences?.length) {
    const result = sanitizeArray(profile.preferences, 'preferences');
    sanitizedProfile.preferences = result.sanitized;
    if (result.flaggedItems.length > 0) {
      wasModified = true;
      riskReport.push({
        field: 'preferences',
        riskLevel: result.highestRisk,
        flaggedPatterns: [],
      });
    }
  }

  if (profile.environment?.limitations?.length) {
    const result = sanitizeArray(profile.environment.limitations, 'environment.limitations');
    sanitizedProfile.environment = {
      ...profile.environment,
      limitations: result.sanitized,
    };
    if (result.flaggedItems.length > 0) {
      wasModified = true;
      riskReport.push({
        field: 'environment.limitations',
        riskLevel: result.highestRisk,
        flaggedPatterns: [],
      });
    }
  }

  if (profile.equipment?.available?.length) {
    const result = sanitizeArray(profile.equipment.available, 'equipment.available');
    sanitizedProfile.equipment = {
      ...profile.equipment,
      available: result.sanitized,
    };
    if (result.flaggedItems.length > 0) {
      wasModified = true;
      riskReport.push({
        field: 'equipment.available',
        riskLevel: result.highestRisk,
        flaggedPatterns: [],
      });
    }
  }

  return { sanitizedProfile, wasModified, riskReport };
}

/**
 * Sanitize chat messages before sending to AI
 */
export function sanitizeChatMessage(message: string): SanitizeResult {
  return sanitizeInput(message, 'chatMessage');
}

/**
 * Log suspicious activity for monitoring
 */
export function logSuspiciousInput(
  userId: string,
  field: string,
  riskLevel: 'medium' | 'high',
  flaggedPatterns: string[]
): void {
  // In production, this would send to a logging service
  console.warn(`[SECURITY] Suspicious input detected`, {
    userId,
    field,
    riskLevel,
    flaggedPatterns,
    timestamp: new Date().toISOString(),
  });
}
