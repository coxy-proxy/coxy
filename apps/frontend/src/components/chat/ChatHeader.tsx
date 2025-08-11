'use client';

import { ModelSelector } from './ModelSelector';

interface ChatHeaderProps {
  sessionId: string;
}

export function ChatHeader({ sessionId }: ChatHeaderProps) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">Chat Session</h2>
        <p className="text-sm text-gray-500">{sessionId}</p>
      </div>
      <ModelSelector />
    </div>
  );
}
