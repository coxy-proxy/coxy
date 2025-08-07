'use client';

import { ApiKeyService } from '_/services/api-keys';
import { ApiKey, CreateApiKeyRequest } from '_/types/api-key';
import { useCallback, useEffect, useState } from 'react';

export function useApiKeys(initialKeys: ApiKey[] = []) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialKeys);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const keys = await ApiKeyService.getApiKeys();
      setApiKeys(keys);
      setError(null);
    } catch (err) {
      setError('Failed to load API keys');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialKeys.length === 0) {
      fetchApiKeys();
    } else {
      setLoading(false);
    }
  }, [fetchApiKeys, initialKeys]);

  const createApiKey = useCallback(async (request: CreateApiKeyRequest) => {
    const newKey = await ApiKeyService.createApiKey(request);
    setApiKeys((prev) => [...prev, newKey]);
    return newKey;
  }, []);

  const updateApiKey = useCallback(async (id: string, name: string) => {
    const updatedKey = await ApiKeyService.updateApiKey(id, name);
    setApiKeys((prev) => prev.map((key) => (key.id === id ? { ...key, ...updatedKey } : key)));
    return updatedKey;
  }, []);

  const deleteApiKey = useCallback(async (id: string) => {
    await ApiKeyService.deleteApiKey(id);
    setApiKeys((prev) => prev.filter((key) => key.id !== id));
  }, []);

  const setDefaultKey = useCallback(async (id: string) => {
    await ApiKeyService.setDefaultApiKey(id);
    setApiKeys((prev) =>
      prev.map((key) => ({
        ...key,
        isDefault: key.id === id,
      })),
    );
  }, []);

  return {
    apiKeys,
    loading,
    error,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    setDefaultKey,
    refetch: fetchApiKeys,
  };
}
