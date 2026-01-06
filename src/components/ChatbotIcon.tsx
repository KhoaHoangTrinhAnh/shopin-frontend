// D:\shopin-frontend\src\components\ChatbotIcon.tsx
"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ChevronDown, Send, Mic, MicOff, RefreshCw, X, Volume2, VolumeX } from "lucide-react";

// Types
type Message = {
  id: string;
  from: 'user' | 'bot';
  name: string;
  avatar: string;
  time: string;
  message: string;
};

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatbotIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      from: "bot",
      name: "AI Assistant",
      avatar: "🤖",
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      message: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isVoiceModeEnabled, setIsVoiceModeEnabled] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle chat popup
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Voice recording timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Auto-stop after 10 seconds
      const autoStopTimeout = setTimeout(() => {
        if (isRecording && recognitionRef.current) {
          recognitionRef.current.stop();
          setIsRecording(false);
        }
      }, 10000);
      
      return () => {
        clearTimeout(autoStopTimeout);
      };
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setRecordingTime(0);
    }
  }, [isRecording]);

  // Send message
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      from: "user",
      name: "Bạn",
      avatar: "👤",
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      message: text,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");

    try {
      // Simulate API call (replace with your actual API)
      setTimeout(() => {
        const botResponse: Message = {
          id: crypto.randomUUID(),
          from: "bot",
          name: "AI Assistant",
          avatar: "🤖",
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          message: `Cảm ơn bạn đã hỏi: "${text}". Đây là câu trả lời mẫu từ AI Assistant.`,
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);

        // Text-to-speech if enabled
        if (isVoiceModeEnabled && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(botResponse.message);
          utterance.lang = 'vi-VN';
          speechSynthesis.speak(utterance);
        }
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  }, [isLoading, isVoiceModeEnabled]);

  // Voice recording
  const startRecording = useCallback(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Trình duyệt không hỗ trợ nhận diện giọng nói");
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'vi-VN';

      let finalTranscript = '';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setInput(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        finalTranscript = '';
      };

      recognitionRef.current.start();
      setIsRecording(true);
      setInput('');
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleVoiceToggle = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, stopRecording, startRecording]);

  // Reload chat
  const handleReload = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        from: "bot",
        name: "AI Assistant",
        avatar: "🤖",
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        message: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
      },
    ]);
  };

  // Voice mode toggle
  const handleVoiceModeToggle = () => {
    const newVoiceMode = !isVoiceModeEnabled;
    setIsVoiceModeEnabled(newVoiceMode);
    
    if (!newVoiceMode && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };

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
            className="fixed bottom-16 right-16 z-[9998] w-[320px] h-[520px] sm:w-[360px] sm:h-[560px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 origin-bottom-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 mb-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                  <span className="text-lg">🤖</span>
                </div>
                <div>
                  <span className="font-semibold text-sm">AI Shopping Assistant</span>
                  <div className="text-xs opacity-90 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {isRecording ? (
                      <div className="flex items-center gap-1 text-red-200">
                        <div className="w-1.5 h-1.5 bg-red-300 rounded-full animate-ping"></div>
                        <span>Đang ghi âm... ({recordingTime}s)</span>
                      </div>
                    ) : (
                      <span>Trực tuyến</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-1">
                <button 
                  onClick={handleVoiceModeToggle}
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                    isVoiceModeEnabled 
                      ? 'bg-green-500/30 hover:bg-green-500/40 text-green-100' 
                      : 'hover:bg-white/20'
                  }`}
                  title={isVoiceModeEnabled ? "Tắt chế độ voice" : "Bật chế độ voice"}
                >
                  {isVoiceModeEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>

                <button 
                  onClick={handleReload}
                  className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110"
                  title="Làm mới"
                >
                  <RefreshCw size={16} />
                </button>
                
                <button 
                  onClick={handleToggle}
                  className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110"
                  title="Đóng"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-grow overflow-y-auto bg-gray-50 px-2">
              {messages.map((msg) => {
                const isUser = msg.from === "user";
                return (
                  <div key={msg.id} className={`flex items-end mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
                    {/* Bot Avatar */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full mr-2 flex-shrink-0 bg-green-100 flex items-center justify-center">
                        <span className="text-sm">{msg.avatar}</span>
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                      {!isUser && (
                        <div className="text-sm font-semibold mb-1 text-gray-700">{msg.name}</div>
                      )}
                      <div className={`px-4 py-2 rounded-2xl max-w-[280px] ${
                        isUser 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        <span style={{ whiteSpace: 'pre-line' }}>{msg.message}</span>
                      </div>
                    </div>

                    {/* Time */}
                    <div className={`text-xs text-gray-500 ${isUser ? "order-first mr-2" : "order-last ml-2"}`}>
                      {msg.time}
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <div className="w-8 h-8 rounded-full ml-2 flex-shrink-0 bg-blue-100 flex items-center justify-center">
                        <span className="text-sm">{msg.avatar}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-end mb-4">
                  <div className="w-8 h-8 rounded-full mr-2 flex-shrink-0 bg-green-100 flex items-center justify-center">
                    <span className="text-sm">🤖</span>
                  </div>
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
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder={
                  isLoading 
                    ? "Đang xử lý..." 
                    : isRecording 
                      ? "Đang ghi âm..." 
                      : "Nhập tin nhắn hoặc nhấn nút mic..."
                }
                disabled={isLoading}
                className={`h-10 flex-1 px-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                  isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 hover:bg-white'
                }`}
              />
              
              {/* Voice Button */}
              <button 
                className={`p-2.5 rounded-full transition-all duration-200 relative ${
                  isRecording 
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg animate-pulse' 
                    : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                onClick={handleVoiceToggle}
                disabled={isLoading}
                title={isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
              >
                {isRecording ? (
                  <div className="relative">
                    <MicOff size={18} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                  </div>
                ) : (
                  <Mic size={18} />
                )}
              </button>
              
              {/* Send Button */}
              <button 
                className={`p-2.5 rounded-full transition-all duration-200 ${
                  isLoading
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                }`} 
                onClick={() => handleSend(input)} 
                disabled={isLoading}
                title="Gửi"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Icon Button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-5 right-5 z-[9999] bg-green-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all"
      >
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

export default ChatbotIcon;
