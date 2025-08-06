import { apiClient } from '_/lib/api';

export async function sendMessage(message: string) {
  // This is a placeholder. In Phase 5, we will implement the actual API call.
  console.log('Sending message to API:', message);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate an assistant response
  const response = {
    id: Date.now().toString(),
    role: 'assistant',
    text: `This is a simulated response to: "${message}"`,
  };
  
  return response;
}
