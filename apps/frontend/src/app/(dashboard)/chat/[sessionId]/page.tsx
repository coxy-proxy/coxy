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
    <div className="w-full p-0 flex flex-1 flex-col overflow-y-hidden">
      {!hydrated || !messages ? (
        <div className="flex h-full items-center justify-center py-12">
          <TypingIndicator />
        </div>
      ) : (
        <>
          <div className="flex flex-col flex-1 overflow-y-auto [scrollbar-gutter:stable] pt-8 px-3 lg:px-8">
            <div className="flex-1 mx-auto max-w-4xl w-full lg:w-2/3">
              <MessageList
                messages={messages}
                isLoading={isLoading}
                onRetry={(assistantMessageId) => retryAssistantMessage(sessionId, assistantMessageId)}
                className="h-full"
              />
            </div>
          </div>
          <div className="bg-background max-w-4xl mx-auto w-full lg:w-2/3 px-3 lg:px-8">
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
        </>
      )}
    </div>
  );
}
