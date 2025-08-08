'use client';

import { ChatHeader } from '_/components/chat/ChatHeader';
import { ChatInput } from '_/components/chat/ChatInput';
import { MessageList } from '_/components/chat/MessageList';
import { useChatStore } from '_/hooks/useChatStore';
import { use } from 'react';
import { useChat } from '_/hooks/useChat';

interface ChatSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = use(params);
  const { sessions } = useChatStore();
  const { sendMessage, isLoading } = useChat(sessionId);
  const messages = sessions[sessionId] || [];

  const handleSendMessage = async (content: string) => {
    await sendMessage(sessionId, content);
  };

  return (
    <div className="flex h-full flex-col">
      <ChatHeader sessionId={sessionId} />

      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} className="h-full" />
      </div>

      <div className="border-t bg-white p-4">
        <ChatInput onSend={handleSendMessage} disabled={isLoading} placeholder="Send a follow-up message..." />
      </div>
    </div>
  );
}
