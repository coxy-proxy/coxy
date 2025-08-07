'use client';

interface EmptyStateProps {
  onNewKeyClick: () => void;
}

export default function EmptyState({ onNewKeyClick }: EmptyStateProps) {
  return (
    <div className="text-center bg-white p-12 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900">No API Keys Found</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating your first API key.</p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onNewKeyClick}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create API Key
        </button>
      </div>
    </div>
  );
}
