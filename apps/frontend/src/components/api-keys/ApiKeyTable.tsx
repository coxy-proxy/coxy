import type { ApiKeyResponse } from '@/shared/types/api-key';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/shared/ui/components/table';
import ApiKeyRow from './ApiKeyRow';

interface ApiKeyTableProps {
  apiKeys: ApiKeyResponse[];
  onEdit: (key: ApiKeyResponse) => void;
  onDelete: (key: ApiKeyResponse) => void;
  onSetDefault: (id: string) => void;
}

export default function ApiKeyTable({ apiKeys, onEdit, onDelete, onSetDefault }: ApiKeyTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Quota</TableHead>
            <TableHead>Renew At</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((apiKey) => (
            <ApiKeyRow
              key={apiKey.id}
              apiKey={apiKey}
              onEdit={onEdit}
              onDelete={onDelete}
              onSetDefault={onSetDefault}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
