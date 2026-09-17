import React, { useState } from 'react';
import { Bot, User, Copy, Check, ShieldAlert } from 'lucide-react';
import type { AiChatMessage } from '../../types/ai';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageItemProps {
  message: AiChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`flex items-start gap-2.5 sm:gap-3 ${
        isUser ? 'flex-row-reverse justify-start' : 'flex-row justify-start'
      } animate-fade-in group`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl shadow-2xs ${
          isUser
            ? 'bg-slate-800 text-white'
            : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-700 text-white shadow-indigo-200'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 animate-pulse" />}
      </div>

      {/* Message Bubble Container */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${
          isUser ? 'items-end text-right' : 'items-start text-left'
        }`}
      >
        {/* Author Header & Time */}
        <div
          className={`flex items-center gap-2 px-1 text-[11px] text-slate-400 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className="font-semibold text-slate-600">
            {isUser ? 'Bạn' : 'LifeSync Heartcare AI'}
          </span>
          <span>{formatTime(message.timestamp)}</span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Sao chép nội dung"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs break-words ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-xs font-medium'
              : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-line">{message.content}</div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}

          {/* Medical Disclaimer Banner */}
          {message.disclaimer && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50/70 p-2 rounded-xl">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
              <span className="leading-snug">{message.disclaimer}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
