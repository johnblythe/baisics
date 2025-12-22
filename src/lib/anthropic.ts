import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

// Backward compatible export - lazy getter
export const anthropic = new Proxy({} as Anthropic, {
  get(_, prop) {
    return getAnthropicClient()[prop as keyof Anthropic];
  },
});