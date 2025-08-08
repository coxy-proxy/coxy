'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageType } from '_/types/chat';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
  onRetry?: (messageId: string) => void;
  className?: string;
}

export function MessageList({
  messages,
  isLoading,
  onRetry,
  className = '',
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className={`overflow-y-auto p-4 ${className}`}>
      {messages.map((msg) => (
        <Message
          key={msg.id}
          message={msg}
          onRetry={() => onRetry?.(msg.id)}
        />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}
    </div>
  );
}
