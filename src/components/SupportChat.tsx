"use client";

/**
 * SupportChat Component
 * 
 * Customer-facing chat widget for realtime communication with admin support.
 * Uses Supabase realtime subscriptions for instant message updates.
 * 
 * Features:
 * - Realtime message updates (no polling)
 * - Optimistic UI updates
 * - Unread message badge
 * - Auto-scroll to latest message
 * - Connection status indicator
 */

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ChevronDown, Send, X, Loader2, Headphones, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSupportChatStore } from "@/stores/support-chat.store";

/**
 * Format timestamp to Vietnamese locale time
 * Returns '-' for null/undefined/invalid dates (e.g. optimistic temp messages)
 */
function formatTime(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

const SupportChat: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  // Get state and actions from store
  const {
    conversation,
    messages,
    unreadCount,
    loading,
    sending,
    error,
    isOpen,
    connectionStatus,
    initialize,
    sendMessage,
    openChat,
    closeChat,
    toggleChat,
    reset,
  } = useSupportChatStore();

  // Initialize chat when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initialize();
    } else {
      reset();
    }

    // Cleanup on unmount
    return () => {
      useSupportChatStore.getState().unsubscribe();
    };
  }, [isAuthenticated, initialize, reset]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle send message
  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || sending) return;

    // Clear input immediately for better UX
    setInput("");
    
    await sendMessage(trimmedInput);
  };

  // Handle key press (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 12, y: 12 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 12, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-16 right-16 z-[9998] w-[320px] h-[480px] sm:w-[360px] sm:h-[520px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 origin-bottom-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-sm">Hỗ trợ khách hàng</span>
                  <div className="text-xs opacity-90 flex items-center gap-1">
                    {/* Connection status indicator */}
                    {connectionStatus === 'connected' ? (
                      <>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span>Đã kết nối</span>
                      </>
                    ) : connectionStatus === 'connecting' ? (
                      <>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        <span>Đang kết nối...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span>Sẵn sàng hỗ trợ</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={closeChat}
                className="p-2 rounded-full hover:bg-white/20 transition-all"
                title="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-grow overflow-y-auto bg-gray-50 px-3 py-4">
              {/* Error message */}
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
                  {error}
                </div>
              )}

              {/* Loading state */}
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                /* Empty state */
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Headphones className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-2">Xin chào!</h3>
                  <p className="text-sm text-gray-500">
                    Bạn cần hỗ trợ? Hãy gửi tin nhắn cho chúng tôi, đội ngũ hỗ trợ sẽ phản hồi trong thời gian sớm nhất.
                  </p>
                </div>
              ) : (
                /* Messages list */
                <>
                  {messages.map((msg) => {
                    const isCustomer = msg.sender_role === 'user';
                    const isTemp = msg._temp;

                    return (
                      <div 
                        key={msg.id} 
                        className={`flex mb-3 ${isCustomer ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex flex-col max-w-[85%] ${isCustomer ? "items-end" : "items-start"}`}>
                          {/* Admin name label */}
                          {!isCustomer && (
                            <span className="text-xs text-gray-500 mb-1 font-medium">
                              {msg.sender?.full_name || 'Nhân viên hỗ trợ'}
                            </span>
                          )}
                          
                          {/* Message bubble */}
                          <div className={`px-4 py-2 rounded-2xl ${
                            isCustomer 
                              ? `bg-green-600 text-white rounded-br-md ${isTemp ? 'opacity-70' : ''}` 
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                          }`}>
                            <span className="text-sm whitespace-pre-wrap">{msg.message}</span>
                          </div>
                          
                          {/* Timestamp */}
                          <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            {formatTime(msg.created_at)}
                            {/* Sending indicator for temp messages */}
                            {isTemp && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Footer */}
            <div className="flex items-center px-4 py-3 gap-2 bg-white border-t border-gray-100">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                disabled={sending}
                maxLength={5000}
                className={`h-10 flex-1 px-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm ${
                  sending ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 hover:bg-white'
                }`}
              />
              
              <button 
                className={`p-2.5 rounded-full transition-all ${
                  sending || !input.trim()
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-white bg-green-600 hover:bg-green-700'
                }`} 
                onClick={handleSend} 
                disabled={sending || !input.trim()}
                title="Gửi"
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Icon Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 z-[9999] bg-green-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all"
      >
        {/* Unread indicator badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 30 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="close"
              initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 30 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </>
  );
};

export default SupportChat;
