import type { ApiKeyResponse } from '@/shared/types/api-key';
import { Button } from '@/shared/ui/components/button';
import { TableCell, TableRow } from '@/shared/ui/components/table';
import DefaultKeyBadge from './DefaultKeyBadge';

interface ApiKeyRowProps {
  apiKey: ApiKeyResponse;
  onEdit: (key: ApiKeyResponse) => void;
  onDelete: (key: ApiKeyResponse) => void;
  onSetDefault: (id: string) => void;
}

export default function ApiKeyRow({ apiKey, onEdit, onDelete, onSetDefault }: ApiKeyRowProps) {
  const quotaUsed = apiKey.usageCount;
  const quotaLimit = apiKey.meta?.completionsQuota ?? 'N/A';
  const quotaRenewDate = apiKey.meta?.resetTime ? new Date(apiKey.meta.resetTime * 1000).toLocaleDateString() : 'N/A';

  return (
    <TableRow>
      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{apiKey.name}</TableCell>
      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{apiKey.maskedKey}</TableCell>
      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(apiKey.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {apiKey.isDefault ? (
          <DefaultKeyBadge />
        ) : (
          <Button variant="link" onClick={() => onSetDefault(apiKey.id)}>
            Set as default
          </Button>
        )}
      </TableCell>
      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${quotaUsed} / ${quotaLimit}`}</TableCell>
      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quotaRenewDate}</TableCell>
      <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
        <Button variant="link" onClick={() => onEdit(apiKey)}>
          Edit
        </Button>
        <Button variant="link" onClick={() => onDelete(apiKey)} className="text-red-600 hover:text-red-900">
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
