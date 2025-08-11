'use client';

import { useChatStore } from '_/hooks/useChatStore';
import { listModels, type Model } from '_/services/models';
import { useEffect, useState } from 'react';

export function ModelSelector({ className = '' }: { className?: string }) {
  const { selectedModel, setSelectedModel } = useChatStore();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchModels = async () => {
      try {
        setLoading(true);
        const res = await listModels();
        if (!cancelled) {
          setModels(res);
          setError(null);
          if (!selectedModel && res.length > 0) {
            setSelectedModel(res[0].id);
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load models');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchModels();
    return () => {
      cancelled = true;
    };
  }, [setSelectedModel, selectedModel]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm text-gray-600">Model</label>
      {loading ? (
        <span className="text-sm text-gray-500">Loading...</span>
      ) : error ? (
        <span className="text-sm text-red-600">{error}</span>
      ) : (
        <select
          className="text-sm border rounded px-2 py-1"
          value={selectedModel ?? ''}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
