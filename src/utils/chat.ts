import { anthropic } from '@/lib/anthropic'

export async function sendMessage(messages: { role: string; content: string }[]) {
  try {
    const response = await anthropic.messages.create({
      messages: messages,
      system: "You are a world-class fitness coach. You are helping a client with their fitness journey by providing feedback on their progress pictures and programming for their training and macros.",
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
    })
    console.log("🚀 ~ sendMessage ~ response:", response)

    return { success: true, data: response }
  } catch (error) {
    console.error('Error in sendMessage:', error)
    return { success: false, error: 'Failed to send message' }
  }
}