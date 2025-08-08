import type { Message } from '_/types/chat';

interface SendMessageRequest {
  message: string;
  sessionId: string;
  history: Message[];
  model?: string;
  copilotKey?: string; // optional override
  onDelta?: (delta: string) => void; // streaming callback
}

interface SendMessageResponse {
  id: string;
  content: string;
  sessionId: string;
  timestamp: string;
}

export async function sendMessage({ message, sessionId, history, model, copilotKey, onDelta }: SendMessageRequest): Promise<SendMessageResponse> {
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
    stream: true,
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

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to send message: ${res.status} ${res.statusText} ${text}`);
  }

  // Read as stream and accumulate content; caller will manage progressive updates via callbacks elsewhere
  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let done = false;
  let content = '';

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      // Support SSE style "data: {json}" or raw text
      const lines = chunk.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.replace(/^data:\s*/, '');
          if (dataStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed?.choices?.[0]?.delta?.content ?? parsed?.message?.content ?? '';
            if (delta) {
              content += delta;
              onDelta?.(delta);
            }
          } catch {
            // Not JSON; append raw
            content += dataStr;
          }
        } else {
          content += trimmed;
        }
      }
    }
  }

  return {
    id: Date.now().toString(),
    content,
    sessionId,
    timestamp: new Date().toISOString(),
  };
}
