# AI Chat Feature Implementation Prompt

## 1. Persona
You are a senior React/Next.js developer specializing in real-time chat interfaces and conversational UX design. You have extensive experience building intuitive messaging systems with optimistic UI updates and seamless user experiences.

## 2. Task Statement
Implement the AI chatting feature with a centered input box on the main page that transitions to a dedicated chat session page after the first message is sent, supporting continuous conversation flow with follow-up messages.

## 3. Context
This is part of a larger AI chatbot SaaS application built with Next.js 15, TypeScript, and Tailwind CSS. The chat feature should provide a smooth, intuitive experience where users start with a prominent input box and seamlessly transition into a full conversation interface. The system integrates with an external AI API and uses Clerk for authentication. Users should feel like they're having a natural conversation with instant feedback and proper message handling.

## 4. Constraints

### Technical Requirements:
- **Framework:** Next.js 15 App Router with TypeScript
- **Styling:** Tailwind CSS only (no external chat libraries)
- **State Management:** React Context or Zustand for chat state
- **API Integration:** External API at `$BASE_URL/api/chat` via Axios
- **Authentication:** Clerk tokens passed via Axios interceptors
- **Routing:** Next.js App Router for page transitions

### UX/UI Requirements:
- Centered input box on main chat page for initial message
- Smooth transition to dedicated chat session page after first send
- Real-time feel with optimistic UI updates
- Message streaming support (if available from API)
- Loading states and typing indicators
- Error handling with retry options
- Mobile-responsive design
- Keyboard accessibility (Enter to send, Shift+Enter for new line)

### Functional Constraints:
- Generate unique session IDs for each conversation
- Maintain chat history within session
- Support markdown rendering in AI responses
- Handle long messages with proper text wrapping
- Implement message status indicators (sending, sent, error)
- Auto-scroll to latest message
- Preserve chat state during navigation
- Session persistence across page refreshes

## 5. Stepwise Instructions

### Phase 1: Initial Chat Interface Setup
1. Create the main chat page (`/chat`) with centered input box design
2. Implement the initial message input component with proper styling
3. Set up chat state management (Context or Zustand store)
4. Create TypeScript interfaces for messages and chat sessions
5. Implement session ID generation utility

### Phase 2: Chat Session Page Structure
6. Create dynamic chat session page (`/chat/[sessionId]`)
7. Design the chat message list container with proper scrolling
8. Build individual message components (user and assistant)
9. Implement the persistent input box for follow-up messages
10. Add auto-scroll functionality for new messages

### Phase 3: Message Flow Implementation
11. Create API service for chat message submission
12. Implement optimistic UI updates for sent messages
13. Add message status tracking (pending, sent, error)
14. Build retry mechanism for failed messages
15. Handle API response streaming (if supported)

### Phase 4: Navigation and State Management
16. Implement smooth transition from main chat to session page
17. Set up session state persistence and restoration
18. Add proper loading states during API calls
19. Create error boundaries for chat components
20. Implement proper cleanup on session end

### Phase 5: Enhanced Features
21. Add typing indicators and message timestamps
22. Implement markdown rendering for AI responses
23. Add message actions (copy, regenerate if applicable)
24. Create responsive design for mobile chat experience
25. Add keyboard shortcuts and accessibility features

## 6. Output Specification

### Required Components:

#### 1. Main Chat Page (`app/(dashboard)/chat/page.tsx`)
```typescript
// Centered input box layout
interface MainChatPageProps {
  onMessageSend: (message: string) => Promise<void>;
}

// Should handle:
// - Initial message composition
// - Navigation to session page after send
// - Loading state during first message
```

#### 2. Chat Session Page (`app/(dashboard)/chat/[sessionId]/page.tsx`)
```typescript
// Full chat interface
interface ChatSessionPageProps {
  params: { sessionId: string };
}

// Should include:
// - Message history display
// - Persistent input box
// - Auto-scroll behavior
// - Message status indicators
```

#### 3. Core Chat Components
```typescript
// Message components
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status: 'pending' | 'sent' | 'error';
  sessionId: string;
}

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onRetry?: (messageId: string) => void;
}
```

