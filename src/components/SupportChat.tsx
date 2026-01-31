"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ChevronDown, Send, X, Loader2, Headphones } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

type Message = {
  id: string;
  sender_type: 'customer' | 'admin';
  sender_name?: string;
  content: string;
  created_at: string;
  is_read: boolean;
};

type Conversation = {
  id: string;
  status: 'open' | 'closed' | 'pending';
  messages?: Message[];
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
};

const getAuthToken = async () => {
  if (typeof window !== 'undefined') {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token || null;
    }
  }
  return null;
};

const SupportChat = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch or create conversation
  const fetchConversation = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = await getAuthToken();
      if (!token) return;

      // Get existing conversation
      const response = await fetch(`${API_BASE_URL}/conversations/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.id) {
          setConversation(data);
          setMessages(data.messages || []);
          // Check for unread messages from admin
          const unreadFromAdmin = (data.messages || []).some(
            (m: Message) => m.sender_type === 'admin' && !m.is_read
          );
          setHasUnread(unreadFromAdmin);
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  }, [isAuthenticated]);

  // Start new conversation
  const startConversation = async () => {
    if (!isAuthenticated) return null;
    
    try {
      const token = await getAuthToken();
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject: 'Hỗ trợ khách hàng' }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversation(data);
        return data;
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
    return null;
  };

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async () => {
    if (!conversation?.id || !isAuthenticated) return;
    
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/conversations/${conversation.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || data || []);
        
        // Check for unread messages from admin
        const unreadFromAdmin = (data.messages || data || []).some(
          (m: Message) => m.sender_type === 'admin' && !m.is_read
        );
        setHasUnread(unreadFromAdmin);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [conversation?.id, isAuthenticated]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversation();
    }
  }, [isAuthenticated, fetchConversation]);

  // Poll for new messages when chat is open
  useEffect(() => {
    if (isOpen && conversation?.id && isAuthenticated) {
      fetchMessages();
      
      // Poll every 10 seconds
      pollIntervalRef.current = setInterval(fetchMessages, 10000);
      
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [isOpen, conversation?.id, isAuthenticated, fetchMessages]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (isOpen && conversation?.id && hasUnread && isAuthenticated) {
      const markAsRead = async () => {
        try {
          const token = await getAuthToken();
          if (!token) return;

          await fetch(`${API_BASE_URL}/conversations/${conversation.id}/read`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
          setHasUnread(false);
        } catch (error) {
          console.error('Error marking as read:', error);
        }
      };
      markAsRead();
    }
  }, [isOpen, conversation?.id, hasUnread, isAuthenticated]);

  // Toggle chat popup
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || isSending || !isAuthenticated) return;

    let convId = conversation?.id;
    
    // Create conversation if doesn't exist
    if (!convId) {
      const newConv = await startConversation();
      if (!newConv?.id) return;
      convId = newConv.id;
    }

    setIsSending(true);

    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/conversations/${convId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: input.trim() }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        setInput("");
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Sẵn sàng hỗ trợ</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleToggle}
                className="p-2 rounded-full hover:bg-white/20 transition-all"
                title="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-grow overflow-y-auto bg-gray-50 px-3 py-4">
              {messages.length === 0 ? (
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
                <>
                  {messages.map((msg) => {
                    const isCustomer = msg.sender_type === 'customer';
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex mb-3 ${isCustomer ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex flex-col max-w-[85%] ${isCustomer ? "items-end" : "items-start"}`}>
                          {!isCustomer && (
                            <span className="text-xs text-gray-500 mb-1 font-medium">
                              {msg.sender_name || 'Nhân viên hỗ trợ'}
                            </span>
                          )}
                          <div className={`px-4 py-2 rounded-2xl ${
                            isCustomer 
                              ? 'bg-green-600 text-white rounded-br-md' 
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                          }`}>
                            <span className="text-sm whitespace-pre-wrap">{msg.content}</span>
                          </div>
                          <span className="text-xs text-gray-400 mt-1">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start mb-3">
                  <div className="flex space-x-1 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Footer */}
            <div className="flex items-center px-4 py-3 gap-2 bg-white border-t border-gray-100">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                disabled={isSending}
                className={`h-10 flex-1 px-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm ${
                  isSending ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 hover:bg-white'
                }`}
              />
              
              <button 
                className={`p-2.5 rounded-full transition-all ${
                  isSending || !input.trim()
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-white bg-green-600 hover:bg-green-700'
                }`} 
                onClick={handleSend} 
                disabled={isSending || !input.trim()}
                title="Gửi"
              >
                {isSending ? (
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
        onClick={handleToggle}
        className="fixed bottom-5 right-5 z-[9999] bg-green-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all"
      >
        {/* Unread indicator */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse" />
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
