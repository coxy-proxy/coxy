'use client';

import { useState } from 'react';
import { ApiKey } from '_/types/api-key';
import ApiKeyTable from './ApiKeyTable';
import CreateApiKeyForm from './CreateApiKeyForm';
import { createApiKey, deleteApiKey } from '_/services/api-keys';

export default function ApiKeyManager({ initialApiKeys }: { initialApiKeys: ApiKey[] }) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateKey = async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newKey = await createApiKey(name);
      setApiKeys((prevKeys) => [...prevKeys, newKey]);
    } catch (err) {
      setError('Failed to create API key. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    // Optimistic UI update
    const originalKeys = apiKeys;
    setApiKeys((prevKeys) => prevKeys.filter((key) => key.id !== id));

    try {
      await deleteApiKey(id);
    } catch (err) {
      setError('Failed to delete API key. Please try again.');
      console.error(err);
      // Rollback on error
      setApiKeys(originalKeys);
    }
  };

  return (
    <div className="space-y-8">
      <CreateApiKeyForm onCreate={handleCreateKey} isLoading={isLoading} />
      {error && <p className="text-red-500">{error}</p>}
      <ApiKeyTable apiKeys={apiKeys} onDelete={handleDeleteKey} />
    </div>
  );
}
