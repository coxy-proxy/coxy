'use client';

import { useChatStore } from '_/hooks/useChatStore';
import { listModels, type Model } from '_/services/models';
import { useEffect, useState } from 'react';
import { Label } from '@/shared/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/components/select';

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

  const isDisabled = loading || (!!error && models.length === 0);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2">
        <Select value={selectedModel ?? ''} onValueChange={(v) => setSelectedModel(v)} disabled={isDisabled}>
          <SelectTrigger size="sm">
            <SelectValue placeholder={error ? 'Failed to load models' : loading ? 'Loading…' : 'Select a model'} />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-h-5 text-xs">
        {loading ? (
          <span className="text-gray-500">Fetching models…</span>
        ) : error ? (
          <span className="text-red-600">{error}</span>
        ) : null}
      </div>
    </div>
  );
}
