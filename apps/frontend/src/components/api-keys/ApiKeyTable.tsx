import type { ApiKey } from '@/shared/types/api-key';
import ApiKeyRow from './ApiKeyRow';

interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  onEdit: (key: ApiKey) => void;
  onDelete: (key: ApiKey) => void;
  onSetDefault: (id: string) => void;
}

export default function ApiKeyTable({ apiKeys, onEdit, onDelete, onSetDefault }: ApiKeyTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Key
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Default
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quota
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Renew At
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
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
}
