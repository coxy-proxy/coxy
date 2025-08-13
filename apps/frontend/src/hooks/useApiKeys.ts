'use client';

import { useApiKeyService } from '_/hooks/useApiKeyService';
import { useCallback, useEffect, useState } from 'react';
import { ApiKeyResponse, CreateApiKeyDto } from '@/shared/types/api-key';

export function useApiKeys(initialKeys: ApiKeyResponse[] = []) {
  const [apiKeys, setApiKeys] = useState<ApiKeyResponse[]>(initialKeys);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiKeyService = useApiKeyService();

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const keys = await apiKeyService.getApiKeys();
      setApiKeys(keys);
      setError(null);
    } catch (err) {
      setError('Failed to load API keys');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiKeyService]);

  useEffect(() => {
    if (initialKeys.length === 0) {
      fetchApiKeys();
    } else {
      setLoading(false);
    }
  }, [fetchApiKeys, initialKeys]);

  const createApiKey = useCallback(
    async (request: CreateApiKeyDto) => {
      const newKey = await apiKeyService.createApiKey(request);
      setApiKeys((prev) => [newKey, ...prev]);
      return newKey;
    },
    [apiKeyService],
  );

  const updateApiKey = useCallback(
    async (id: string, name: string) => {
      const updatedKey = await apiKeyService.updateApiKey(id, name);
      setApiKeys((prev) => prev.map((key) => (key.id === id ? { ...key, ...updatedKey } : key)));
      return updatedKey;
    },
    [apiKeyService],
  );

  const deleteApiKey = useCallback(
    async (id: string) => {
      await apiKeyService.deleteApiKey(id);
      setApiKeys((prev) => prev.filter((key) => key.id !== id));
    },
    [apiKeyService],
  );

  const setDefaultKey = useCallback(
    async (id: string) => {
      await apiKeyService.setDefaultApiKey(id);
      setApiKeys((prev) =>
        prev.map((key) => ({
          ...key,
          isDefault: key.id === id,
        })),
      );
    },
    [apiKeyService],
  );

  const refreshMeta = useCallback(
    async (id: string) => {
      const updatedKey = await apiKeyService.refreshApiKeyMeta(id);
      setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, ...updatedKey } : k)));
      return updatedKey;
    },
    [apiKeyService],
  );

  return {
    apiKeys,
    loading,
    error,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    setDefaultKey,
    refreshMeta,
    refetch: fetchApiKeys,
  };
}
