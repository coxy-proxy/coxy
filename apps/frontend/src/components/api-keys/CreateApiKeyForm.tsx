'use client';

import { useState } from 'react';

interface CreateApiKeyFormProps {
  onCreate: (name: string) => Promise<void>;
  isLoading: boolean;
}

export default function CreateApiKeyForm({ onCreate, isLoading }: CreateApiKeyFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate(name.trim());
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter a name for your new key"
        className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={isLoading}
        required
      />
      <button
        type="submit"
        className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
        disabled={isLoading || !name.trim()}
      >
        {isLoading ? 'Creating...' : 'Create Key'}
      </button>
    </form>
  );
}
