'use client';

import { ChatInput } from '_/components/chat/ChatInput';
import { ModelSelector } from '_/components/chat/ModelSelector';
import { TypingIndicator } from '_/components/chat/TypingIndicator';
import { useChat } from '_/hooks/useChat';
import { createChatSession } from '_/services/sessions';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card';

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
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Start a conversation</CardTitle>
          <CardDescription>Ask me anything to begin our chat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
