import { anthropic } from '@/lib/anthropic'
import { MessageParam } from '@anthropic-ai/sdk/src/resources/messages.js';

export async function sendMessage(messages: { role: string; content: string }[]) {
  const systemPrompt = `
  You are a world-class fitness coach. You are helping a client achieve their fitness and wellness goals by providing feedback on their progress pictures and programming for their training and macros that aligns with their goals, preferences, limitations, age, height, experience, and other relevant information.
  Do not let yourself hallucinate. Do not pander. Do not overexplain. Do not make up information.
  Ask for more context if needed. Otherwise, just respond with the JSON object requested.
  `;

  try {
    const response = await anthropic.messages.create({
      messages: messages as MessageParam[],
      system: systemPrompt,
      model: process.env.SONNET_MODEL!,
      max_tokens: 4096,
    });

    return { success: true, data: response }
  } catch (error) {
    console.error('Error in sendMessage:', error)
    return { success: false, error: 'Failed to send message' }
  }
}