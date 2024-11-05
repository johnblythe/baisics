import { anthropic } from '@/lib/anthropic'

export async function sendMessage(messages: { role: string; content: string }[]) {
  try {
    const response = await anthropic.messages.create({
      messages: messages,
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
    })

    return { success: true, data: response }
  } catch (error) {
    console.error('Error in sendMessage:', error)
    return { success: false, error: 'Failed to send message' }
  }
}