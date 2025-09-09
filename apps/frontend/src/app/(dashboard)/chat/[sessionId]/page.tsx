'use client';

import { ChatInput } from '_/components/chat/ChatInput';
import { MessageList } from '_/components/chat/MessageList';
import { ModelSelector } from '_/components/chat/ModelSelector';
import { TypingIndicator } from '_/components/chat/TypingIndicator';
import { useChat } from '_/hooks/useChat';
import { useChatStore } from '_/hooks/useChatStore';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

interface ChatSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  const { sessions } = useChatStore();
  const { sendMessage, retryAssistantMessage, isLoading } = useChat(sessionId);
  const messages = sessions[sessionId];

  // Use store's hasHydrated flag set via onRehydrateStorage
  const hydrated = useChatStore((s) => s.hasHydrated);
  useEffect(() => {
    if (!hydrated) return;
    if (!messages) {
      router.replace('/chat');
    }
  }, [hydrated, messages, router]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(sessionId, content);
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-0 flex flex-col">
      {!hydrated || !messages ? (
        <div className="flex h-full items-center justify-center py-12">
          <TypingIndicator />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4">
          <div className="">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              onRetry={(assistantMessageId) => retryAssistantMessage(sessionId, assistantMessageId)}
              className="h-full"
            />
          </div>
          <div className="sticky bottom-0 bg-background pt-2 pb-3">
            <ChatInput
              autoFocus
              onSend={handleSendMessage}
              disabled={isLoading}
              placeholder="Send a follow-up message..."
            />
            <div className="mt-2">
              <ModelSelector />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
