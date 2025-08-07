'use client';

import { useState } from 'react';
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(name, key);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Create New API Key</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="newKeyName" className="block text-sm font-medium text-gray-700">
                Key Name
              </label>
              <input
                type="text"
                id="newKeyName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., My Awesome App"
                required
              />
            </div>
            <div>
              <label htmlFor="newKeyValue" className="block text-sm font-medium text-gray-700">
                API Key (Optional)
              </label>
              <input
                type="text"
                id="newKeyValue"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Paste an existing key or leave blank to generate"
              />
            </div>
            <div className="flex justify-end space-x-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isCreating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !name}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {isCreating ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </form>
        </div>
        <DeviceFlowStatus />
      </div>
    </div>
  );
}
