import React, { useState } from 'react';
import { Trophy, Users, Search, RefreshCw, Send, AlertCircle } from 'lucide-react';

export const MatchAnalysisSection: React.FC = () => {
  const [analysisType, setAnalysisType] = useState<'match' | 'transfer'>('match');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchTransfers = async () => {
    setLoading(true);
    setResult(null);

    try {
      const prompt = `اعرض لي أحدث انتقالات لاعبي كرة القدم في الدوريات الكبرى لهذا الموسم.`;
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, useWebSearch: true }),
      });

      const data = await response.json();
      setResult(data.text || data.content || 'عذراً، لم أتمكن من جلب الانتقالات في الوقت الحالي.');
    } catch (error) {
      console.error('Error fetching transfers:', error);
      setResult('حدث خطأ أثناء جلب الانتقالات عبر الويب، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (analysisType === 'transfer') {
      handleFetchTransfers();
      return;
    }
    
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const prompt = `قم بتحليل المباراة التالية بدقة واحترافية: "${input}". 
      أجب باللغة العربية في هيكل من ثلاث نقاط: 
      1. **النقاط الرئيسية**
      2. **التوقعات/التحليل التكتيكي**
      3. **النصيحة/الخلاصة**`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setResult(data.text || data.content || 'عذراً، لم أتمكن من الحصول على تحليل في الوقت الحالي.');
    } catch (error) {
      console.error('Detailed Error fetching match analysis:', error);
      setResult(`حدث خطأ أثناء التحليل: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          مركز تحليل المباريات والانتقالات
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          {analysisType === 'match' 
            ? 'أدخل تفاصيل المباراة للحصول على تحليل ذكي.'
            : 'اضغط على زر "جلب الانتقالات" لرؤية أحدث أخبار الانتقالات في الدوريات الكبرى.'}
        </p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAnalysisType('match')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              analysisType === 'match' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Trophy className="w-4 h-4" /> تحليل مباراة
          </button>
          <button
            onClick={() => setAnalysisType('transfer')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              analysisType === 'transfer' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" /> انتقالات الدوريات
          </button>
        </div>

        {analysisType === 'match' && (
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="مثال: تحليل مباراة ريال مدريد ضد برشلونة الأخيرة..."
                className="w-full h-32 p-4 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="absolute bottom-4 left-4 p-3 bg-cyan-600 rounded-xl text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
        )}
        
        {analysisType === 'transfer' && (
            <button
              onClick={handleFetchTransfers}
              disabled={loading}
              className="w-full py-4 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              جلب أحدث انتقالات الدوريات الكبرى
            </button>
        )}
      </div>

      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl animate-fade-in">
          <h3 className="text-lg font-bold text-white mb-4">النتيجة:</h3>
          <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">{result}</p>
        </div>
      )}
    </div>
  );
};
