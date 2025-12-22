import Anthropic from '@anthropic-ai/sdk';

let _anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

// Lazy proxy for backward compatibility
export const anthropic = new Proxy({} as Anthropic, {
  get(_, prop) {
    return getAnthropicClient()[prop as keyof Anthropic];
  },
});