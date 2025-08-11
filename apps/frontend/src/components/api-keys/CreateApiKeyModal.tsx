'use client';

import { useState } from 'react';
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
import DeviceFlowStatus from './DeviceFlowStatus';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, key?: string) => Promise<void>;
  isCreating: boolean;
}

export default function CreateApiKeyModal({ isOpen, onClose, onCreate, isCreating }: CreateApiKeyModalProps) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(name, key);
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
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogDescription>Give your key a name. Optionally paste an existing key to import it.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newKeyName">Key Name</Label>
            <Input
              type="text"
              id="newKeyName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Awesome App"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newKeyValue">API Key (Optional)</Label>
            <Input
              type="text"
              id="newKeyValue"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste an existing key or leave blank to generate"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !name}>
              {isCreating ? 'Creating...' : 'Create Key'}
            </Button>
          </DialogFooter>
        </form>

        <DeviceFlowStatus />
      </DialogContent>
    </Dialog>
  );
}
