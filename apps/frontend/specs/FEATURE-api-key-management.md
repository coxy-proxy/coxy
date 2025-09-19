# API Key Management Feature - Structured Prompt

## 1. Persona
You are a senior frontend developer with expertise in React, TypeScript, Next.js 15, and modern UI/UX design patterns. You specialize in building intuitive data management interfaces with proper state management, form validation, and accessibility compliance.

## 2. Task Statement
Implement a comprehensive API Key Management system that allows users to view, create, edit, delete, and manage API keys through an intuitive table interface with advanced features like default key selection and GitHub OAuth device flow integration.

## 3. Context
This feature is part of a larger AI chatbot SaaS application built with Next.js 15 and integrated with an external backend API. Users need to manage their API keys to access chatbot services, with the ability to set a default key for seamless usage. The system supports both manual key entry and GitHub OAuth device flow for automated key generation. The interface must be professional, responsive, and provide clear feedback for all operations.

## 4. Constraints

### Technology Stack Requirements:
- **Framework:** Next.js 15 with App Router, TypeScript, Server Components where appropriate
- **Styling:** Tailwind CSS only (no external UI libraries)
- **HTTP Client:** Axios with interceptors for external API communication
- **State Management:** React Context API or custom hooks for local state
- **External API:** All operations via `$BASE_URL/api/api-keys` endpoints
- **Authentication:** Clerk tokens passed via Axios interceptors

### Technical Requirements:
- Fully responsive design (mobile-first approach)
- WCAG 2.1 AA accessibility compliance
- TypeScript strict mode with proper interfaces
- Error boundaries and comprehensive error handling
- Loading states, skeleton screens, and optimistic UI updates
- Form validation with real-time feedback
- Proper API key masking (show only last 4 characters in table)
- Secure handling of sensitive data (never log full keys)
- Environment variable management for API configuration

### Functional Constraints:
- **Table Columns:** name, key (masked), created, default, quota, renew at, actions
- **Default Key Logic:** Only one default key allowed across all keys
- **Create Methods:** Manual entry form OR GitHub OAuth device flow
- **Edit Functionality:** Only key names can be edited (not the key value)
- **Actions:** Edit name, set as default, delete key
- **Device Flow Integration:** Real-time status updates via SSE or polling
- **Quota Display:** Show usage statistics if available
- **Data Persistence:** All operations must sync with external backend API

### UI/UX Requirements:
- Clean, modern table design with proper spacing
- Clear visual indication of default key (badge, highlighting)
- Intuitive action buttons with proper icons
- Modal dialogs for create/edit operations
- Confirmation dialogs for destructive actions
- Toast notifications for operation feedback
- Empty state handling with call-to-action
- Mobile-responsive table with horizontal scroll if needed

## 5. Stepwise Instructions

### Phase 1: Data Models & API Integration
1. Define TypeScript interfaces for API key data structure
2. Create API service layer for external backend communication
3. Set up Axios interceptors for authentication and error handling
4. Implement error handling and retry logic for network operations
5. Create custom hooks for API key CRUD operations

### Phase 2: Core Table Component
6. Build responsive API key table component with proper column structure
7. Implement API key masking functionality (show last 4 characters)
8. Add default key visual indicators (badges, highlighting)
9. Create quota display with usage statistics
10. Implement table sorting and filtering if needed

### Phase 3: CRUD Operations Interface
11. Build API key creation modal with dual methods (manual/device flow)
12. Implement manual key entry form with validation
13. Create GitHub OAuth device flow integration with real-time status
14. Build key name editing functionality with inline or modal editing
15. Implement delete confirmation dialog with proper safeguards

### Phase 4: Default Key Management
16. Create default key selection mechanism (radio buttons or toggle)
17. Implement default key switching with optimistic UI updates
18. Add validation to ensure exactly one default key exists
19. Handle edge cases (deleting current default key)
20. Provide clear feedback when default key changes

### Phase 5: Advanced Features & Polish
21. Add empty state with onboarding guidance
22. Implement loading states and skeleton screens
23. Create comprehensive error handling with user-friendly messages
24. Add keyboard navigation and accessibility features
25. Performance optimization and mobile responsive testing

