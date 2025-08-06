import { getApiKeys } from '_/services/api-keys';
import ApiKeyManager from '_/components/api-keys/ApiKeyManager';

export default async function ApiKeysPage() {
  const apiKeys = await getApiKeys();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">API Keys</h1>
      <p className="mb-6 text-gray-600">Manage your API keys for accessing the service.</p>
      <ApiKeyManager initialApiKeys={apiKeys} />
    </div>
  );
}