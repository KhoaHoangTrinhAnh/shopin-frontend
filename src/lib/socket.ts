import { io, Socket } from 'socket.io-client';

// Singleton socket instance
let socket: Socket | null = null;

export interface SocketConfig {
  userId: string;
  userRole: 'user' | 'admin';
}

/**
 * Initialize and connect to WebSocket server
 */
export function connectSocket(config: SocketConfig): Socket {
  if (socket?.connected) {
    return socket;
  }

  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  // Resolve server URL from env or fallback to same origin
  const serverBase =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_BASE?.replace('/api', '') ||
    (typeof window !== 'undefined' ? window.location.origin.replace('3001', '3000') : 'http://localhost:3000');

  // Create new socket connection
  socket = io(`${serverBase}/chat`, {
    query: {
      userId: config.userId,
      userRole: config.userRole,
    },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Connection event listeners
  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error);
  });

  return socket;
}

/**
 * Get current socket instance (must call connectSocket first)
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect and cleanup socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 WebSocket disconnected');
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Join a conversation room
 */
export function joinConversation(conversationId: string): void {
  if (!socket?.connected) {
    console.warn('⚠️ Socket not connected, cannot join conversation');
    return;
  }
  
  socket.emit('join_conversation', { conversationId });
  console.log('🔵 Joined conversation:', conversationId);
}

/**
 * Leave a conversation room
 */
export function leaveConversation(conversationId: string): void {
  if (!socket?.connected) {
    return;
  }
  
  socket.emit('leave_conversation', { conversationId });
  console.log('🔴 Left conversation:', conversationId);
}

/**
 * Send typing indicator
 */
export function sendTypingStatus(conversationId: string, isTyping: boolean): void {
  if (!socket?.connected) {
    return;
  }
  
  socket.emit('typing', { conversationId, isTyping });
}

/**
 * Mark messages as read
 */
export function markMessagesRead(conversationId: string): void {
  if (!socket?.connected) {
    return;
  }
  
  socket.emit('messages_read', { conversationId });
}
