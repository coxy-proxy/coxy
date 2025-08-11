'use client';

import { useEffect, useState } from 'react';
import type { ApiKeyResponse } from '@/shared/types/api-key';
import { Button } from '@/shared/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/dialog';
import { Input } from '@/shared/ui/components/input';
import { Label } from '@/shared/ui/components/label';

interface EditApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  apiKey: ApiKeyResponse | null;
  isSaving: boolean;
}

export default function EditApiKeyModal({ isOpen, onClose, onSave, apiKey, isSaving }: EditApiKeyModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (apiKey) {
      setName(apiKey.name);
    }
  }, [apiKey]);

  if (!apiKey) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(name);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit API Key</DialogTitle>
          <DialogDescription>Update the display name for your API key.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyName">Key Name</Label>
            <Input type="text" id="keyName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || name === apiKey.name}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
