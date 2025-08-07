import ApiKeyManager from '_/components/api-keys/ApiKeyManager';
import { ApiKeyService } from '_/services/api-keys';

export default async function ApiKeysPage() {
  // Fetching data on the server component
  const apiKeys = await ApiKeyService.getApiKeys();

  return <ApiKeyManager initialApiKeys={apiKeys} />;
}
