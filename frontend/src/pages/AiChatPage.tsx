import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bot,
  Send,
  Sparkles,
  Heart,
  RotateCcw,
  ShieldAlert,
  Loader2,
  Utensils,
  Calendar,
  Moon,
  Lightbulb,
} from 'lucide-react';
import { useAiChat } from '../hooks/useAiChat';
import { ChatMessageItem } from '../components/ai/ChatMessageItem';
import { TypingThinkingIndicator } from '../components/ai/TypingThinkingIndicator';
import { aiApi } from '../api/aiApi';

const DEFAULT_CHIPS = [
  { id: '1', title: 'Đánh giá bữa ăn', prompt: 'Đánh giá dinh dưỡng và lượng muối của thực đơn hôm nay cho tim mạch của tôi.' },
  { id: '2', title: 'Gợi ý bữa phụ ít muối', prompt: 'Gợi ý cho tôi 3 món ăn nhẹ/bữa phụ lành mạnh, ít natri theo chuẩn DASH.' },
  { id: '3', title: 'Kiểm tra quá tải lịch trình', prompt: 'Lịch trình làm việc tuần này của tôi có gây căng thẳng hay quá tải cho tim mạch không?' },
  { id: '4', title: 'Cải thiện giấc ngủ', prompt: 'Nêu các thói quen buổi tối giúp hạ nhịp tim và cải thiện chất lượng giấc ngủ sâu.' },
];

export const AiChatPage: React.FC = () => {
  const { messages, isSending, sendMessage, clearHistory } = useAiChat();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch suggested prompts from backend
  const { data: suggestionsResponse } = useQuery({
    queryKey: ['aiSuggestedPrompts'],
    queryFn: () => aiApi.getSuggestedPrompts(),
    staleTime: 1000 * 60 * 10, // 10 mins cache
  });

  const promptChips = suggestionsResponse?.data && suggestionsResponse.data.length > 0
    ? suggestionsResponse.data
    : DEFAULT_CHIPS;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    sendMessage(inputMessage);
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 animate-fade-in overflow-hidden">
      {/* ── Left Sidebar Info Panel (Hidden on Mobile, Visible on LG) ── */}
      <aside className="hidden lg:flex w-80 shrink-0 flex-col justify-between bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs overflow-y-auto">
        <div className="space-y-6">
          {/* Assistant Identity Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-white border border-indigo-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-200">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  LifeSync Companion
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Đang hoạt động (Online)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trợ lý chuyên sâu về <strong>lối sống và phòng ngừa tim mạch</strong>, tự động tổng hợp dữ liệu bữa ăn và lịch trình cá nhân của bạn.
            </p>
          </div>

          {/* Pillars of Guidance */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Trọng tâm tư vấn
            </h3>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Dinh dưỡng chuẩn DASH</h4>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  Kiểm soát natri, giảm dầu mỡ bão hòa, bổ sung kali và chất xơ.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Cân bằng lịch làm việc</h4>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  Phát hiện nguy cơ quá tải thời gian, gợi ý quãng nghỉ chủ động.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Phục hồi & Nhịp tim</h4>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  Hạ nhịp tim trước giờ ngủ, duy trì năng lượng bền bỉ.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action button: Clear conversation */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={clearHistory}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm mới cuộc trò chuyện</span>
          </button>
        </div>
      </aside>

      {/* ── Main Chat Area ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/50 via-white to-purple-50/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 tracking-tight">
                Trợ Lý Sức Khỏe Tim Mạch & Lối Sống
              </h1>
              <p className="text-xs text-slate-500">
                Tích hợp AI Context từ hồ sơ, nhật ký bữa ăn và lịch trình cá nhân của bạn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearHistory}
              disabled={isSending}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Làm mới"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}

          {/* AI Thinking Animation */}
          {isSending && <TypingThinkingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 mb-1 text-[11px] font-bold text-slate-500">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Gợi ý câu hỏi nhanh:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {promptChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                disabled={isSending}
                onClick={() => handleChipClick(chip.prompt)}
                className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
              >
                {chip.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-6 pt-2 bg-white">
          <form
            onSubmit={handleSend}
            className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-3xl p-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all shadow-inner"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi cho Trợ lý AI (ví dụ: 'Hôm nay tôi nạp bao nhiêu calo rồi?'). Nhấn Enter để gửi..."
              disabled={isSending}
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none resize-none py-1.5 px-2 max-h-32"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md shadow-indigo-200 disabled:opacity-40 disabled:hover:from-indigo-600 disabled:shadow-none transition-all cursor-pointer shrink-0"
              title="Gửi tin nhắn"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-400" />
            <span>Trợ lý AI hỗ trợ tư vấn lối sống và dinh dưỡng phòng ngừa, không thay thế chẩn đoán y khoa.</span>
          </p>
        </div>
      </main>
    </div>
  );
};
