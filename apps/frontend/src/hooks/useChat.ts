'use client';

import { sendMessage } from '_/services/chat';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from './useChatStore';

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

  const handleSendMessage = async (currentSessionId: string, content: string) => {
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
      const response = await sendMessage({
        message: content,
        sessionId: currentSessionId,
        history: sessions[currentSessionId] || [],
        model: useChatStore.getState().selectedModel ?? undefined,
        onDelta: (delta) => {
          // Append streamed tokens to the assistant placeholder
          appendMessageContent(currentSessionId, assistantMessageId, delta);
        },
      });

      updateMessageStatus(currentSessionId, userMessage.id, 'sent');
      updateMessageContent(currentSessionId, assistantMessageId, response.content);
      updateMessageStatus(currentSessionId, assistantMessageId, 'sent');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      updateMessageStatus(currentSessionId, userMessage.id, 'error');
      updateMessageContent(
        currentSessionId,
        assistantMessageId,
        error?.message || 'An error occurred while generating a response.',
      );
      updateMessageStatus(currentSessionId, assistantMessageId, 'error');
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retryAssistantMessage = async (currentSessionId: string, assistantMessageId: string) => {
    const sessionMessages = sessions[currentSessionId] || [];
    const idx = sessionMessages.findIndex((m) => m.id === assistantMessageId);
    if (idx === -1) return;
    const assistantMsg = sessionMessages[idx];
    if (assistantMsg.role !== 'assistant') return;

    // Find the preceding user message
    const prevUserIdx = [...sessionMessages]
      .slice(0, idx)
      .reverse()
      .findIndex((m) => m.role === 'user');
    if (prevUserIdx === -1) return;
    const actualUserIdx = idx - 1 - prevUserIdx;
    const userMsg = sessionMessages[actualUserIdx];

    // History should include messages before that user message
    const history = sessionMessages.slice(0, actualUserIdx);

    // Reset assistant message to pending and clear content
    updateMessageContent(currentSessionId, assistantMessageId, '');
    updateMessageStatus(currentSessionId, assistantMessageId, 'pending');

    setLoading(true);
    try {
      const response = await sendMessage({
        message: userMsg.content,
        sessionId: currentSessionId,
        history,
        model: useChatStore.getState().selectedModel ?? undefined,
        onDelta: (delta) => appendMessageContent(currentSessionId, assistantMessageId, delta),
      });

      updateMessageContent(currentSessionId, assistantMessageId, response.content);
      updateMessageStatus(currentSessionId, assistantMessageId, 'sent');
    } catch (error: any) {
      console.error('Retry failed:', error);
      updateMessageContent(
        currentSessionId,
        assistantMessageId,
        error?.message || 'An error occurred while generating a response.',
      );
      updateMessageStatus(currentSessionId, assistantMessageId, 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    sendMessage: handleSendMessage,
    retryAssistantMessage,
    isLoading,
    error: useChatStore().error,
  };
}
