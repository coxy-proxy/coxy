import type { ChatMessage } from '_/types/chat';

export default function ChatMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      <div className={`rounded-lg px-4 py-2 ${isUser ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
}