## 6. Output Specification

### Primary Deliverables:
- **API Key Table Component** with all required columns and responsive design
- **Create API Key Modal** with manual entry and device flow options
- **Edit/Delete Actions** with proper confirmation and feedback
- **Default Key Management** with visual indicators and switching logic
- **API Service Layer** with comprehensive error handling and authentication
- **Custom Hooks** for state management and API operations

### File Structure:
```
src/
├── app/(dashboard)/api-keys/
│   ├── page.tsx                    # Main API keys page (Server Component)
│   └── loading.tsx                 # Loading UI
├── components/api-keys/
│   ├── ApiKeyTable.tsx             # Main table component
│   ├── ApiKeyRow.tsx               # Individual table row
│   ├── CreateApiKeyModal.tsx       # Creation modal with dual methods
│   ├── EditApiKeyModal.tsx         # Name editing modal
│   ├── DeleteConfirmDialog.tsx     # Deletion confirmation
│   ├── DeviceFlowStatus.tsx        # GitHub OAuth flow UI
│   ├── DefaultKeyBadge.tsx         # Default key indicator
│   └── EmptyState.tsx              # Empty state component
├── hooks/
│   ├── useApiKeys.ts               # API key CRUD operations
│   ├── useDeviceFlow.ts            # GitHub OAuth device flow
│   └── useDefaultKey.ts            # Default key management
├── services/
│   └── api-keys.ts                 # External API service layer
└── types/
    └── api-keys.ts                 # TypeScript interfaces
```

### Component Interface Examples:

#### API Key Data Model:
```typescript
interface ApiKey {
  id: string;
  name: string;
  key: string;              // Full key (masked in UI)
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  isDefault: boolean;
  quota?: {
    used: number;
    limit: number;
    renewAt: Date;          // When quota will be renewed
  };
}

interface CreateApiKeyRequest {
  name: string;
  key?: string;             // Optional for manual entry
}
```

#### Table Component Structure:
```tsx
// components/api-keys/ApiKeyTable.tsx
interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  onEdit: (id: string, newName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const ApiKeyTable: React.FC<ApiKeyTableProps> = ({
  apiKeys,
  onEdit,
  onDelete,
  onSetDefault,
  isLoading = false
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Key
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Default
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Quota
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Renew At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {apiKeys.map((apiKey) => (
            <ApiKeyRow
              key={apiKey.id}
              apiKey={apiKey}
              onEdit={onEdit}
              onDelete={onDelete}
              onSetDefault={onSetDefault}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### API Service Integration:
```typescript
// services/api-keys.ts
import { apiClient } from '@/lib/api';

export class ApiKeyService {
  static async getApiKeys(): Promise<ApiKey[]> {
    const response = await apiClient.get('/api-keys');
    return response.data;
  }

  static async createApiKey(request: CreateApiKeyRequest): Promise<ApiKey> {
    const response = await apiClient.post('/api-keys', request);
    return response.data;
  }

  static async updateApiKey(id: string, name: string): Promise<ApiKey> {
    const response = await apiClient.patch(`/api-keys/${id}`, { name });
    return response.data;
  }

  static async deleteApiKey(id: string): Promise<void> {
    await apiClient.delete(`/api-keys/${id}`);
  }

  static async setDefaultApiKey(id: string): Promise<void> {
    await apiClient.post(`/api-keys/default`, { id });
  }

