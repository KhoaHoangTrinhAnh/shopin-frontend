"use client";

/**
 * Admin Chat Page
 * 
 * Real-time chat management panel for admin users.
 * Uses Supabase realtime for instant message updates.
 * 
 * Features:
 * - Real-time conversation list updates
 * - Real-time message updates
 * - Status management (resolve/archive)
 * - Search and filter conversations
 * - Connection status indicator
 */

import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Send,
  Circle,
  Search,
  Archive,
  CheckCircle,
  RotateCcw,
  Loader2,
  Wifi,
  WifiOff,
  Filter,
} from "lucide-react";
import { useAdminChatStore } from "@/stores/admin-chat.store";
import type { SupportConversation, SupportChatMessage } from "@/stores/types";

/**
 * Format timestamp to Vietnamese locale
 */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

/**
 * Format relative time (e.g., "5 phút trước")
 */
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatTime(timestamp);
}

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: "bg-green-100 text-green-800",
    resolved: "bg-blue-100 text-blue-800",
    archived: "bg-gray-100 text-gray-600",
  };

  const labels = {
    active: "Đang mở",
    resolved: "Đã giải quyết",
    archived: "Đã lưu trữ",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.active}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

export default function AdminChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  // Get state and actions from store
  const {
    conversations,
    selectedConversation,
    messages,
    loading,
    loadingMessages,
    sending,
    error,
    connectionStatus,
    statusFilter,
    fetchConversations,
    selectConversation,
    sendMessage,
    updateStatus,
    setStatusFilter,
    setSearchQuery,
    reset,
  } = useAdminChatStore();

  // Initialize on mount
  useEffect(() => {
    fetchConversations();

    // Cleanup on unmount
    return () => {
      useAdminChatStore.getState().unsubscribe();
    };
  }, [fetchConversations]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchQuery, setSearchQuery]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const content = newMessage.trim();
    setNewMessage("");
    
    await sendMessage(selectedConversation.id, content);
  };

  // Handle key press (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle status change
  const handleResolve = async () => {
    if (!selectedConversation) return;
    await updateStatus(selectedConversation.id, "resolved");
  };

  const handleArchive = async () => {
    if (!selectedConversation) return;
    if (confirm("Lưu trữ cuộc hội thoại này?")) {
      await updateStatus(selectedConversation.id, "archived");
      selectConversation(null);
    }
  };

  const handleReopen = async () => {
    if (!selectedConversation) return;
    await updateStatus(selectedConversation.id, "active");
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header with connection status */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Hội thoại</h2>
            {/* Connection indicator */}
            <div className="flex items-center gap-1 text-xs">
              {connectionStatus === "connected" ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">Realtime</span>
                </>
              ) : connectionStatus === "connecting" ? (
                <>
                  <Loader2 className="w-3 h-3 text-yellow-500 animate-spin" />
                  <span className="text-yellow-600">Đang kết nối...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-500">Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-1">
            {[
              { value: null, label: "Tất cả" },
              { value: "active", label: "Đang mở" },
              { value: "resolved", label: "Đã giải quyết" },
            ].map((filter) => (
              <button
                key={filter.value || "all"}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  statusFilter === filter.value
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Chưa có cuộc hội thoại nào</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedConversation?.id === conv.id ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {conv.user?.avatar_url ? (
                        <img
                          src={conv.user.avatar_url}
                          alt={conv.user.full_name || "User"}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-primary">
                          {conv.user?.full_name?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {conv.user?.full_name || "Khách hàng"}
                      </h3>
                      {conv.unread_count > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate">
                      {conv.last_message || "Chưa có tin nhắn"}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <StatusBadge status={conv.status} />
                      <span className="text-xs text-gray-400">
                        {conv.last_message_at ? formatRelativeTime(conv.last_message_at) : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {selectedConversation.user?.avatar_url ? (
                  <img
                    src={selectedConversation.user.avatar_url}
                    alt={selectedConversation.user.full_name || "User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-primary">
                    {selectedConversation.user?.full_name?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {selectedConversation.user?.full_name || "Khách hàng"}
                </h2>
                <p className="text-xs text-gray-500">
                  {selectedConversation.user?.email}
                </p>
              </div>
              
              <StatusBadge status={selectedConversation.status} />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {selectedConversation.status === "active" && (
                <button
                  onClick={handleResolve}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Đánh dấu đã giải quyết"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Giải quyết</span>
                </button>
              )}
              
              {selectedConversation.status === "resolved" && (
                <button
                  onClick={handleReopen}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  title="Mở lại hội thoại"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Mở lại</span>
                </button>
              )}
              
              <button
                onClick={handleArchive}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Lưu trữ"
              >
                <Archive className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Chưa có tin nhắn nào</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.sender_role === "admin";
                const isTemp = msg._temp;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] ${isAdmin ? "order-2" : "order-1"}`}>
                      {/* Sender name for customer messages */}
                      {!isAdmin && (
                        <p className="text-xs text-gray-500 mb-1">
                          {msg.sender?.full_name || "Khách hàng"}
                        </p>
                      )}
                      
                      {/* Message bubble */}
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isAdmin
                            ? `bg-primary text-white ${isTemp ? "opacity-70" : ""}`
                            : "bg-white text-gray-900 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      
                      {/* Timestamp */}
                      <p className={`text-xs text-gray-400 mt-1 flex items-center gap-1 ${
                        isAdmin ? "text-right justify-end" : "text-left"
                      }`}>
                        {formatTime(msg.created_at)}
                        {isTemp && <Loader2 className="w-3 h-3 animate-spin" />}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            {/* Error message */}
            {error && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            
            <div className="flex items-end gap-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                rows={2}
                maxLength={5000}
                disabled={sending || selectedConversation.status === "archived"}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim() || selectedConversation.status === "archived"}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Gửi
              </button>
            </div>
            
            {selectedConversation.status === "archived" && (
              <p className="text-xs text-gray-500 mt-2">
                Cuộc hội thoại này đã được lưu trữ. Mở lại để tiếp tục trò chuyện.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Chọn một cuộc hội thoại</p>
            <p className="text-sm mt-1">
              Chọn cuộc hội thoại từ danh sách để bắt đầu trò chuyện
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
