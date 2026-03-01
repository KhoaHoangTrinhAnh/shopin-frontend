/**
 * Support Chat Store
 * 
 * Manages customer support chat state with WebSocket realtime communication.
 * Each customer has exactly one conversation with admin (enforced by DB constraint).
 * 
 * Features:
 * - Realtime message updates via Socket.IO WebSocket
 * - Optimistic UI updates
 * - Auto-reconnection handling
 * - Unread count tracking
 * - Typing indicators
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/auth';
import type { 
  SupportChatState, 
  SupportChatMessage, 
  SupportConversation,
  ConnectionStatus 
} from './types';
import { 
  connectSocket, 
  disconnectSocket, 
  getSocket, 
  joinConversation, 
  leaveConversation,
  sendTypingStatus,
  markMessagesRead
} from '@/lib/socket';
import type { Socket } from 'socket.io-client';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

/**
 * Helper to get auth headers
 */
async function getAuthHeader(): Promise<Record<string, string> | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;
  return { 
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Generate temporary ID for optimistic updates
 */
function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initial state
const initialState = {
  conversation: null as SupportConversation | null,
  messages: [] as SupportChatMessage[],
  unreadCount: 0,
  loading: false,
  sending: false,
  error: null as string | null,
  isOpen: false,
  connectionStatus: 'disconnected' as ConnectionStatus,
  isSubscribed: false,
};

/**
 * Support Chat Store
 */
export const useSupportChatStore = create<SupportChatState>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      /**
       * Initialize chat - fetch conversation and subscribe to realtime
       */
      initialize: async () => {
        const state = get();
        if (state.loading) return;

        set({ loading: true, error: null });

        try {
          // Fetch conversation
          await get().fetchConversation();
          
          // Subscribe only once
          if (!get().isSubscribed) {
            get().subscribe();
          }
          
          // Fetch initial unread count
          const headers = await getAuthHeader();
          if (headers) {
            const response = await fetch(`${API_BASE_URL}/chat/unread-count`, { headers });
            if (response.ok) {
              const data = await response.json();
              set({ unreadCount: data.count || 0 });
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to initialize chat';
          set({ error: message });
        } finally {
          set({ loading: false });
        }
      },

      /**
       * Fetch customer's conversation (creates if doesn't exist when chat is opened)
       */
      fetchConversation: async () => {
        const headers = await getAuthHeader();
        if (!headers) return;

        try {
          // First try to get existing conversation
          const response = await fetch(`${API_BASE_URL}/chat/conversation`, {
            method: 'GET',
            headers,
          });

          if (!response.ok) {
            let errorMsg = `Failed to fetch conversation: ${response.status} ${response.statusText}`;
            try { const body = await response.text(); if (body) errorMsg += ` - ${body}`; } catch {}
            console.error(errorMsg);
            set({ conversation: null, messages: [], error: errorMsg });
            return;
          }

          const conversation = await response.json();
            if (conversation) {
              set({ conversation });
              // Fetch messages after conversation is set
              await get().fetchMessages();
            } else {
              // No conversation yet - this is normal for new users
              set({ conversation: null, messages: [] });
            }
        } catch (error) {
          console.error('Error fetching conversation:', error);
        }
      },

      /**
       * Fetch messages for current conversation
       */
      fetchMessages: async () => {
        const { conversation } = get();
        if (!conversation) return;

        const headers = await getAuthHeader();
        if (!headers) return;

        try {
          const response = await fetch(`${API_BASE_URL}/chat/messages?limit=50`, {
            method: 'GET',
            headers,
          });

          if (response.ok) {
            const data = await response.json();
            set({ messages: data.data || [] });
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      },

      /**
       * Send a message with optimistic update
       */
      sendMessage: async (content: string) => {
        const trimmedContent = content.trim();
        if (!trimmedContent || get().sending) return null;

        // Validate message length
        if (trimmedContent.length > 5000) {
          set({ error: 'Message too long (max 5000 characters)' });
          return null;
        }

        const headers = await getAuthHeader();
        if (!headers) {
          set({ error: 'Not authenticated' });
          return null;
        }

        const { conversation } = get();
        const tempId = generateTempId();

        // Create optimistic message
        const optimisticMessage: SupportChatMessage = {
          id: tempId,
          conversation_id: conversation?.id || '',
          sender_id: '',
          sender_role: 'user',
          message: trimmedContent,
          is_read: false,
          created_at: new Date().toISOString(),
          _temp: true,
          _tempId: tempId,
        };

        // Add optimistic message to UI immediately
        set((state) => ({
          messages: [...state.messages, optimisticMessage],
          sending: true,
          error: null,
        }));

        try {
          const response = await fetch(`${API_BASE_URL}/chat/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              message: trimmedContent,
              conversation_id: conversation?.id || null,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send message');
          }

          const sentMessage = await response.json();

          // Replace optimistic message with real message
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg._tempId === tempId ? { ...sentMessage, _temp: false } : msg
            ),
            sending: false,
            // Update conversation if it was just created
            conversation: sentMessage.conversation_id 
              ? { ...state.conversation, id: sentMessage.conversation_id } as SupportConversation
              : state.conversation,
          }));

          // If conversation was just created, re-fetch it to get full details
          if (!conversation) {
            await get().fetchConversation();
            // Avoid duplicate subscription - unsubscribe then re-subscribe
            get().unsubscribe();
            get().subscribe();
          }

          return sentMessage;
        } catch (error) {
          // Remove optimistic message on error
          set((state) => ({
            messages: state.messages.filter((msg) => msg._tempId !== tempId),
            sending: false,
            error: error instanceof Error ? error.message : 'Failed to send message',
          }));
          return null;
        }
      },

      /**
       * Mark all admin messages as read
       */
      markAsRead: async () => {
        const { conversation, unreadCount } = get();
        if (!conversation || unreadCount === 0) return;

        const headers = await getAuthHeader();
        if (!headers) return;

        try {
          const res = await fetch(`${API_BASE_URL}/chat/messages/mark-read`, {
            method: 'PUT',
            headers,
          });

          if (!res.ok) {
            console.error(`markAsRead failed: ${res.status} ${res.statusText}`);
            return;
          }

          // Update local state only on success
          set((state) => ({
            unreadCount: 0,
            messages: state.messages.map((msg) => ({
              ...msg,
              is_read: msg.sender_role === 'admin' ? true : msg.is_read,
            })),
          }));
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      },

      /**
       * Subscribe to WebSocket realtime updates for current conversation
       */
      subscribe: async () => {
        // Guard against duplicate subscriptions
        if (get().isSubscribed) return;

        const { conversation } = get();
        
        if (!conversation) {
          set({ connectionStatus: 'disconnected' });
          return;
        }

        // Get user ID from auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          set({ connectionStatus: 'error' });
          return;
        }

        set({ connectionStatus: 'connecting' });

        try {
          // Connect to WebSocket with user credentials
          const socket = connectSocket({
            userId: session.user.id,
            userRole: 'user',
          });

          // Named handlers so they can be removed later
          const onConnect = () => {
            set({ connectionStatus: 'connected' });
            joinConversation(conversation.id);
          };

          const onDisconnect = () => {
            set({ connectionStatus: 'disconnected', isSubscribed: false });
          };

          const onConnectError = () => {
            set({ connectionStatus: 'error', isSubscribed: false });
          };

          const onMessageReceived = (data: {
            message: SupportChatMessage;
            conversationId: string;
          }) => {
            const { messages } = get();
            
            // Dedup: match by id or _tempId (not by content)
            const exists = messages.some(
              (msg) => msg.id === data.message.id ||
              (msg._tempId != null && msg._tempId === data.message._tempId)
            );

            if (!exists) {
              set((state) => ({
                messages: [...state.messages, data.message],
                unreadCount: data.message.sender_role === 'admin' && !state.isOpen
                  ? state.unreadCount + 1
                  : state.unreadCount,
              }));
            } else {
              // Replace temp message matched by _tempId
              set((state) => ({
                messages: state.messages.map((msg) =>
                  (msg._tempId != null && msg._tempId === data.message._tempId)
                    ? { ...data.message, _temp: false }
                    : msg
                ),
              }));
            }
          };

          socket.on('connect', onConnect);
          socket.on('disconnect', onDisconnect);
          socket.on('connect_error', onConnectError);
          socket.on('message_received', onMessageReceived);

          socket.on('conversation_updated', (data: {
            conversation: SupportConversation;
          }) => {
            set({ conversation: data.conversation });
          });

          socket.on('user_typing', (data: {
            userId: string;
            userRole: string;
            isTyping: boolean;
          }) => {
            if (data.userRole === 'admin') {
              console.log('Admin is typing:', data.isTyping);
            }
          });

          socket.on('messages_marked_read', () => {
            console.log('Admin read messages');
          });

          // Store references for cleanup
          (socket as any).__supportHandlers = { onConnect, onDisconnect, onConnectError, onMessageReceived };

          set({ isSubscribed: true });

          // If socket already connected, join room immediately
          if (socket.connected) {
            joinConversation(conversation.id);
            set({ connectionStatus: 'connected' });
          }

        } catch (error) {
          console.error('WebSocket subscription error:', error);
          set({ connectionStatus: 'error' });
        }
      },

      /**
       * Unsubscribe from WebSocket updates
       */
      unsubscribe: () => {
        const { conversation } = get();
        
        if (conversation) {
          leaveConversation(conversation.id);
        }

        // Remove named event handlers to prevent leaks
        const socket = getSocket();
        if (socket) {
          const handlers = (socket as any).__supportHandlers;
          if (handlers) {
            socket.off('connect', handlers.onConnect);
            socket.off('disconnect', handlers.onDisconnect);
            socket.off('connect_error', handlers.onConnectError);
            socket.off('message_received', handlers.onMessageReceived);
            delete (socket as any).__supportHandlers;
          }
        }
        
        disconnectSocket();
        set({ connectionStatus: 'disconnected', isSubscribed: false });
      },

      // UI Actions
      openChat: () => {
        set({ isOpen: true });
        // Mark messages as read when opening
        get().markAsRead();
      },
      
      closeChat: () => {
        set({ isOpen: false });
      },
      
      toggleChat: () => {
        const isOpen = !get().isOpen;
        set({ isOpen });
        if (isOpen) {
          get().markAsRead();
        }
      },

      // Utility actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      reset: () => {
        get().unsubscribe();
        set(initialState);
      },
    }),
    { name: 'support-chat-store' }
  )
);
