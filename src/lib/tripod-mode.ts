// Tripod Mode - GymSnark personality feature
// When enabled, adds snarky commentary mocking gym influencer culture

export const TRIPOD_MODE_KEY = 'baisics_tripod_mode';

// Check if tripod mode is enabled (client-side only)
export function isTripodModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(TRIPOD_MODE_KEY) === 'true';
}

// Snarky volume comments based on volume lifted
const SNARKY_VOLUME_COMMENTS: Array<{ minVolume: number; comments: string[] }> = [
  {
    minVolume: 0,
    comments: [
      'Hopefully as many selfies.',
      'That should be good for at least 3 mirror flexes.',
      'Content creators would call that a warm-up.',
    ],
  },
  {
    minVolume: 5000,
    comments: [
      'Hopefully as many selfies.',
      'Enough for the gram, barely enough for gains.',
      'Ring light recommended for optimal pump visibility.',
    ],
  },
  {
    minVolume: 10000,
    comments: [
      'That should get you at least 50 likes.',
      'Perfect for a transformation reel.',
      'Influencer-approved volume right there.',
    ],
  },
  {
    minVolume: 25000,
    comments: [
      'Impressive. Too bad no one was filming.',
      'The algorithm would love this.',
      'You earned a protein shake. Film yourself drinking it.',
    ],
  },
  {
    minVolume: 50000,
    comments: [
      'Massive. Consider getting a videographer.',
      'Sponsor-worthy numbers. Where\'s your tripod?',
      'This better be going on TikTok.',
    ],
  },
];

// Get a random snarky comment based on volume
export function getSnarkyVolumeComment(volume: number): string {
  // Find the highest tier the volume qualifies for
  const tier = [...SNARKY_VOLUME_COMMENTS]
    .reverse()
    .find((t) => volume >= t.minVolume);

  if (!tier) return '';

  // Pick a random comment from the tier
  const randomIndex = Math.floor(Math.random() * tier.comments.length);
  return tier.comments[randomIndex];
}

// Format volume with optional snarky suffix
export function formatVolumeWithSnark(volume: number): { formatted: string; snark: string | null } {
  const formatted = formatVolumeNumber(volume);

  if (!isTripodModeEnabled()) {
    return { formatted, snark: null };
  }

  return {
    formatted,
    snark: getSnarkyVolumeComment(volume),
  };
}

// Simple volume formatter (mirrors the one in milestones.ts)
function formatVolumeNumber(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M lbs`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K lbs`;
  }
  return `${Math.round(volume)} lbs`;
}
