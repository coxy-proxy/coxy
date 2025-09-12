import { Skeleton } from '@/shared/ui/components/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/components/table';

export default function ApiKeyTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border m-4">
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
                Created
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
          <TableBody data-slot="table-body" className="[&_tr:last-child]:border-0 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <TableRow key={i} className="border-b-2 transition-colors">
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap text-right">
                  <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
