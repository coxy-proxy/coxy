'use client';

interface ChatHeaderProps {
  sessionId: string;
}

export function ChatHeader({ sessionId }: ChatHeaderProps) {
  return (
    <div className="border-b bg-white p-4">
      <h2 className="text-lg font-semibold">Chat Session</h2>
      <p className="text-sm text-gray-500">{sessionId}</p>
    </div>
  );
}
