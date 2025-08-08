import type { Message } from '_/types/chat';

interface SendMessageRequest {
  message: string;
  sessionId: string;
  history: Message[];
  model?: string;
  copilotKey?: string; // optional override
}

interface SendMessageResponse {
  id: string;
  content: string;
  sessionId: string;
  timestamp: string;
}

export async function sendMessage({ message, sessionId, history, model, copilotKey }: SendMessageRequest): Promise<SendMessageResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
  }

  const payload = {
    model: model ?? 'gpt-4o-mini',
    messages: [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ],
    stream: false,
  } as const;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (copilotKey) {
    headers['Authorization'] = /^(token|Bearer)\s/.test(copilotKey) ? copilotKey : `token ${copilotKey}`;
  }

  const res = await fetch(`${baseUrl}/api/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to send message: ${res.status} ${res.statusText} ${text}`);
  }

  let content = '';
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    content = data?.choices?.[0]?.message?.content
      ?? data?.message?.content
      ?? JSON.stringify(data);
  } else {
    // Fallback: read as text
    content = await res.text();
  }

  return {
    id: Date.now().toString(),
    content,
    sessionId,
    timestamp: new Date().toISOString(),
  };
}
