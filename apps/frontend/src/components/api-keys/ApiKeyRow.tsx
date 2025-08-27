import { MoreVertical } from 'lucide-react';
import type { ApiKeyResponse } from '@/shared/types/api-key';
import { Button } from '@/shared/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/components/dropdown-menu';
import { TableCell, TableRow } from '@/shared/ui/components/table';
import DefaultKeyBadge from './DefaultKeyBadge';

interface ApiKeyRowProps {
  apiKey: ApiKeyResponse;
  onEdit: (key: ApiKeyResponse) => void;
  onDelete: (key: ApiKeyResponse) => void;
  onSetDefault: (id: string) => void;
  onRefreshMeta: (key: ApiKeyResponse) => Promise<void>;
}

const DEFAULT_CHAT_QUOTA = 500;

export default function ApiKeyRow({ apiKey, onEdit, onDelete, onSetDefault, onRefreshMeta }: ApiKeyRowProps) {
  const quotaUsed = DEFAULT_CHAT_QUOTA - apiKey.meta?.chatQuota || 0;

  // format as YYYY-MM-DD HH:mm
  const quotaRenewDate = apiKey.meta?.resetTime
    ? new Date(apiKey.meta.resetTime).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  return (
    <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b-2 transition-colors">
      <TableCell className="p-2 align-middle whitespace-nowrap text-sm font-medium text-foreground">
        {apiKey.name}
      </TableCell>
      <TableCell className="p-2 align-middle whitespace-nowrap text-sm text-muted-foreground font-mono">
        {apiKey.maskedKey}
      </TableCell>
      <TableCell className="p-2 align-middle whitespace-nowrap text-sm text-muted-foreground">
        {new Date(apiKey.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })}
      </TableCell>
      <TableCell className="p-2 align-middle whitespace-nowrap text-sm text-muted-foreground">
        {apiKey.isDefault ? <DefaultKeyBadge /> : <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="p-2 align-middle whitespace-nowrap text-sm text-muted-foreground">{`${quotaUsed} / ${DEFAULT_CHAT_QUOTA}`}</TableCell>
      <TableCell className="p-2 align-middle whitespace-nowrap text-sm text-muted-foreground">
        {quotaRenewDate}
      </TableCell>
      <TableCell className="p-2 align-middle whitespace-nowrap text-right text-sm font-medium">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open actions menu">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(apiKey)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRefreshMeta(apiKey)}>Refresh quota</DropdownMenuItem>
            {!apiKey.isDefault && (
              <DropdownMenuItem onClick={() => onSetDefault(apiKey.id)}>Set as default</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(apiKey)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
