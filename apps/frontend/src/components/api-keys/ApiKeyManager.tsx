'use client';

import { useApiKeys } from '_/hooks/useApiKeys';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ApiKeyResponse, CreateApiKeyDto } from '@/shared/types/api-key';
import { Button } from '@/shared/ui/components/button';
import ApiKeyTable from './ApiKeyTable';
import ApiKeyTableSkeleton from './ApiKeyTableSkeleton';
import CreateApiKeyModal from './CreateApiKeyModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import EditApiKeyModal from './EditApiKeyModal';
import EmptyState from './EmptyState';

export default function ApiKeyManager({ initialApiKeys }: { initialApiKeys: ApiKeyResponse[] }) {
  const {
    apiKeys,
    loading,
    error,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    setDefaultKey,
    refreshMeta,
    refetchSilently,
  } = useApiKeys(initialApiKeys);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteDialogValid, setDeleteDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKeyResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (name: string, key?: string) => {
    setIsSubmitting(true);
    try {
      const request: CreateApiKeyDto = { name, key: key || undefined };
      await createApiKey(request);
      setCreateModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (key: ApiKeyResponse) => {
    setSelectedKey(key);
    setEditModalOpen(true);
  };

  const handleSave = async (name: string) => {
    if (!selectedKey) return;
    setIsSubmitting(true);
    try {
      await updateApiKey(selectedKey.id, name);
      setEditModalOpen(false);
      setSelectedKey(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (key: ApiKeyResponse) => {
    setSelectedKey(key);
    setDeleteDialog(true);
  };

  const handleRefreshMeta = async (key: ApiKeyResponse) => {
    try {
      await refreshMeta(key.id);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to refresh meta: ${e.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedKey) return;
    setIsSubmitting(true);
    try {
      await deleteApiKey(selectedKey.id);
      setDeleteDialog(false);
      setSelectedKey(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <ApiKeyTableSkeleton />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-gray-600">Manage your API keys for accessing the service.</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>Create API Key</Button>
      </div>

      {apiKeys.length === 0 ? (
        <EmptyState onNewKeyClick={() => setCreateModalOpen(true)} />
      ) : (
        <ApiKeyTable
          apiKeys={apiKeys}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetDefault={setDefaultKey}
          onRefreshMeta={handleRefreshMeta}
        />
      )}

      <CreateApiKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreate}
        isCreating={isSubmitting}
        onDeviceFlowSuccess={refetchSilently}
      />

      <EditApiKeyModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSave}
        apiKey={selectedKey}
        isSaving={isSubmitting}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogValid}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        apiKeyName={selectedKey?.name || ''}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
