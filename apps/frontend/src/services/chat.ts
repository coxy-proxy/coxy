import type { ChatMessage } from '_/types/chat';

export async function sendMessage(message: string): Promise<ChatMessage> {
  // This is a placeholder. In Phase 5, we will implement the actual API call.
  console.log('Sending message to API:', message);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate an assistant response
  const response = {
    id: Date.now().toString(),
    role: 'assistant' as const,
    text: `This is a simulated response to: "${message}"`,
  };

  return response;
}
