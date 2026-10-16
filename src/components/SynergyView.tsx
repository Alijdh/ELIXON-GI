import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Brain,
  ShieldCheck,
  ArrowRight,
  Send,
  Clock,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Mic,
  MicOff,
} from 'lucide-react';
import { FormattedContent } from './FormattedContent';
import { KnowledgeDomain, SynergyResult } from '../types';

export const SynergyView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('العلوم والطب');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | null>(null);
  const [result, setResult] = useState<SynergyResult | null>(null);
  const [showDraft, setShowDraft] = useState(false);
  const [showCritique, setShowCritique] = useState(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const domains: KnowledgeDomain[] = [
    {
      id: 'science-medicine',
      name: 'العلوم والطب',
      icon: '🔬',
      description: 'أبحاث طبية، أحياء، كيمياء، وظائف أعضاء، وعلم الأدوية',
      samplePrompt: 'ما هي الآلية الحيوية لعمل اللقاحات القائمة على mRNA وكيف يتفاعل الجهاز المناعي معها بدقة؟',
    },
    {
      id: 'business-economics',
      name: 'الأعمال والاقتصاد',
      icon: '💼',
      description: 'استراتيجيات الشركات، دراسات الجدوى، التسويق، والسياسات النقدية',
      samplePrompt: 'كيف تؤثر معدلات الفائدة المرتفعة على تقييمات الشركات الناشئة وسلاسل الإمداد العالمية؟',
    },
    {
      id: 'philosophy-history',
      name: 'الفلسفة والتاريخ',
      icon: '🏛️',
      description: 'تاريخ الحضارات، المدارس الفلسفية، الفكر الإنساني، ونظريات المعرفة',
      samplePrompt: 'قارن بين رؤية ابن خلدون لعمران الدول ونظرية توينبي في التحدي والاستجابة مع أمثلة تاريخية.',
    },
    {
      id: 'law-logic',
      name: 'القانون والمنطق',
      icon: '⚖️',
      description: 'تفكيك الحجج المنطقية، فلسفة القانون، وصياغة العقود',
      samplePrompt: 'ما هي المعايير القانونية والأخلاقية لتحديد المسؤولية المدنية عن أخطاء أنظمة الذكاء الاصطناعي الذاتية؟',
    },
    {
      id: 'creative-arts',
      name: 'الأدب والإبداع',
      icon: '🎨',
      description: 'الأساليب البلاغية، النقد الأدبي، كتابة المقالات، والتعبير الإبداعي',
      samplePrompt: 'حلل الرمزية في رواية (اللص والكلاب) لنجيب محفوظ وتطور الصراع النفسي للشخصية الرئيسية.',
    },
    {
      id: 'tech-stem',
      name: 'التقنية والهندسة',
      icon: '💻',
      description: 'هندسة الأنظمة، الخوارزميات، الحوسبة السحابية، والرياضيات التطبيقية',
      samplePrompt: 'كيف تعمل خوارزميات التشفير ما بعد الكوانتم (Post-Quantum Cryptography) مثل التشفير القائم على الشبيكات؟',
    },
  ];

  const handleRunPipeline = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setCurrentStep(1);

    // Visual step indicator advancement
    const stepTimer = setTimeout(() => {
      setCurrentStep(2);
    }, 2800);

    try {
      const response = await fetch('/api/synergy/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          domain: selectedDomain,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل خط المعالجة التكاملي');
      }

      const data: SynergyResult = await response.json();
      setCurrentStep(3);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء تنفيذ خط التكامل، يرجى المحاولة مرة أخرى.');
    } finally {
      clearTimeout(stepTimer);
      setLoading(false);
    }
  };

  const copyText = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-6 py-6 w-full space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>خط التكامل المشترك (Collaborative Synergy Pipeline)</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          بناء <span className="text-cyan-400">DeepSeek</span> وفحص وتدقيق{' '}
          <span className="text-emerald-400">Google Gemini</span>
        </h2>
        <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
          يقوم نموذج DeepSeek ببناء مسودة إجابة تحليلية متعمقة، ثم يتولى Google Gemini فحص الحقائق، اختبار التماسك المنطقي، وصياغة الجواب النهائي المعتمد في شتى المجالات.
        </p>
      </div>

      {/* Domain Selection Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold text-slate-300">اختر مجال السؤال والمعرفة:</span>
          <span className="font-mono text-cyan-400 text-[11px]">شامل لكافة العلوم والمجالات</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {domains.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDomain(d.name);
                if (!prompt) setPrompt(d.samplePrompt);
              }}
              className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                selectedDomain === d.name
                  ? 'bg-cyan-950/80 border-cyan-500/80 text-white shadow-md shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="text-base mb-1">{d.icon}</div>
              <span className="text-xs font-bold leading-tight truncate">{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Form */}
      <form onSubmit={handleRunPipeline} className="relative">
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 focus-within:border-cyan-500/70 transition-all shadow-xl">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`اطرح سؤالك أو موضوعك في مجال (${selectedDomain})...`}
            rows={2}
            className="flex-1 w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base outline-none px-3 py-1.5 resize-none"
          />

          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 text-white text-xs md:text-sm font-bold hover:opacity-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>جاري البناء والتدقيق...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>إطلاق البناء والفحص</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Live Pipeline Progress Indicator */}
      {loading && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              مراحل خط التكامل المزدوج الحية
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              {currentStep === 1 ? 'المرحلة 1 من 2' : 'المرحلة 2 من 2'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Stage 1: DeepSeek Builder */}
            <div
              className={`p-3 rounded-xl border transition-all flex items-center gap-2.5 ${
                currentStep === 1
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                1
              </div>
              <div className="flex-1">
                <div className="font-bold">DeepSeek Builder (البناء التأسيسي)</div>
                <div className="text-[11px] text-slate-400">بناء الهيكل المنطقي وصياغة المسودة الأولى</div>
              </div>
              {currentStep && currentStep > 1 && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>

            {/* Stage 2: Gemini Auditor */}
            <div
              className={`p-3 rounded-xl border transition-all flex items-center gap-2.5 ${
                currentStep === 2
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                2
              </div>
              <div className="flex-1">
                <div className="font-bold">Gemini Auditor (الفحص والتدقيق)</div>
                <div className="text-[11px] text-slate-400">مطابقة الحقائق، النقد، وتوليد الجواب النهائي المعتمد</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Audit Output View */}
      {result && (
        <div className="space-y-5 animate-fadeIn">
          {/* Telemetry Bar */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-cyan-300 font-bold">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                الباني: {result.builderModel}
              </span>
              <span>←</span>
              <span className="flex items-center gap-1 text-emerald-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                المدقق: {result.auditorModel}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-slate-400">مجال: {result.domain}</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                {(result.timeMs / 1000).toFixed(2)}s
              </span>
            </div>
          </div>

          {/* 1. Verified Master Final Answer (Hero Position) */}
          <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-5 md:p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-emerald-300">
                    الجواب النهائي المعتمد والمطوّر (Verified Master Answer)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    محصلة البناء والتدقيق المزدوج بين DeepSeek و Gemini
                  </p>
                </div>
              </div>

              <button
                onClick={() => copyText(result.finalAnswer, 'final')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
              >
                {copiedSection === 'final' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الإجابة</span>
                  </>
                )}
              </button>
            </div>

            <FormattedContent content={result.finalAnswer} />
          </div>

          {/* 2. Gemini Audit & Critique Report */}
          <div className="rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-4 md:p-5 shadow-lg">
            <button
              onClick={() => setShowCritique(!showCritique)}
              className="w-full flex items-center justify-between text-xs md:text-sm font-bold text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                <span>تقرير الفحص والتدقيق الأكاديمي (Gemini Audit Report)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-indigo-400/80 font-normal hidden sm:inline">
                  ملاحظات الفحص والتحسينات المضافة
                </span>
                {showCritique ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showCritique && (
              <div className="mt-3 pt-3 border-t border-indigo-900/50 text-xs md:text-sm text-indigo-100 leading-relaxed">
                <FormattedContent content={result.auditCritique} />
              </div>
            )}
          </div>

          {/* 3. DeepSeek Initial Builder Draft (Collapsible) */}
          <div className="rounded-2xl border border-cyan-950 bg-slate-950/80 p-4 shadow-md">
            <button
              onClick={() => setShowDraft(!showDraft)}
              className="w-full flex items-center justify-between text-xs md:text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>المسودة التأسيسية الأولية (DeepSeek Builder Draft)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-normal hidden sm:inline">
                  {showDraft ? 'إخفاء المسودة' : 'عرض مسودة البناء الأولية'}
                </span>
                {showDraft ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showDraft && (
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs md:text-sm text-slate-300 space-y-3">
                {result.builderReasoning && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-indigo-300 font-mono whitespace-pre-wrap">
                    <span className="font-bold text-indigo-400 block mb-1">تفكير البناء الأولي (Reasoning):</span>
                    {result.builderReasoning}
                  </div>
                )}
                <FormattedContent content={result.draft} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
