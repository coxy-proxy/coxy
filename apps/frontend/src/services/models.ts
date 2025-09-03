export interface Model {
  id: string;
  // Additional fields are ignored but can be added as needed
}

export async function listModels(copilotKey?: string): Promise<Model[]> {
  const headers: Record<string, string> = {};
  if (copilotKey) {
    headers['Authorization'] = /^(token|Bearer)\s/.test(copilotKey) ? copilotKey : `token ${copilotKey}`;
  }

  const res = await fetch(`/api/models`, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch models: ${res.status} ${res.statusText} ${text}`);
  }

  // Try to support either { data: Model[] } or Model[] directly
  const payload = await res.json();
  const models: Model[] = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

  return models.map((m) => ({ id: String((m as any).id) }));
}
