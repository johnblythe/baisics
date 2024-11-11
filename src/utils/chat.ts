import { anthropic } from '@/lib/anthropic'

export async function sendMessage(messages: { role: string; content: string }[]) {
  const systemPrompt = "You are a world-class fitness coach. You are helping a client with their fitness journey by providing feedback on their progress pictures and programming for their training and macros."
  try {
    const response = await anthropic.messages.create({
      messages: messages,
      system: systemPrompt,
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
    });

    return { success: true, data: response }
  } catch (error) {
    console.error('Error in sendMessage:', error)
    return { success: false, error: 'Failed to send message' }
  }
}