import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { aiApi } from '../api/aiApi';
import type { AiChatMessage } from '../types/ai';

const STORAGE_KEY = 'lifesync_ai_chat_history';

const WELCOME_MESSAGE: AiChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content:
    'Xin chào! Tôi là Trợ lý Sức khỏe Tim mạch & Lối sống LifeSync AI. Tôi có thể đồng hành cùng bạn đánh giá chế độ dinh dưỡng, gợi ý thực đơn thân thiện tim mạch theo chuẩn DASH, cân bằng áp lực lịch trình và xây dựng thói quen lành mạnh. Hôm nay tôi có thể hỗ trợ gì cho bạn?',
  disclaimer:
    'Lưu ý y tế: LifeSync AI cung cấp tư vấn lối sống và phòng ngừa dinh dưỡng, không thay thế cho chẩn đoán hoặc chỉ định điều trị y khoa chuyên sâu từ bác sĩ.',
  timestamp: new Date().toISOString(),
};

export const useAiChat = () => {
  const [messages, setMessages] = useState<AiChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore JSON parse errors and fallback
    }
    return [WELCOME_MESSAGE];
  });

  const [isSending, setIsSending] = useState(false);

  // Sync to sessionStorage on state change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage quota or disabled
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      const userMsg: AiChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      // Append user message immediately
      setMessages((prev) => [...prev, userMsg]);
      setIsSending(true);

      try {
        const response = await aiApi.chat({ message: trimmed });

        if (response.success && response.data) {
          const aiReply = response.data;
          const assistantMsg: AiChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: aiReply.reply || 'Cảm ơn bạn đã chia sẻ, tôi luôn sẵn sàng hỗ trợ!',
            disclaimer: aiReply.disclaimer,
            timestamp: aiReply.timestamp || new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          throw new Error(response.message || 'Không nhận được phản hồi từ AI.');
        }
      } catch (error: any) {
        const errorText =
          error.response?.data?.message ||
          error.message ||
          'Không thể kết nối đến Trợ lý AI. Vui lòng kiểm tra lại mạng hoặc thử lại sau.';
        toast.error(errorText);

        const errorMsg: AiChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Đã xảy ra lỗi khi trao đổi với AI: ${errorText}. Vui lòng thử lại sau giây lát.`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsSending(false);
      }
    },
    [isSending]
  );

  const clearHistory = useCallback(() => {
    setMessages([
      {
        ...WELCOME_MESSAGE,
        id: `welcome-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    ]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    toast.success('Đã làm mới cuộc trò chuyện!');
  }, []);

  return {
    messages,
    isSending,
    sendMessage,
    clearHistory,
  };
};
