'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '_/hooks/useChatStore';
import { ChatInput } from '_/components/chat/ChatInput';
import { TypingIndicator } from '_/components/chat/TypingIndicator';
import { ModelSelector } from '_/components/chat/ModelSelector';
import { createChatSession } from '_/services/sessions';

export default function ChatPage() {
  const router = useRouter();
  const { addMessage } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleFirstMessage = async (message: string) => {
    setIsLoading(true);
    try {
      const { sessionId } = createChatSession();
      const userMessage = {
        id: Date.now().toString(),
        content: message,
        role: 'user' as const,
        timestamp: new Date(),
        status: 'pending' as const,
        sessionId,
      };
      addMessage(sessionId, userMessage);
      router.push(`/chat/${sessionId}`);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Start a conversation
          </h1>
          <p className="text-gray-600">
            Ask me anything to begin our chat
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div />
          <ModelSelector />
        </div>

        <ChatInput
          onSend={handleFirstMessage}
          disabled={isLoading}
          placeholder="Type your message here..."
          autoFocus
          className="w-full"
        />

        {isLoading && (
          <div className="flex justify-center">
            <TypingIndicator />
          </div>
        )}
      </div>
    </div>
  );
}