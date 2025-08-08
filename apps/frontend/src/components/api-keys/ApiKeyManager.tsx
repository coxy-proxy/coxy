'use client';

import { useApiKeys } from '_/hooks/useApiKeys';
import { useState } from 'react';
import type { ApiKey, CreateApiKeyDto } from '@/shared/types/api-key';
import ApiKeyTable from './ApiKeyTable';
import ApiKeyTableSkeleton from './ApiKeyTableSkeleton';
import CreateApiKeyModal from './CreateApiKeyModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import EditApiKeyModal from './EditApiKeyModal';
import EmptyState from './EmptyState';

export default function ApiKeyManager({ initialApiKeys }: { initialApiKeys: ApiKey[] }) {
  const { apiKeys, loading, error, createApiKey, updateApiKey, deleteApiKey, setDefaultKey } =
    useApiKeys(initialApiKeys);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteDialogValid, setDeleteDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
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

  const handleEdit = (key: ApiKey) => {
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

  const handleDelete = (key: ApiKey) => {
    setSelectedKey(key);
    setDeleteDialog(true);
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
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Create Key
        </button>
      </div>

      {apiKeys.length === 0 ? (
        <EmptyState onNewKeyClick={() => setCreateModalOpen(true)} />
      ) : (
        <ApiKeyTable apiKeys={apiKeys} onEdit={handleEdit} onDelete={handleDelete} onSetDefault={setDefaultKey} />
      )}

      <CreateApiKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreate}
        isCreating={isSubmitting}
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