  static async startDeviceFlow(): Promise<EventSource> {
    const response = await apiClient.post('/api-keys/device-flow');
    return new EventSource(`${BASE_URL}/api/api-keys/device-flow/${response.data.sessionId}`);
  }
}
```

### Responsive Design Pattern:
```tsx
// Mobile-responsive table with horizontal scroll
<div className="w-full">
  {/* Mobile view - Card layout */}
  <div className="block md:hidden space-y-4">
    {apiKeys.map((key) => (
      <div key={key.id} className="bg-white p-4 rounded-lg border">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900">{key.name}</h3>
          {key.isDefault && <DefaultKeyBadge />}
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Key: {maskApiKey(key.key)}</div>
          <div>Created: {formatDate(key.createdAt)}</div>
          <div>Usage: {key.quota?.used}/{key.quota?.limit}</div>
          <div>Renews: {formatDate(key.quota?.renewAt)}</div>
        </div>
        <div className="flex justify-end space-x-2 mt-3">
          <ActionButtons key={key} />
        </div>
      </div>
    ))}
  </div>

  {/* Desktop view - Table layout */}
  <div className="hidden md:block">
    <ApiKeyTable {...props} />
  </div>
</div>
```

### Device Flow Integration:
```tsx
// components/api-keys/DeviceFlowStatus.tsx
const DeviceFlowStatus: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'success' | 'error'>('idle');
  const [deviceCode, setDeviceCode] = useState<string>('');
  const [userCode, setUserCode] = useState<string>('');

  const startDeviceFlow = async () => {
    setStatus('authorizing');
    const eventSource = await ApiKeyService.startDeviceFlow();
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'device_code':
          setDeviceCode(data.device_code);
          setUserCode(data.user_code);
          break;
        case 'success':
          setStatus('success');
          onSuccess(data.apiKey);
          break;
        case 'error':
          setStatus('error');
          break;
      }
    };
  };

  return (
    <div className="p-6">
      {status === 'idle' && (
        <button onClick={startDeviceFlow} className="btn-primary">
          Authorize with GitHub
        </button>
      )}
      
      {status === 'authorizing' && (
        <div className="text-center">
          <div className="mb-4">
            <div className="text-2xl font-mono bg-gray-100 p-3 rounded">
              {userCode}
            </div>
          </div>
          <p className="text-gray-600">
            Visit <a href="https://github.com/login/device" className="text-blue-600 underline">
              github.com/login/device
            </a> and enter the code above
          </p>
          <div className="mt-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Waiting for authorization...</p>
          </div>
        </div>
      )}
    </div>
  );
};
```

## 7. Examples

### Key Masking Utility:
```typescript
// utils/api-keys.ts
export function maskApiKey(key: string): string {
  if (key.length <= 4) return key;
  const lastFour = key.slice(-4);
  const masked = '*'.repeat(Math.max(0, key.length - 4));
  return masked + lastFour;
}

// Example: "sk-1234567890abcdef" -> "************cdef"
```

### Default Key Badge Component:
```tsx
// components/api-keys/DefaultKeyBadge.tsx
const DefaultKeyBadge: React.FC = () => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
    Default
  </span>
);
```

### Custom Hook for API Key Management:
```typescript
// hooks/useApiKeys.ts
export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
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
    } finally {
      setLoading(false);
    }
  }, []);

  const createApiKey = useCallback(async (request: CreateApiKeyRequest) => {
    const newKey = await ApiKeyService.createApiKey(request);
    setApiKeys(prev => [...prev, newKey]);
    return newKey;
  }, []);

  const setDefaultKey = useCallback(async (id: string) => {
    await ApiKeyService.setDefaultApiKey(id);
    setApiKeys(prev => prev.map(key => ({
      ...key,
      isDefault: key.id === id
    })));
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  return {
    apiKeys,
    loading,
    error,
    createApiKey,
    setDefaultKey,
    refetch: fetchApiKeys
  };
}
```

---

## Additional Implementation Notes

- **Security:** Never log or expose full API keys in console or network requests
- **Performance:** Use React.memo for table rows to prevent unnecessary re-renders
- **Accessibility:** Implement proper ARIA labels for table headers and action buttons
- **Error Handling:** Provide specific error messages for different failure scenarios
- **Mobile UX:** Consider swipe actions for mobile table interactions
- **Real-time Updates:** Implement optimistic UI updates with rollback on failure
- **Validation:** Client-side validation with proper error states and messages
- **Loading States:** Skeleton screens that match the actual table structure
- **Empty States:** Engaging empty state with clear call-to-action for first API key creation
