'use client';

import { ChatHeader } from '_/components/chat/ChatHeader';
import { ChatInput } from '_/components/chat/ChatInput';
import { MessageList } from '_/components/chat/MessageList';
import { useChatStore } from '_/hooks/useChatStore';

export default function ChatSessionPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params;
  const { sessions, addMessage, isLoading } = useChatStore();
  const messages = sessions[sessionId] || [];

  const handleSendMessage = async (content: string) => {
    const userMessage = {
      id: Date.now().toString(),
      content,
      role: 'user' as const,
      timestamp: new Date(),
      status: 'pending' as const,
      sessionId,
    };
    addMessage(sessionId, userMessage);
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
