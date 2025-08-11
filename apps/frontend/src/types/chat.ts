export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status: 'pending' | 'sent' | 'error';
  sessionId: string;
}
