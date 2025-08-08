'use client';

import { useChatStore } from './useChatStore';
import { sendMessage } from '_/services/chat';
import { v4 as uuidv4 } from 'uuid';

export function useChat(sessionId?: string) {
  const {
    sessions,
    addMessage,
    updateMessageStatus,
    updateMessageContent,
    appendMessageContent,
    isLoading,
    setLoading,
    setError,
  } = useChatStore();

  const messages = sessionId ? sessions[sessionId] || [] : [];

  const handleSendMessage = async (
    currentSessionId: string,
    content: string,
  ) => {
    const userMessage = {
      id: uuidv4(),
      content,
      role: 'user' as const,
      timestamp: new Date(),
      status: 'pending' as const,
      sessionId: currentSessionId,
    };
    addMessage(currentSessionId, userMessage);

    // Prepare an assistant placeholder to stream into
    const assistantMessageId = uuidv4();
    addMessage(currentSessionId, {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      status: 'pending',
      sessionId: currentSessionId,
    });

    setLoading(true);

    try {
      // Call API that streams the response; we'll append progressively in this scope
      const responsePromise = sendMessage({
        message: content,
        sessionId: currentSessionId,
        history: sessions[currentSessionId],
        model: useChatStore.getState().selectedModel ?? undefined,
      });

      const response = await sendMessage({
        message: content,
        sessionId: currentSessionId,
        history: sessions[currentSessionId],
        model: useChatStore.getState().selectedModel ?? undefined,
        onDelta: (delta) => {
          // Append streamed tokens to the assistant placeholder
          appendMessageContent(currentSessionId, assistantMessageId, delta);
        },
      });

      updateMessageStatus(currentSessionId, userMessage.id, 'sent');
      updateMessageContent(currentSessionId, assistantMessageId, response.content);
      updateMessageStatus(currentSessionId, assistantMessageId, 'sent');
    } catch (error)
    {
      console.error('Failed to send message:', error);
      updateMessageStatus(currentSessionId, userMessage.id, 'error');
      updateMessageStatus(currentSessionId, assistantMessageId, 'error');
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    sendMessage: handleSendMessage,
    isLoading,
    error: useChatStore().error,
  };
}