### API Integration Structure:
```typescript
// services/chat.ts
export interface ChatRequest {
  message: string;
  sessionId: string;
  history?: Message[];
}

export interface ChatResponse {
  id: string;
  content: string;
  timestamp: string;
  sessionId: string;
}

export async function sendMessage(request: ChatRequest): Promise<ChatResponse>
export async function getChatHistory(sessionId: string): Promise<Message[]>
export async function createChatSession(): Promise<{ sessionId: string }>
```

### State Management Structure:
```typescript
// hooks/useChatStore.ts or context/ChatContext.tsx
interface ChatState {
  sessions: Record<string, Message[]>;
  currentSession: string | null;
  isLoading: boolean;
  error: string | null;
}

interface ChatActions {
  createSession: () => string;
  addMessage: (sessionId: string, message: Message) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

### File Structure:
```
app/(dashboard)/chat/
├── page.tsx                    # Main chat page with centered input
├── [sessionId]/
│   └── page.tsx               # Chat session page
├── loading.tsx                # Loading UI
└── error.tsx                  # Error boundary

components/chat/
├── ChatInput.tsx              # Message input component
├── MessageList.tsx            # Message history display
├── Message.tsx                # Individual message component
├── TypingIndicator.tsx        # Loading/typing animation
└── ChatHeader.tsx             # Session header with info

services/
├── chat.ts                    # Chat API integration
└── sessions.ts                # Session management

hooks/
├── useChat.ts                 # Chat logic hook
├── useChatStore.ts            # State management
└── useAutoScroll.ts           # Auto-scroll behavior
```

## 7. Examples

### Main Chat Page Layout:
```tsx
// app/(dashboard)/chat/page.tsx
export default function ChatPage() {
  const router = useRouter();
  const { createSession, sendMessage } = useChat();
  const [isLoading, setIsLoading] = useState(false);

  const handleFirstMessage = async (message: string) => {
    setIsLoading(true);
    try {
      const sessionId = createSession();
      await sendMessage(sessionId, message);
      router.push(`/chat/${sessionId}`);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
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
```

### Chat Session Page Structure:
```tsx
// app/(dashboard)/chat/[sessionId]/page.tsx
export default function ChatSessionPage({ 
  params 
}: { 
  params: { sessionId: string } 
}) {
  const { sessionId } = params;
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    error 
  } = useChat(sessionId);

  const handleSendMessage = async (content: string) => {
    await sendMessage(sessionId, content);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader sessionId={sessionId} />
      
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          className="h-full"
        />
      </div>
      
      <div className="border-t bg-white p-4">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="Send a follow-up message..."
        />
      </div>
    </div>
  );
}
```

### Message Component with Status:
```tsx
// components/chat/Message.tsx
interface MessageProps {
  message: Message;
  onRetry?: () => void;
}

export function Message({ message, onRetry }: MessageProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const isPending = message.status === 'pending';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        } ${isError ? 'border border-red-300' : ''}`}
      >
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
          <span>{format(message.timestamp, 'HH:mm')}</span>
          
          {isPending && <LoadingSpinner size="sm" />}
          {isError && (
            <button
              onClick={onRetry}
              className="text-red-400 hover:text-red-300 underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Chat Input Component:
```tsx
// components/chat/ChatInput.tsx
interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type a message...",
  autoFocus = false,
  className = "",
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        rows={1}
        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        style={{
          minHeight: '52px',
          maxHeight: '120px',
        }}
      />
      
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SendIcon className="h-4 w-4" />
      </button>
    </form>
  );
}
```

---

## Implementation Priorities

1. **Smooth UX Flow:** Focus on seamless transition from initial input to chat session
2. **Real-time Feel:** Implement optimistic UI updates and proper loading states
3. **Error Resilience:** Build robust error handling with retry mechanisms
4. **Mobile Experience:** Ensure touch-friendly interface with proper keyboard handling
5. **Performance:** Optimize message rendering and scroll behavior for long conversations
6. **Accessibility:** Support keyboard navigation and screen readers
7. **State Persistence:** Maintain chat history across page refreshes and navigation

## Additional Considerations

- **Message Streaming:** If the external API supports streaming responses, implement real-time message updates
- **Session Management:** Consider implementing session cleanup and limits
- **Offline Handling:** Add offline state detection and queuing for messages
- **Rich Content:** Support for code blocks, links, and other rich content in messages
- **Export Features:** Allow users to export or share chat sessions
- **Analytics:** Track usage patterns and conversation metrics (with proper privacy considerations)
