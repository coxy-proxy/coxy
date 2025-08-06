import { apiClient } from '_/lib/api';
import { ApiKey } from '_/types/api-key';

export async function getApiKeys(): Promise<ApiKey[]> {
  // This is a placeholder. In Phase 5, we will implement the actual API call.
  console.log('Fetching API keys from mock service');
  
  // Mock data for now
  return [
    { id: '1', name: 'My First Key', key: '...1234', created: new Date(), status: 'active' },
    { id: '2', name: 'Test Key', key: '...5678', created: new Date(), lastUsed: new Date(), status: 'active' },
    { id: '3', name: 'Old Key', key: '...abcd', created: new Date(), status: 'disabled' },
  ];
}

export async function createApiKey(name: string): Promise<ApiKey> {
  // This is a placeholder. In Phase 5, we will implement the actual API call.
  console.log(`Creating key with name: ${name}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    id: Math.random().toString(),
    name,
    key: `...${Math.random().toString().slice(2, 6)}`,
    created: new Date(),
    status: 'active',
  };
}

export async function deleteApiKey(id: string): Promise<void> {
  // This is a placeholder. In Phase 5, we will implement the actual API call.
  console.log(`Deleting key with id: ${id}`);
  await new Promise(resolve => setTimeout(resolve, 500));
}
