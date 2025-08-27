import type { ApiKeyResponse } from '@/shared/types/api-key';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/shared/ui/components/table';
import ApiKeyRow from './ApiKeyRow';

interface ApiKeyTableProps {
  apiKeys: ApiKeyResponse[];
  onEdit: (key: ApiKeyResponse) => void;
  onDelete: (key: ApiKeyResponse) => void;
  onSetDefault: (id: string) => void;
  onRefreshMeta: (key: ApiKeyResponse) => Promise<void>;
}

export default function ApiKeyTable({ apiKeys, onEdit, onDelete, onSetDefault, onRefreshMeta }: ApiKeyTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div data-slot="table-container" className="relative w-full overflow-x-auto">
        <Table data-slot="table" className="w-full caption-bottom text-sm">
          <TableHeader data-slot="table-header" className="[&_tr]:border-b-2 bg-muted sticky top-0 z-10">
            <TableRow className="border-b-2 transition-colors">
              <TableHead className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                Name
              </TableHead>
              <TableHead className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                Key
              </TableHead>
              <TableHead className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                Created At
              </TableHead>
              <TableHead className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                Default
              </TableHead>
              <TableHead className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                Chat Usage
              </TableHead>
              <TableHead className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                Renew At
              </TableHead>
              <TableHead className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody data-slot="table-body" className="[&_tr:last-child]:border-0">
            {apiKeys.map((apiKey) => (
              <ApiKeyRow
                key={apiKey.id}
                apiKey={apiKey}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                onRefreshMeta={onRefreshMeta}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
