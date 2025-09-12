'use client';

import type { Message as MessageType } from '_/types/chat';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
  onRetry?: (messageId: string) => void;
  className?: string;
}

// Presentational-only list: no internal scrolling or auto-scroll logic.
export function MessageList({ messages, isLoading, onRetry, className = '' }: MessageListProps) {
  return (
    <div className={className}>
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} onRetry={() => onRetry?.(msg.id)} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}
      {!isLoading && messages.length === 0 && (
        <div className="text-center text-sm text-gray-500 py-6">No messages yet.</div>
      )}
    </div>
  );
}
