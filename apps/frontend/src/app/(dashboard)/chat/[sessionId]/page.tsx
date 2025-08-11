'use client';

import { ChatHeader } from '_/components/chat/ChatHeader';
import { ChatInput } from '_/components/chat/ChatInput';
import { MessageList } from '_/components/chat/MessageList';
import { useChat } from '_/hooks/useChat';
import { useChatStore } from '_/hooks/useChatStore';
import { use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card';

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
    <Card className="flex h-full flex-col">
      <CardHeader className="border-b">
        <CardTitle className="sr-only">Chat Session</CardTitle>
        <CardDescription className="sr-only">Conversation and input</CardDescription>
        <ChatHeader sessionId={sessionId} />
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onRetry={(assistantMessageId) => retryAssistantMessage(sessionId, assistantMessageId)}
          className="h-full"
        />
      </CardContent>

      <div className="border-t p-4">
        <ChatInput onSend={handleSendMessage} disabled={isLoading} placeholder="Send a follow-up message..." />
      </div>
    </Card>
  );
}
