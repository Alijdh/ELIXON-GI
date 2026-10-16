import React, { useState } from 'react';
import { Copy, Check, Volume2, VolumeX, Play } from 'lucide-react';
import { CodeTesterModal } from './CodeTesterModal';

interface FormattedContentProps {
  content: string;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [testerData, setTesterData] = useState<{
    isOpen: boolean;
    code: string;
    language: string;
  }>({
    isOpen: false,
    code: '',
    language: '',
  });

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const cleanText = content.replace(/```[\s\S]*?```/g, '').replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Auto-detect arabic language if arabic characters are present
    const hasArabic = /[\u0600-\u06FF]/.test(cleanText);
    utterance.lang = hasArabic ? 'ar-SA' : 'en-US';
    utterance.rate = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // Parse code blocks vs regular paragraphs
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="relative text-sm md:text-base leading-relaxed space-y-3">
      {/* Code Tester Modal */}
      <CodeTesterModal
        isOpen={testerData.isOpen}
        onClose={() => setTesterData({ ...testerData, isOpen: false })}
        code={testerData.code}
        language={testerData.language}
      />

      {/* Voice Readout Button */}
      <div className="flex justify-end mb-1">
        <button
          onClick={toggleSpeech}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-all ${
            isPlaying
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title={isPlaying ? 'إيقاف القراءة الصوتية' : 'قراءة الإجابة صوتياً'}
        >
          {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'إيقاف' : 'استماع'}</span>
        </button>
      </div>

      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const hasLang = firstLine && !firstLine.includes(' ') && firstLine.length < 15;
          const language = hasLang ? firstLine : 'python';
          const codeBody = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div key={index} className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950/80 shadow-md">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <span className="uppercase tracking-wider font-semibold text-cyan-400">{language}</span>
                
                <div className="flex items-center gap-2">
                  {/* Live Run & Test Code Button */}
                  <button
                    onClick={() => setTesterData({ isOpen: true, code: codeBody, language })}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 transition-all text-xs"
                    title="تشغيل واختبار الكود ومشاهدة المحاكاة الحية"
                  >
                    <Play className="w-3 h-3 fill-emerald-300" />
                    <span>تشغيل واختبار الكود</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() => copyCode(codeBody, index)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الكود</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="p-3.5 overflow-x-auto text-xs md:text-sm font-mono text-cyan-100 bg-slate-950/70" dir="ltr">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Normal formatted markdown-style text
        const paragraphs = part.split('\n\n');
        return (
          <React.Fragment key={index}>
            {paragraphs.map((p, pIdx) => {
              if (!p.trim()) return null;

              // Check for headers
              if (p.startsWith('### ')) {
                return (
                  <h3 key={pIdx} className="text-base md:text-lg font-bold text-emerald-300 mt-4 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-emerald-400 rounded-full inline-block"></span>
                    {p.replace('### ', '')}
                  </h3>
                );
              }
              if (p.startsWith('## ')) {
                return (
                  <h2 key={pIdx} className="text-lg md:text-xl font-bold text-cyan-300 mt-5 mb-2.5 pb-1 border-b border-slate-700/50">
                    {p.replace('## ', '')}
                  </h2>
                );
              }
              if (p.startsWith('# ')) {
                return (
                  <h1 key={pIdx} className="text-xl md:text-2xl font-black text-white mt-6 mb-3">
                    {p.replace('# ', '')}
                  </h1>
                );
              }

              // List items
              if (p.includes('\n- ') || p.startsWith('- ') || p.includes('\n* ') || p.startsWith('* ')) {
                const items = p.split(/\n[-*]\s+/).filter(Boolean);
                return (
                  <ul key={pIdx} className="space-y-1.5 my-2 list-none">
                    {items.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2 text-slate-200">
                        <span className="w-1.5 h-1.5 mt-2 bg-cyan-400 rounded-full flex-shrink-0"></span>
                        <span>{renderInlineFormatting(item)}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              // Regular paragraph with bolding/links
              return (
                <p key={pIdx} className="text-slate-200 leading-relaxed">
                  {renderInlineFormatting(p)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Render bold **text**, inline code `code`, and highlighted text
function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((chunk, i) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white bg-slate-800/40 px-1 rounded">
          {chunk.slice(2, -2)}
        </strong>
      );
    }
    if (chunk.startsWith('`') && chunk.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded font-mono text-xs bg-slate-800 text-cyan-300 border border-slate-700/50" dir="ltr">
          {chunk.slice(1, -1)}
        </code>
      );
    }
    return chunk;
  });
}
