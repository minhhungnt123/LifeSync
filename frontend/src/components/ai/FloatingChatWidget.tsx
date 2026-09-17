import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Maximize2,
  RotateCcw,
  Heart,
  Loader2,
} from 'lucide-react';
import { useAiChat } from '../../hooks/useAiChat';
import { ChatMessageItem } from './ChatMessageItem';

const QUICK_PROMPTS = [
  'Đánh giá thực đơn hôm nay cho tim mạch?',
  'Gợi ý bữa phụ ít muối chuẩn DASH?',
  'Lịch làm việc có gây quá tải không?',
];

export const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isSending, sendMessage, clearHistory } = useAiChat();
  const navigate = useNavigate();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isSending]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    sendMessage(inputMessage);
    setInputMessage('');
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleExpandToFullPage = () => {
    setIsOpen(false);
    navigate('/ai-assistant');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* ── Mini Chat Popover Window ────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[360px] sm:w-[410px] h-[560px] max-h-[82vh] max-w-[calc(100vw-2.5rem)] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-fade-in origin-bottom-right">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 text-white shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs text-white shadow-inner">
                <Bot className="w-5 h-5 animate-pulse" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-700 rounded-full" />
              </div>
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1.5 tracking-tight">
                  Trợ Lý Tim Mạch AI
                  <Heart className="w-3 h-3 fill-rose-300 text-rose-300 inline" />
                </h3>
                <span className="text-[10.5px] text-indigo-100 font-medium">
                  Sẵn sàng đồng hành cùng bạn
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={clearHistory}
                disabled={isSending}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Làm mới hội thoại"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleExpandToFullPage}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Mở toàn màn hình"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Thu nhỏ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}

            {/* AI Typing / Thinking Indicator */}
            {isSending && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-2xl border border-slate-200/80 w-fit text-slate-500 text-xs shadow-2xs animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span className="font-medium text-[11.5px]">LifeSync AI đang phân tích dữ liệu...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3.5 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isSending}
                onClick={() => handlePromptClick(prompt)}
                className="shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Hỏi về dinh dưỡng, lịch trình, tim mạch..."
                disabled={isSending}
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none py-1"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all cursor-pointer shrink-0"
                title="Gửi tin nhắn"
              >
                {isSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Trigger FAB Button (Floating Action Button) ───────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-xl shadow-indigo-300/50 hover:shadow-indigo-400/60 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          title="Trò chuyện với Trợ lý Tim mạch AI"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-tight pr-1 hidden sm:inline">
            Hỏi Trợ Lý AI
          </span>
          <Sparkles className="w-4 h-4 text-amber-300" />
        </button>
      )}
    </div>
  );
};
