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
import { Separator } from '@/shared/ui/components/separator';
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
      <DialogContent className="gap-3 p-4 sm:max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base">Create API Key</DialogTitle>
          <DialogDescription className="text-xs">
            Give your key a name. Paste an existing key to import it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="newKeyName" className="text-xs">
              Key Name
            </Label>
            <Input
              type="text"
              id="newKeyName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome App"
              required
              className="h-8"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newKeyValue" className="text-xs">
              API Key
            </Label>
            <Input
              type="text"
              id="newKeyValue"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste an existing key"
              required
              className="h-8"
              autoComplete="off"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isCreating || !name || !key}>
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>

        <div className="relative py-2">
          <Separator />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-2 text-xs text-muted-foreground">OR</span>
          </div>
        </div>
        <DeviceFlowStatus />
      </DialogContent>
    </Dialog>
  );
}
