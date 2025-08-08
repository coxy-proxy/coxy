'use client';

import type { Message as MessageType } from '_/types/chat';
import { format } from 'date-fns';

interface MessageProps {
  message: MessageType;
  onRetry?: () => void;
}

export function Message({ message, onRetry }: MessageProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const isPending = message.status === 'pending';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isUser ? 'bg-blue-600 text-white' : isError ? 'bg-red-50 text-red-800' : 'bg-gray-100 text-gray-900'
        } ${isError ? 'border border-red-300' : ''}`}
      >
        <div className="prose prose-sm max-w-none whitespace-pre-wrap">{message.content}</div>

        <div className="mt-2 flex items-center justify-between text-xs opacity-70">
          <span>{format(message.timestamp, 'HH:mm')}</span>

          {isPending && (
            <div
              className={`h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ${isUser ? 'border-white' : 'border-gray-600'}`}
            />
          )}
          {isError && (
            <button onClick={onRetry} className="text-red-500 underline hover:text-red-600">
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
