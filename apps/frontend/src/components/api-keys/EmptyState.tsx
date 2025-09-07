'use client';

import { Button } from '@/shared/ui/components/button';

interface EmptyStateProps {
  onNewKeyClick: () => void;
}

export default function EmptyState({ onNewKeyClick }: EmptyStateProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="p-12 text-center">
        <h3 className="text-lg font-semibold text-foreground">No API Keys Found</h3>
        <p className="mt-1 text-sm text-muted-foreground">Get started by creating your first API key.</p>
        <div className="mt-6">
          <Button type="button" onClick={onNewKeyClick}>
            Create API Key
          </Button>
        </div>
      </div>
    </div>
  );
}
