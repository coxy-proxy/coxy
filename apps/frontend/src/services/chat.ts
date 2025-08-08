import type { Message } from '_/types/chat';

interface SendMessageRequest {
  message: string;
  sessionId: string;
  history: Message[];
}

interface SendMessageResponse {
  id: string;
  content: string;
  sessionId: string;
  timestamp: string;
}

export async function sendMessage({ message, sessionId }: SendMessageRequest): Promise<SendMessageResponse> {
  // Placeholder implementation; will be replaced with real API call
  console.log('Sending message to API:', { message, sessionId });

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulate an assistant response
  const response: SendMessageResponse = {
    id: Date.now().toString(),
    sessionId,
    content: `This is a simulated response to: "${message}"`,
    timestamp: new Date().toISOString(),
  };

  return response;
}
