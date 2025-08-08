'use client';

import { useChatStore } from './useChatStore';
import { sendMessage } from '_/services/chat';
import { v4 as uuidv4 } from 'uuid';

export function useChat(sessionId?: string) {
  const {
    sessions,
    addMessage,
    updateMessageStatus,
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
    setLoading(true);

    try {
      const response = await sendMessage({
        message: content,
        sessionId: currentSessionId,
        history: sessions[currentSessionId],
      });
      updateMessageStatus(currentSessionId, userMessage.id, 'sent');

      const assistantMessage = {
        id: response.id,
        content: response.content,
        role: 'assistant' as const,
        timestamp: new Date(response.timestamp),
        status: 'sent' as const,
        sessionId: response.sessionId,
      };
      addMessage(currentSessionId, assistantMessage);
    } catch (error)
    {
      console.error('Failed to send message:', error);
      updateMessageStatus(currentSessionId, userMessage.id, 'error');
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
