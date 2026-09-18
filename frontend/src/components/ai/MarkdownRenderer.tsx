import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Flame, ShieldAlert, Heart, Activity } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

// Regex patterns to capture health metrics
const HEALTH_METRIC_REGEX =
  /(\b\d+(?:[.,]\d+)?\s*(?:kcal|calories?|calo)\b)|(\b\d+(?:[.,]\d+)?\s*(?:mg|g)\s*(?:natri|sodium|muối)\b)|(\b\d{2,3}\/\d{2,3}\s*mmHg\b)|(\b\d{2,3}\s*bpm\b)/gi;

/**
 * Highlights recognizable health and nutritional metrics into rich badge chips.
 */
const renderHighlightedText = (text: string): React.ReactNode => {
  if (!text || typeof text !== 'string') return text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  HEALTH_METRIC_REGEX.lastIndex = 0;

  while ((match = HEALTH_METRIC_REGEX.exec(text)) !== null) {
    const matchIndex = match.index;
    const matchText = match[0];

    // Push preceding text
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    // Determine metric type and render badge
    const lower = matchText.toLowerCase();
    if (lower.includes('kcal') || lower.includes('calo')) {
      parts.push(
        <span
          key={`${matchIndex}-cal`}
          className="inline-flex items-center gap-1 px-1.5 py-0.2 mx-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] align-baseline whitespace-nowrap shadow-2xs"
          title="Năng lượng Calorie"
        >
          <Flame className="w-3 h-3 text-amber-600 inline shrink-0" />
          {matchText}
        </span>
      );
    } else if (lower.includes('natri') || lower.includes('sodium') || lower.includes('muối')) {
      parts.push(
        <span
          key={`${matchIndex}-sod`}
          className="inline-flex items-center gap-1 px-1.5 py-0.2 mx-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-200 font-bold text-[11px] align-baseline whitespace-nowrap shadow-2xs"
          title="Hàm lượng Natri (Muối) theo chuẩn DASH"
        >
          <ShieldAlert className="w-3 h-3 text-rose-600 inline shrink-0" />
          {matchText}
        </span>
      );
    } else if (lower.includes('mmhg')) {
      parts.push(
        <span
          key={`${matchIndex}-bp`}
          className="inline-flex items-center gap-1 px-1.5 py-0.2 mx-0.5 rounded-md bg-pink-100 text-pink-900 border border-pink-200 font-bold text-[11px] align-baseline whitespace-nowrap shadow-2xs"
          title="Chỉ số Huyết áp"
        >
          <Heart className="w-3 h-3 text-pink-600 inline shrink-0 fill-current" />
          {matchText}
        </span>
      );
    } else if (lower.includes('bpm')) {
      parts.push(
        <span
          key={`${matchIndex}-hr`}
          className="inline-flex items-center gap-1 px-1.5 py-0.2 mx-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200 font-bold text-[11px] align-baseline whitespace-nowrap shadow-2xs"
          title="Nhịp tim"
        >
          <Activity className="w-3 h-3 text-blue-600 inline shrink-0" />
          {matchText}
        </span>
      );
    } else {
      parts.push(matchText);
    }

    lastIndex = matchIndex + matchText.length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose-clean space-y-1.5 text-xs sm:text-sm leading-relaxed text-slate-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mt-3 mb-1.5 pb-1 border-b border-slate-100 tracking-tight">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 mt-2.5 mb-1 tracking-tight">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-xs font-bold text-indigo-950 mt-2 mb-1">
              {children}
            </h4>
          ),

          // Paragraphs with metric highlighting
          p: ({ children }) => {
            return (
              <p className="mb-2 last:mb-0 leading-relaxed text-slate-800">
                {React.Children.map(children, (child) =>
                  typeof child === 'string' ? renderHighlightedText(child) : child
                )}
              </p>
            );
          },

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-4 space-y-1 my-2 text-slate-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-4 space-y-1 my-2 text-slate-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5">
              {React.Children.map(children, (child) =>
                typeof child === 'string' ? renderHighlightedText(child) : child
              )}
            </li>
          ),

          // Emphasis
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-slate-700">{children}</em>,

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-indigo-500 bg-indigo-50/70 px-3 py-2 rounded-r-xl my-2.5 text-xs text-indigo-950 font-medium shadow-2xs">
              {children}
            </blockquote>
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-2xl border border-slate-200 shadow-2xs">
              <table className="w-full text-xs text-left border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-100/90 text-slate-800">{children}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2 font-bold border-b border-slate-200">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-1.5 border-b border-slate-100 text-slate-700">{children}</td>
          ),

          // Code
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-indigo-600 font-mono text-[11px] border border-slate-200/60">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
