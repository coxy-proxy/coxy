'use client';

import { useRouter } from 'next/navigation';
import { ChatInput } from '_/components/chat/ChatInput';
import { TypingIndicator } from '_/components/chat/TypingIndicator';
import { ModelSelector } from '_/components/chat/ModelSelector';
import { createChatSession } from '_/services/sessions';
import { useChat } from '_/hooks/useChat';

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