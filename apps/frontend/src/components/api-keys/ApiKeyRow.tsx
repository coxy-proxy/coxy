import type { ApiKey } from '_/types/api-key';
import { maskApiKey } from '_/utils/api-keys';
import DefaultKeyBadge from './DefaultKeyBadge';

interface ApiKeyRowProps {
  apiKey: ApiKey;
  onEdit: (key: ApiKey) => void;
  onDelete: (key: ApiKey) => void;
  onSetDefault: (id: string) => void;
}

export default function ApiKeyRow({ apiKey, onEdit, onDelete, onSetDefault }: ApiKeyRowProps) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{apiKey.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{maskApiKey(apiKey.key)}</td>
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {apiKey.quota ? `${apiKey.quota.used} / ${apiKey.quota.limit}` : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {apiKey.quota ? new Date(apiKey.quota.renewAt).toLocaleDateString() : 'N/A'}
      </td>
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
