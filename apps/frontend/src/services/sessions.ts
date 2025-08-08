import { v4 as uuidv4 } from 'uuid';

export function createChatSession(): { sessionId: string } {
  const sessionId = uuidv4();
  return { sessionId };
}
