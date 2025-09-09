'use client';

import { Message } from '_/types/chat';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ChatState {
  sessions: Record<string, Message[]>;
  currentSession: string | null;
  isLoading: boolean;
  error: string | null;
  selectedModel: string | null;
  hasHydrated: boolean;
}

interface ChatActions {
  createSession: () => string;
  addMessage: (sessionId: string, message: Message) => void;
  updateMessageStatus: (sessionId: string, messageId: string, status: Message['status']) => void;
  updateMessageContent: (sessionId: string, messageId: string, content: string) => void;
  appendMessageContent: (sessionId: string, messageId: string, delta: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentSession: (sessionId: string) => void;
  setSelectedModel: (modelId: string) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      sessions: {},
      currentSession: null,
      isLoading: false,
      error: null,
      selectedModel: null,
      hasHydrated: false,
      createSession: () => {
        const { sessions } = get();
        const newSessionId = `session-${Object.keys(sessions).length + 1}`;
        set((state) => ({
          sessions: {
            ...state.sessions,
            [newSessionId]: [],
          },
          currentSession: newSessionId,
        }));
        return newSessionId;
      },
      addMessage: (sessionId, message) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: [...(state.sessions[sessionId] || []), message],
          },
        }));
      },
      updateMessageStatus: (sessionId, messageId, status) => {
        set((state) => {
          const sessionMessages = state.sessions[sessionId] || [];
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: sessionMessages.map((msg) => (msg.id === messageId ? { ...msg, status } : msg)),
            },
          };
        });
      },
      updateMessageContent: (sessionId, messageId, content) => {
        set((state) => {
          const sessionMessages = state.sessions[sessionId] || [];
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: sessionMessages.map((msg) => (msg.id === messageId ? { ...msg, content } : msg)),
            },
          };
        });
      },
      appendMessageContent: (sessionId, messageId, delta) => {
        set((state) => {
          const sessionMessages = state.sessions[sessionId] || [];
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: sessionMessages.map((msg) =>
                msg.id === messageId ? { ...msg, content: (msg.content || '') + delta } : msg,
              ),
            },
          };
        });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setCurrentSession: (sessionId) => set({ currentSession: sessionId }),
      setSelectedModel: (modelId) => set({ selectedModel: modelId }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        currentSession: state.currentSession,
        selectedModel: state.selectedModel,
      }),
      onRehydrateStorage: () => (state) => {
        // before hydration starts, flag stays false
        // after hydration, mark as hydrated
        state?.setHasHydrated(true);
      },
    },
  ),
);
