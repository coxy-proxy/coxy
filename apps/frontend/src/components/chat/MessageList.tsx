'use client';

import type { Message as MessageType } from '_/types/chat';
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/shared/ui/components/scroll-area';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
  onRetry?: (messageId: string) => void;
  className?: string;
}

export function MessageList({ messages, isLoading, onRetry, className = '' }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className={`p-4 ${className}`}>
      <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto">
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
    </ScrollArea>
  );
}
