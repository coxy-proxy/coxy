'use client';

import { ChatInput } from '_/components/chat/ChatInput';
import { MessageList } from '_/components/chat/MessageList';
import { ModelSelector } from '_/components/chat/ModelSelector';
import { useChat } from '_/hooks/useChat';
import { useChatStore } from '_/hooks/useChatStore';
import { use } from 'react';

interface ChatSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = use(params);
  const { sessions } = useChatStore();
  const { sendMessage, retryAssistantMessage, isLoading } = useChat(sessionId);
  const messages = sessions[sessionId] || [];

  const handleSendMessage = async (content: string) => {
    await sendMessage(sessionId, content);
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-0 flex flex-col">
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
    </div>
  );
}
