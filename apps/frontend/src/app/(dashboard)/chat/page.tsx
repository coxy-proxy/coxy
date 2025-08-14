'use client';

import { ChatInput } from '_/components/chat/ChatInput';
import { ModelSelector } from '_/components/chat/ModelSelector';
import { TypingIndicator } from '_/components/chat/TypingIndicator';
import { useChat } from '_/hooks/useChat';
import { createChatSession } from '_/services/sessions';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  const { sendMessage, isLoading } = useChat();

  const handleFirstMessage = async (message: string) => {
    try {
      const { sessionId } = createChatSession();
      // Kick off sending and immediately navigate to the session page
      // The session page will display the streaming assistant response.
      void sendMessage(sessionId, message);
      router.push(`/chat/${sessionId}`);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-6 flex h-full">
      <div className="mt-[calc(40%)] mx-auto w-full max-w-xl">
        <h1 className="mb-4 text-center text-3xl font-semibold">Start a conversation</h1>

        <div className="w-full">
          <ChatInput
            onSend={handleFirstMessage}
            disabled={isLoading}
            placeholder="Type your message here..."
            autoFocus
            className="w-full"
          />
          <div className="mt-2">
            <ModelSelector />
          </div>
        </div>

        {isLoading && (
          <div className="mt-4 flex justify-center">
            <TypingIndicator />
          </div>
        )}
      </div>
    </div>
  );
}
