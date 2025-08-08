import { TypingIndicator } from '_/components/chat/TypingIndicator';

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <TypingIndicator />
    </div>
  );
}
