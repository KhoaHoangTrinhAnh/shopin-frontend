/**
 * Admin Chat Store
 * 
 * Manages admin-side chat state with WebSocket realtime communication.
 * Admin can view all customer conversations and respond to messages.
 * 
 * Features:
 * - Realtime updates for new conversations and messages via Socket.IO
 * - Conversation list with filtering and pagination
 * - Status management (active/resolved/archived)
 * - Unread count tracking
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/auth';
import type { 
  AdminChatState, 
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

// Track current selection request to avoid race conditions
let _selectToken = 0;

// Initial state
const initialState = {
  conversations: [] as SupportConversation[],
  selectedConversation: null as SupportConversation | null,
  messages: [] as SupportChatMessage[],
  unreadCount: 0,
  loading: false,
  loadingMessages: false,
  sending: false,
  error: null as string | null,
  connectionStatus: 'disconnected' as ConnectionStatus,
  page: 1,
  totalPages: 1,
  statusFilter: null as string | null,
  searchQuery: '',
  isSubscribed: false,
};

/**
 * Admin Chat Store
 */
export const useAdminChatStore = create<AdminChatState>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      /**
       * Fetch conversations with pagination and filters
       */
      fetchConversations: async (page = 1) => {
        const headers = await getAuthHeader();
        if (!headers) return;

        set({ loading: true, error: null });

        try {
          const { statusFilter, searchQuery } = get();
          
          // Build query params
          const params = new URLSearchParams({
            page: page.toString(),
            limit: '20',
          });
          
          if (statusFilter) {
            params.append('status', statusFilter);
          }
          if (searchQuery) {
            params.append('search', searchQuery);
          }

          const response = await fetch(
            `${API_BASE_URL}/admin/chat/conversations?${params.toString()}`,
            { headers }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch conversations');
          }

          const data = await response.json();

          set({
            conversations: data.data || [],
            page: data.meta?.page || 1,
            totalPages: data.meta?.totalPages || 1,
            loading: false,
          });

          // Subscribe to realtime updates after fetching (only once)
          if (!get().isSubscribed) {
            get().subscribe();
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch conversations',
            loading: false,
          });
        }
      },

      /**
       * Select a conversation and load its messages
       */
      selectConversation: async (conversation) => {
        const { selectedConversation } = get();
        
        // Leave previous conversation room if any
        if (selectedConversation) {
          leaveConversation(selectedConversation.id);
        }
        
        if (!conversation) {
          set({ selectedConversation: null, messages: [] });
          return;
        }

        // Record a token to detect stale async responses
        const token = ++_selectToken;

        set({ selectedConversation: conversation });
        
        // Join conversation room via WebSocket
        joinConversation(conversation.id);
        
        // Fetch messages for selected conversation
        await get().fetchMessages(conversation.id, token);
        
        // Only mark as read if this selection is still current
        if (_selectToken === token) {
          await get().markAsRead(conversation.id);
        }
      },

      /**
       * Fetch messages for a conversation
       */
      fetchMessages: async (conversationId, _token?: number) => {
        const headers = await getAuthHeader();
        if (!headers) return;

        set({ loadingMessages: true });

        try {
          const response = await fetch(
            `${API_BASE_URL}/admin/chat/conversations/${conversationId}/messages?limit=100`,
            { headers }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch messages');
          }

          const data = await response.json();

          // Discard stale response if selection changed
          if (_token !== undefined && _token !== _selectToken) return;

          set({
            messages: data.data || [],
            loadingMessages: false,
          });
        } catch (error) {
          console.error('Error fetching messages:', error);
          set({ loadingMessages: false });
        }
      },

      /**
       * Send message as admin
       */
      sendMessage: async (conversationId, content) => {
        const trimmedContent = content.trim();
        if (!trimmedContent || get().sending) return null;

        if (trimmedContent.length > 5000) {
          set({ error: 'Message too long (max 5000 characters)' });
          return null;
        }

        const headers = await getAuthHeader();
        if (!headers) {
          set({ error: 'Not authenticated' });
          return null;
        }

        const tempId = generateTempId();

        // Create optimistic message
        const optimisticMessage: SupportChatMessage = {
          id: tempId,
          conversation_id: conversationId,
          sender_id: '',
          sender_role: 'admin',
          message: trimmedContent,
          is_read: false,
          created_at: new Date().toISOString(),
          _temp: true,
          _tempId: tempId,
        };

        // Add optimistic message
        set((state) => ({
          messages: [...state.messages, optimisticMessage],
          sending: true,
          error: null,
        }));

        try {
          const response = await fetch(`${API_BASE_URL}/admin/chat/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              conversation_id: conversationId,
              message: trimmedContent,
            }),
          });

          if (!response.ok) {
            let errorMsg = 'Failed to send message';
            try {
              const errorData = await response.json();
              errorMsg = errorData.message || errorMsg;
            } catch {
              try {
                const text = await response.text();
                errorMsg = `${response.status} ${response.statusText}${text ? ': ' + text.substring(0, 200) : ''}`;
              } catch {}
            }
            throw new Error(errorMsg);
          }

          const sentMessage = await response.json();

          // Replace optimistic message with real one
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg._tempId === tempId ? { ...sentMessage, _temp: false } : msg
            ),
            sending: false,
            // Update conversation in list
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? { ...conv, last_message: trimmedContent, last_message_at: new Date().toISOString() }
                : conv
            ),
          }));

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
       * Mark messages as read
       */
      markAsRead: async (conversationId) => {
        const headers = await getAuthHeader();
        if (!headers) return;

        try {
          await fetch(`${API_BASE_URL}/admin/chat/conversations/${conversationId}/mark-read`, {
            method: 'PUT',
            headers,
          });

          // Update local state
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
            ),
            // Recalculate total unread
            unreadCount: state.conversations.reduce(
              (sum, conv) => sum + (conv.id === conversationId ? 0 : conv.unread_count),
              0
            ),
          }));
        } catch (error) {
          console.error('Error marking as read:', error);
        }
      },

      /**
       * Update conversation status
       */
      updateStatus: async (conversationId, status) => {
        const headers = await getAuthHeader();
        if (!headers) return;

        try {
          const response = await fetch(
            `${API_BASE_URL}/admin/chat/conversations/${conversationId}/status`,
            {
              method: 'PUT',
              headers,
              body: JSON.stringify({ status }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to update status');
          }

          const updatedConversation = await response.json();

          // Update local state
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, status } : conv
            ),
            selectedConversation:
              state.selectedConversation?.id === conversationId
                ? { ...state.selectedConversation, status }
                : state.selectedConversation,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update status' });
        }
      },

      /**
       * Subscribe to WebSocket realtime updates
       */
      subscribe: async () => {
        // Guard against duplicate subscriptions
        if (get().isSubscribed) return;

        // Get admin user ID from auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          set({ connectionStatus: 'error' });
          return;
        }

        set({ connectionStatus: 'connecting' });

        try {
          // Connect to WebSocket as admin
          const socket = connectSocket({
            userId: session.user.id,
            userRole: 'admin',
          });

          // Named handlers for later cleanup
          const onConnect = () => {
            set({ connectionStatus: 'connected' });
            console.log('✅ Admin WebSocket connected');
          };
          const onDisconnect = () => set({ connectionStatus: 'disconnected', isSubscribed: false });
          const onConnectError = () => set({ connectionStatus: 'error', isSubscribed: false });

          socket.on('connect', onConnect);
          socket.on('disconnect', onDisconnect);
          socket.on('connect_error', onConnectError);

          socket.on('message_received', (data: {
            message: SupportChatMessage;
            conversationId: string;
          }) => {
            const { selectedConversation, messages } = get();

            // If message is for currently selected conversation, add it
            if (selectedConversation?.id === data.conversationId) {
              // Dedup: match by id or _tempId (not by content to avoid false matches)
              const exists = messages.some(
                (msg) => msg.id === data.message.id ||
                (msg._tempId != null && msg._tempId === data.message._tempId)
              );

              if (!exists) {
                set((state) => ({
                  messages: [...state.messages, data.message],
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
            }

            // Update unread count if message is from user
            if (data.message.sender_role === 'user') {
              set((state) => ({
                unreadCount: state.unreadCount + 1,
                // Update conversation's unread count in list
                conversations: state.conversations.map((conv) =>
                  conv.id === data.conversationId
                    ? { ...conv, unread_count: (conv.unread_count || 0) + 1 }
                    : conv
                ),
              }));
            }
          });

          // Listen for new conversations
          socket.on('new_conversation', (data: {
            conversation: SupportConversation;
          }) => {
            set((state) => ({
              conversations: [data.conversation, ...state.conversations],
            }));
          });

          // Listen for conversation updates
          socket.on('conversation_updated', (data: {
            conversation: SupportConversation;
          }) => {
            set((state) => {
              const updated = state.conversations.map((conv) =>
                conv.id === data.conversation.id ? { ...conv, ...data.conversation } : conv
              );
              // Re-sort by last_message_at
              updated.sort((a, b) => {
                const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                return bTime - aTime;
              });
              return {
                conversations: updated,
                selectedConversation:
                  state.selectedConversation?.id === data.conversation.id
                    ? { ...state.selectedConversation, ...data.conversation }
                    : state.selectedConversation,
              };
            });
          });

          // Listen for typing indicators
          socket.on('user_typing', (data: {
            userId: string;
            userRole: string;
            isTyping: boolean;
          }) => {
            // Show typing indicator for customer typing
            if (data.userRole === 'user') {
              console.log('Customer typing:', data.isTyping);
              // You can add typing indicator state here if needed
            }
          });

          // Listen for read receipts
          socket.on('messages_marked_read', (data: {
            userId: string;
            conversationId: string;
          }) => {
            // Customer read messages
            console.log('Customer read messages:', data.conversationId);
          });

          // Store handler refs for cleanup
          (socket as any).__adminHandlers = { onConnect, onDisconnect, onConnectError };

          set({ isSubscribed: true });

        } catch (error) {
          console.error('WebSocket subscription error:', error);
          set({ connectionStatus: 'error' });
        }
      },

      /**
       * Unsubscribe from WebSocket updates
       */
      unsubscribe: () => {
        const { selectedConversation } = get();
        
        if (selectedConversation) {
          leaveConversation(selectedConversation.id);
        }

        // Remove named event handlers to prevent leaks
        const socket = getSocket();
        if (socket) {
          const handlers = (socket as any).__adminHandlers;
          if (handlers) {
            socket.off('connect', handlers.onConnect);
            socket.off('disconnect', handlers.onDisconnect);
            socket.off('connect_error', handlers.onConnectError);
            delete (socket as any).__adminHandlers;
          }
          socket.off('message_received');
          socket.off('new_conversation');
          socket.off('conversation_updated');
          socket.off('user_typing');
          socket.off('messages_marked_read');
        }
        
        disconnectSocket();
        set({ connectionStatus: 'disconnected', isSubscribed: false });
      },

      // Filter actions
      setStatusFilter: (status) => {
        set({ statusFilter: status });
        get().fetchConversations(1);
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
        // Debounce search - in real app would use lodash debounce
        get().fetchConversations(1);
      },

      // Utility actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      reset: () => {
        get().unsubscribe();
        set(initialState);
      },
    }),
    { name: 'admin-chat-store' }
  )
);
