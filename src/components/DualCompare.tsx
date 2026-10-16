import React, { useState } from 'react';
import { Layers, Sparkles, Bot, Clock, Brain, ArrowLeftRight, Send, Check, Copy } from 'lucide-react';
import { FormattedContent } from './FormattedContent';

export const DualCompare: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    gemini?: { text: string; timeMs?: number; error?: string };
    deepseek?: { text: string; reasoning?: string | null; timeMs?: number; error?: string };
  } | null>(null);

  const handleCompare = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/dual/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('فشل استدعاء المقارنة المزدوجة من السيرفر');
      }

      const data = await response.json();
      setResult(data.results);
    } catch (err: any) {
      console.error(err);
      setResult({
        gemini: { text: '', error: err.message },
        deepseek: { text: '', error: err.message },
      });
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'قارن بين هياكل البيانات Hash Table و Binary Search Tree من حيث التعقيد الزمني واستخدام الذاكرة مع كود توضيحي.',
    'كيف تعمل الشبكات العصبية الاصطناعية (Neural Networks) بالتفصيل والرياضيات المبسطة؟',
    'ما هي أفضل الممارسات لبناء واجهات برمجة تطبيقات RESTful آمنة وعالية الأداء؟',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6">
      {/* Title & Description */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
          <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
          <span>حلبة المقارنة المزدوجة (Dual Core Arena)</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          مقارنة فورية: <span className="text-emerald-400">Gemini 3.8</span> ضد{' '}
          <span className="text-cyan-400">DeepSeek</span>
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          أرسل سؤالك أو الكود البرمجي وشاهد النموذجين يعملان بالتوازي وقارن بين سرعة الرد، عمق التفكير، والأسلوب.
        </p>
      </div>

      {/* Input Box */}
      <form onSubmit={handleCompare} className="relative max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 focus-within:border-cyan-500/70 transition-all shadow-xl">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="اكتب الموضوع أو الكود للمقارنة المزدوجة..."
            className="flex-1 w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base outline-none px-3 py-2"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>جاري التحليل...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 rotate-180" />
                <span>إطلاق المقارنة</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Sample prompt chips */}
      {!result && !loading && (
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(p);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              {p.slice(0, 50)}...
            </button>
          ))}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-900/30 h-72 space-y-3">
            <div className="h-4 bg-emerald-500/20 rounded w-1/3"></div>
            <div className="h-3 bg-slate-800 rounded w-full"></div>
            <div className="h-3 bg-slate-800 rounded w-5/6"></div>
            <div className="h-3 bg-slate-800 rounded w-4/6"></div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyan-900/30 h-72 space-y-3">
            <div className="h-4 bg-cyan-500/20 rounded w-1/3"></div>
            <div className="h-3 bg-slate-800 rounded w-full"></div>
            <div className="h-3 bg-slate-800 rounded w-5/6"></div>
            <div className="h-3 bg-slate-800 rounded w-4/6"></div>
          </div>
        </div>
      )}

      {/* Results Side by Side */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gemini Column */}
          <div className="rounded-2xl border border-emerald-800/40 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-400">Google Gemini 3.8 Flash</h3>
                    <p className="text-[11px] text-slate-400">محرك الفهم السريع والقدرات متعددة الأبعاد</p>
                  </div>
                </div>

                {result.gemini?.timeMs && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {(result.gemini.timeMs / 1000).toFixed(2)}s
                  </span>
                )}
              </div>

              {result.gemini?.error ? (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-xs text-rose-300">
                  {result.gemini.error}
                </div>
              ) : (
                <FormattedContent content={result.gemini?.text || 'لا يوجد رد متاح'} />
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-500">
              <span>ELIXON Gemini Engine</span>
              <button
                onClick={() => navigator.clipboard.writeText(result.gemini?.text || '')}
                className="text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ</span>
              </button>
            </div>
          </div>

          {/* DeepSeek Column */}
          <div className="rounded-2xl border border-cyan-800/40 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-cyan-400">DeepSeek Engine</h3>
                    <p className="text-[11px] text-slate-400">محرك التحليل البرمجي والمنطقي العميق</p>
                  </div>
                </div>

                {result.deepseek?.timeMs && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {(result.deepseek.timeMs / 1000).toFixed(2)}s
                  </span>
                )}
              </div>

              {/* Chain of thought if returned */}
              {result.deepseek?.reasoning && (
                <div className="mb-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/50 text-xs text-indigo-300 font-mono max-h-48 overflow-y-auto">
                  <div className="font-bold flex items-center gap-1.5 mb-1.5 text-indigo-400">
                    <Brain className="w-3.5 h-3.5" />
                    <span>تفكير النموذج التحليلي (Chain of Thought):</span>
                  </div>
                  {result.deepseek.reasoning}
                </div>
              )}

              {result.deepseek?.error ? (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-xs text-rose-300">
                  {result.deepseek.error}
                </div>
              ) : (
                <FormattedContent content={result.deepseek?.text || 'لا يوجد رد متاح'} />
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-500">
              <span>ELIXON DeepSeek Engine</span>
              <button
                onClick={() => navigator.clipboard.writeText(result.deepseek?.text || '')}
                className="text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
