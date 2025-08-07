import type { ApiKey } from '_/types/api-key';
import DefaultKeyBadge from './DefaultKeyBadge';

interface ApiKeyRowProps {
  apiKey: ApiKey;
  onEdit: (key: ApiKey) => void;
  onDelete: (key: ApiKey) => void;
  onSetDefault: (id: string) => void;
}

export default function ApiKeyRow({ apiKey, onEdit, onDelete, onSetDefault }: ApiKeyRowProps) {
  const quotaUsed = apiKey.usageCount;
  const quotaLimit = apiKey.meta?.completionsQuota ?? 'N/A';
  const quotaRenewDate = apiKey.meta?.resetTime ? new Date(apiKey.meta.resetTime * 1000).toLocaleDateString() : 'N/A';

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{apiKey.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{apiKey.maskedKey}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(apiKey.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {apiKey.isDefault ? (
          <DefaultKeyBadge />
        ) : (
          <button onClick={() => onSetDefault(apiKey.id)} className="text-indigo-600 hover:text-indigo-900">
            Set as default
          </button>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${quotaUsed} / ${quotaLimit}`}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quotaRenewDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
        <button onClick={() => onEdit(apiKey)} className="text-indigo-600 hover:text-indigo-900">
          Edit
        </button>
        <button onClick={() => onDelete(apiKey)} className="text-red-600 hover:text-red-900">
          Delete
        </button>
      </td>
    </tr>
  );
}
