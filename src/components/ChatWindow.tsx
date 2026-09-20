import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  Copy, 
  Check, 
  Bot, 
  User, 
  FileText, 
  Loader2, 
  Square,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isGenerating: boolean;
  onStopGeneration?: () => void;
  hasDocuments: boolean;
}

// Clean Formatted Message Content Component
const FormattedMessageText: React.FC<{ content: string }> = ({ content }) => {
  // Clean raw LaTeX delimiters into readable math symbols
  const cleanContent = content
    .replace(/\\\$/g, '$')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\oint/g, '∮')
    .replace(/\\cdot/g, '·')
    .replace(/\\varepsilon_0/g, 'ε₀')
    .replace(/\\pi/g, 'π')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\nabla/g, '∇')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\ge/g, '≥')
    .replace(/\\le/g, '≤')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\$\$/g, '')
    .replace(/\$/g, '');

  // Split into blocks (code blocks, headings, lists, paragraphs)
  const blocks = cleanContent.split(/```/);

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {blocks.map((block, bIdx) => {
        // Code / Formula block
        if (bIdx % 2 === 1) {
          return (
            <div key={bIdx} className="my-2.5 p-3 rounded-lg bg-zinc-950 border border-indigo-900/60 font-mono text-xs text-indigo-300 shadow-inner overflow-x-auto">
              <pre className="whitespace-pre-wrap">{block.trim()}</pre>
            </div>
          );
        }

        // Standard text lines parsing
        const lines = block.split('\n');
        return (
          <div key={bIdx} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Heading (###)
              if (trimmed.startsWith('###')) {
                return (
                  <h3 key={lIdx} className="text-base font-bold text-white tracking-tight pt-2 pb-1 border-b border-zinc-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>{trimmed.replace(/^###\s*/, '')}</span>
                  </h3>
                );
              }

              // Heading (## or #)
              if (trimmed.startsWith('#')) {
                return (
                  <h4 key={lIdx} className="text-sm font-bold text-indigo-300 pt-1">
                    {trimmed.replace(/^#+\s*/, '')}
                  </h4>
                );
              }

              // Bullet item (- or *)
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const text = trimmed.replace(/^[-*]\s*/, '');
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2 text-zinc-300">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{renderInlineFormatting(text)}</span>
                  </div>
                );
              }

              // Numbered list (1. 2.)
              if (/^\d+\.\s/.test(trimmed)) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2 text-zinc-300">
                    <span className="text-indigo-400 font-semibold font-mono">{trimmed.match(/^\d+\./)?.[0]}</span>
                    <span>{renderInlineFormatting(trimmed.replace(/^\d+\.\s*/, ''))}</span>
                  </div>
                );
              }

              // Normal paragraph line
              return (
                <p key={lIdx} className="text-zinc-200 leading-normal">
                  {renderInlineFormatting(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Helper for inline **bold** formatting
function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isGenerating,
  onStopGeneration,
  hasDocuments,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSend = () => {
    if (!input.trim() || isGenerating || !hasDocuments) return;
    onSendMessage(input.trim());
    setInput('');
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-zinc-950">
      {/* Top Bar / Actions */}
      <div className="h-12 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur select-none">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>Ask My Notes Workspace</span>
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-400 font-mono text-[11px]">QVAC RAG Search active</span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Clear conversation transcript"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
            <span>Clear Conversation</span>
          </button>
        )}
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 select-none text-zinc-500">
            <Sparkles className="w-8 h-8 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-400">Ask any question about your study notes</p>
            <p className="text-xs text-zinc-500 max-w-sm">
              QVAC RAG will search your local indexed documents and generate answers directly on your device.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-4 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-semibold text-xs shadow-md ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 shadow-indigo-600/20'
                    : 'bg-zinc-800 border border-zinc-700 text-indigo-400'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-2 max-w-[85%]">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <FormattedMessageText content={msg.content} />
                  )}

                  {/* Copy Button for Assistant responses */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2.5 mt-3 text-xs">
                      <span className="text-[11px] text-zinc-400 font-mono">QVAC Local Model</span>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800/60 hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Sources Display */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-400 text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 rounded bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 font-medium text-[11px] flex items-center gap-1.5"
                        >
                          <span>📄 {src.docName}</span>
                          {src.page && <span className="text-zinc-500">• p.{src.page}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isGenerating && (
          <div className="flex items-start gap-4 max-w-3xl">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-indigo-400">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>QVAC local model generating answer...</span>
              {onStopGeneration && (
                <button
                  onClick={onStopGeneration}
                  className="ml-auto text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 cursor-pointer"
                >
                  <Square className="w-3 h-3 text-red-400" />
                  Stop
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="relative flex items-center bg-zinc-900 rounded-xl border border-zinc-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-xl">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              disabled={isGenerating || !hasDocuments}
              placeholder={
                hasDocuments
                  ? 'Ask something about your notes...'
                  : 'Please upload a document to begin asking questions...'
              }
              rows={1}
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 px-4 py-3.5 focus:outline-none resize-none max-h-40 min-h-[48px]"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating || !hasDocuments}
              className="m-1.5 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-600/20"
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 select-none">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">Shift+Enter</kbd> for line break</span>
            <span>🔒 Local QVAC Inference</span>
          </div>
        </div>
      </div>
    </div>
  );
};
