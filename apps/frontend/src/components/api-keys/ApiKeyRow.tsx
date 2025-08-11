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
    <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b-2 transition-colors">
      <TableCell className="p-2 align-middle whitespace-nowrap text-sm font-medium text-foreground">
        {apiKey.name}
      </TableCell>
      <TableCell className="p-2 align-middle whitespace-nowrap text-sm text-muted-foreground font-mono">
        {apiKey.maskedKey}
      </TableCell>
      <TableCell className="p-2 align-middle whitespace-nowrap text-sm text-muted-foreground">
        {new Date(apiKey.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="p-2 align-middle whitespace-nowrap text-sm text-muted-foreground">
        {apiKey.isDefault ? (
          <DefaultKeyBadge />
        ) : (
          <Button variant="link" onClick={() => onSetDefault(apiKey.id)}>
            Set as default
          </Button>
        )}
      </TableCell>
      <TableCell className="p-2 align-middle whitespace-nowrap text-sm text-muted-foreground">{`${quotaUsed} / ${quotaLimit}`}</TableCell>
      <TableCell className="p-2 align-middle whitespace-nowrap text-sm text-muted-foreground">
        {quotaRenewDate}
      </TableCell>
      <TableCell className="p-2 align-middle whitespace-nowrap text-right text-sm font-medium space-x-2">
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
