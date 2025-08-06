import { ChatMessage as ChatMessageType } from '_/types/chat';
import ChatMessage from './ChatMessage';

export default function ChatHistory({
  messages,
  isLoading,
}: {
  messages: ChatMessageType[];
  isLoading: boolean;
}) {
  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="rounded-lg px-4 py-2 bg-gray-200 text-gray-800">
            <p className="text-sm">Typing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
