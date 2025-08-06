'use client';

import { useState } from 'react';

export default function ChatInput({
  onSendMessage,
  isLoading,
}: {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 border-t">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="px-6 py-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 disabled:bg-indigo-300"
        disabled={isLoading}
      >
        {isLoading ? '...' : 'Send'}
      </button>
    </form>
  );
}
