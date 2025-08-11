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

  const controlId = 'model-select';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Label htmlFor={controlId} className="text-sm text-gray-600">
        Model
      </Label>
      {loading ? (
        <span className="text-sm text-gray-500">Loading...</span>
      ) : error ? (
        <span className="text-sm text-red-600">{error}</span>
      ) : (
        <Select value={selectedModel ?? ''} onValueChange={(v) => setSelectedModel(v)}>
          <SelectTrigger id={controlId} className="w-56 h-8">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
