/**
 * Chat Store
 * Manages chat/conversation state using Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ChatState, ChatMessage, Conversation } from './types';
import { supabase } from '@/lib/auth';

// API base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE_URL || 'http://localhost:3000/api';

// Helper to get auth headers
async function getAuthHeader(): Promise<Record<string, string> | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;
  return { Authorization: `Bearer ${session.access_token}` };
}

// Initial state
const initialState = {
  conversations: [] as Conversation[],
  currentConversation: null as Conversation | null,
  messages: [] as ChatMessage[],
  loading: false,
  sending: false,
  error: null as string | null,
  isOpen: false,
};

// Create the store
export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Fetch all conversations (admin use)
      fetchConversations: async () => {
        try {
          set({ loading: true, error: null });

          const headers = await getAuthHeader();
          if (!headers) {
            throw new Error('Not authenticated');
          }

          const response = await fetch(`${API_BASE_URL}/admin/chat/conversations`, {
            method: 'GET',
            headers,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch conversations');
          }

          const data = await response.json();

          set({
            conversations: data.data || data.items || [],
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch conversations';
          set({ loading: false, error: errorMessage });
        }
      },

      // Fetch user's conversation
      fetchConversation: async (id: string) => {
        try {
          set({ loading: true, error: null });

          const headers = await getAuthHeader();
          if (!headers) {
            throw new Error('Not authenticated');
          }

          const response = await fetch(`${API_BASE_URL}/chat/conversation/${id}`, {
            method: 'GET',
            headers,
          });

          if (!response.ok) {
            if (response.status === 404) {
              // No conversation yet, that's OK
              set({ currentConversation: null, messages: [], loading: false });
              return;
            }
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch conversation');
          }

          const conversation = await response.json();

          // Fetch messages for this conversation
          const messagesResponse = await fetch(
            `${API_BASE_URL}/chat/messages?limit=50`,
            {
              method: 'GET',
              headers,
            }
          );

          let messages: ChatMessage[] = [];
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            messages = messagesData.data || messagesData.items || [];
          }

          set({
            currentConversation: conversation,
            messages,
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch conversation';
          set({ loading: false, error: errorMessage });
        }
      },

      // Create or get conversation
      createConversation: async (title?: string) => {
        try {
          set({ loading: true, error: null });

          const headers = await getAuthHeader();
          if (!headers) {
            throw new Error('Not authenticated');
          }

          const response = await fetch(`${API_BASE_URL}/chat/conversation`, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create conversation');
          }

          const conversation = await response.json();

          set({
            currentConversation: conversation,
            messages: [],
            loading: false,
          });

          return conversation;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      // Send a message
      sendMessage: async (content: string) => {
        try {
          set({ sending: true, error: null });

          const headers = await getAuthHeader();
          if (!headers) {
            throw new Error('Not authenticated');
          }

          const response = await fetch(`${API_BASE_URL}/chat/messages`, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: content }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send message');
          }

          const message = await response.json();

          set((state) => ({
            messages: [...state.messages, message],
            sending: false,
          }));

          return message;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
          set({ sending: false, error: errorMessage });
          throw error;
        }
      },

      // Set current conversation
      setCurrentConversation: (conversation: Conversation | null) => {
        set({ currentConversation: conversation });
      },

      // Open chat panel
      openChat: () => {
        set({ isOpen: true });
      },

      // Close chat panel
      closeChat: () => {
        set({ isOpen: false });
      },

      // Toggle chat panel
      toggleChat: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      // Setters
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),

      // Reset store
      reset: () => set(initialState),
    }),
    { name: 'ChatStore' }
  )
);

// Selector hooks for specific pieces of state
export const useConversations = () => useChatStore((state) => state.conversations);
export const useCurrentConversation = () => useChatStore((state) => state.currentConversation);
export const useChatMessages = () => useChatStore((state) => state.messages);
export const useChatLoading = () => useChatStore((state) => state.loading);
export const useChatSending = () => useChatStore((state) => state.sending);
export const useChatError = () => useChatStore((state) => state.error);
export const useIsChatOpen = () => useChatStore((state) => state.isOpen);

// Action hooks
export const useChatActions = () =>
  useChatStore((state) => ({
    fetchConversations: state.fetchConversations,
    fetchConversation: state.fetchConversation,
    createConversation: state.createConversation,
    sendMessage: state.sendMessage,
    setCurrentConversation: state.setCurrentConversation,
    openChat: state.openChat,
    closeChat: state.closeChat,
    toggleChat: state.toggleChat,
  }));
