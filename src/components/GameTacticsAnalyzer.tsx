import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Trophy,
  Upload,
  Sparkles,
  Gamepad2,
  Shield,
  Zap,
  Users,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  FileImage,
  X,
  ArrowRight,
  Target,
  Flame,
  Swords,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  Share2,
  Camera,
  Clipboard,
} from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { FormattedContent } from './FormattedContent';

interface FormationPreset {
  id: string;
  name: string;
  description: string;
  type: string;
  pitchPositions: { role: string; top: string; left: string }[];
}

interface ScreenshotItem {
  id: string;
  data: string;
  name: string;
  tag: 'main' | 'bench' | 'tactics';
}

interface TacticsDashboard {
  bestFormation: string;
  formationTitle: string;
  bestPlaystyle: string;
  playstyleArabic: string;
  playstyleFitPercent: number;
  recommendedManager: string;
  ratings: {
    attack: number;
    defense: number;
    midfield: number;
    transition: number;
    overall: number;
  };
  strengths: string[];
  weaknesses: string[];
  individualInstructions: {
    attacking: string[];
    defensive: string[];
    special: string[];
  };
  keyPlayersDetected?: {
    name: string;
    position: string;
    role: string;
    verdict: string;
  }[];
  divisionTips: string[];
  fullAnalysis?: string;
}

const FORMATION_PRESETS: FormationPreset[] = [
  {
    id: '4-2-1-3',
    name: '4-2-1-3 (Meta المرتدة الفتاكة)',
    description: 'الخطة الأكثر شعبية وقوة في تصنيف الديفيجن لهجمات الأطراف والعمق',
    type: 'هجومي مرتد',
    pitchPositions: [
      { role: 'GK', top: '88%', left: '50%' },
      { role: 'LB', top: '72%', left: '16%' },
      { role: 'CB', top: '75%', left: '38%' },
      { role: 'CB', top: '75%', left: '62%' },
      { role: 'RB', top: '72%', left: '84%' },
      { role: 'DMF', top: '56%', left: '40%' },
      { role: 'CMF', top: '54%', left: '60%' },
      { role: 'AMF', top: '38%', left: '50%' },
      { role: 'LWF', top: '22%', left: '18%' },
      { role: 'CF', top: '16%', left: '50%' },
      { role: 'RWF', top: '22%', left: '82%' },
    ],
  },
  {
    id: '4-2-2-2',
    name: '4-2-2-2 Box (مربع خط الوسط)',
    description: 'توازن دفاعي صلب مع ثنائي AMF للاختراق وصناعة الفرص',
    type: 'متوازن قوي',
    pitchPositions: [
      { role: 'GK', top: '88%', left: '50%' },
      { role: 'LB', top: '72%', left: '16%' },
      { role: 'CB', top: '75%', left: '38%' },
      { role: 'CB', top: '75%', left: '62%' },
      { role: 'RB', top: '72%', left: '84%' },
      { role: 'DMF', top: '58%', left: '38%' },
      { role: 'DMF/CMF', top: '58%', left: '62%' },
      { role: 'AMF', top: '40%', left: '28%' },
      { role: 'AMF', top: '40%', left: '72%' },
      { role: 'CF', top: '18%', left: '38%' },
      { role: 'CF/SS', top: '18%', left: '62%' },
    ],
  },
  {
    id: '4-1-2-3',
    name: '4-1-2-3 (صناع لعب مزدوج)',
    description: 'قوة هجومية كاسحة عبر ثنائي AMF وأجنحة سريعة',
    type: 'هجوم شامل',
    pitchPositions: [
      { role: 'GK', top: '88%', left: '50%' },
      { role: 'LB', top: '72%', left: '16%' },
      { role: 'CB', top: '75%', left: '38%' },
      { role: 'CB', top: '75%', left: '62%' },
      { role: 'RB', top: '72%', left: '84%' },
      { role: 'DMF', top: '60%', left: '50%' },
      { role: 'AMF', top: '42%', left: '35%' },
      { role: 'AMF', top: '42%', left: '65%' },
      { role: 'LWF', top: '22%', left: '18%' },
      { role: 'CF', top: '16%', left: '50%' },
      { role: 'RWF', top: '22%', left: '82%' },
    ],
  },
  {
    id: '5-2-1-2',
    name: '5-2-1-2 (جدار الدفاع المرتد)',
    description: 'أفضل خطة لإغلاق المساحات ضد هجمات الخصم والضرب بالمرتدات السريعة',
    type: 'دفاعي صلب',
    pitchPositions: [
      { role: 'GK', top: '88%', left: '50%' },
      { role: 'LWB', top: '65%', left: '14%' },
      { role: 'CB', top: '76%', left: '30%' },
      { role: 'CB', top: '78%', left: '50%' },
      { role: 'CB', top: '76%', left: '70%' },
      { role: 'RWB', top: '65%', left: '86%' },
      { role: 'CMF', top: '50%', left: '38%' },
      { role: 'DMF', top: '50%', left: '62%' },
      { role: 'AMF', top: '34%', left: '50%' },
      { role: 'CF', top: '18%', left: '38%' },
      { role: 'CF', top: '18%', left: '62%' },
    ],
  },
];

const PLAYSTYLES = [
  { id: 'quick_counter', name: 'Quick Counter (هجمة مرتدة سريعة)', desc: 'ضغط عالي شرس وسرعة انطلاق فور افتكاك الكرة' },
  { id: 'possession', name: 'Possession Game (استحواذ)', desc: 'بناء هادئ وتمريرات متقاربة وتحكم بإيقاع المباراة' },
  { id: 'long_ball_counter', name: 'Long Ball Counter (مرتدة طويلة)', desc: 'دفاع عميق متماسك مع كرات بينية طويلة خلف المدافعين' },
  { id: 'out_wide', name: 'Out Wide (أطراف وعرضيات)', desc: 'فتح الملعب بالكامل والاعتماد على الكرات العرضية والرأسيات' },
];

export const GameTacticsAnalyzer: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState('eFootball / PES (بيس)');
  const [selectedFormation, setSelectedFormation] = useState<string>('4-2-1-3');
  const [selectedPlaystyle, setSelectedPlaystyle] = useState<string>('quick_counter');
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [playerInput, setPlayerInput] = useState<string>('');
  const [playerTags, setPlayerTags] = useState<string[]>([
    'مبابي (Goal Poacher - CF)',
    'فينيسيوس جونيور (Roaming Flank - LWF)',
    'ميسي 2015 (Creative Playmaker - RWF)',
    'بيلينغهام (Hole Player - AMF)',
    'فييرا (Anchor Man - DMF)',
    'فالفيردي (Box-to-Box - CMF)',
    'روبيرتو كارلوس (Offensive Fullback - LB)',
    'مالديني (Build Up - CB)',
    'نيستا (Destroyer - CB)',
    'ووكر (Defensive Fullback - RB)',
    'شمايكل (Defensive GK)',
  ]);
  const [tacticalNotes, setTacticalNotes] = useState<string>(
    'أبحث عن الخطة الأقوى لتصدر الديفيجن 1 وحل مشكلة المرتدات السريعة مع الاستفادة القصوى من سرعة الأجنحة.'
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<TacticsDashboard | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'dashboard' | 'report'>('dashboard');
  const [copiedInstruction, setCopiedInstruction] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Tactics Chat Assistant States
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: 'أهلاً بك يا بطل! أنا مساعدك التكتيكي الذكي للعبة بيس (eFootball / PES) وفيفا. اسألني أي شيء عن خطتك، كيفية إيقاف الهجمات المرتدة، أو اختيار اللاعبين والمدربين لتصدر الديفيجن 1! ⚽🔥',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const { speak, stop: stopTts, speakingId } = useTextToSpeech();

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const newMessages = [...chatMessages, { role: 'user' as const, content: userMsg }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/tactics/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          currentContext: {
            game: selectedGame,
            formation: activePreset.name,
            playstyle: selectedPlaystyle,
            overall: dashboardData?.ratings?.overall || 90,
          },
        }),
      });

      if (!res.ok) throw new Error('فشل الرد التكتيكي');
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚽ كخبير تكتيكي، أنصحك بالتركيز على توازن خط الوسط وإغلاق المساحات بين الأظهرة وقلوب الدفاع. هل تحتاج خطة معينة لمباراتك القادمة؟',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const activePreset = FORMATION_PRESETS.find((f) => f.id === selectedFormation) || FORMATION_PRESETS[0];

  // Clipboard Paste listener: allows gamers to press Ctrl+V directly to upload their squad screenshot
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleProcessFile(file, 'main');
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleProcessFile = (file: File, tag: 'main' | 'bench' | 'tactics' = 'main') => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميغابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      const newItem: ScreenshotItem = {
        id: 'shot-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        data,
        name: file.name || `لقطة شاشة ${screenshots.length + 1}`,
        tag,
      };
      setScreenshots((prev) => [...prev.slice(-2), newItem]); // keep up to 3 screenshots
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = (id: string) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddPlayer = () => {
    if (playerInput.trim()) {
      setPlayerTags((prev) => [...prev, playerInput.trim()]);
      setPlayerInput('');
    }
  };

  const handleRemovePlayer = (idx: number) => {
    setPlayerTags((prev) => prev.filter((_, i) => i !== idx));
  };

  const loadSampleSquad = () => {
    setSelectedGame('eFootball / PES (بيس)');
    setSelectedFormation('4-2-1-3');
    setSelectedPlaystyle('quick_counter');
    setPlayerTags([
      'مبابي (Goal Poacher - CF)',
      'فينيسيوس جونيور (Roaming Flank - LWF)',
      'ميسي 2015 (Creative Playmaker - RWF)',
      'بيلينغهام (Hole Player - AMF)',
      'فييرا (Anchor Man - DMF)',
      'فالفيردي (Box-to-Box - CMF)',
      'روبيرتو كارلوس (Offensive Fullback - LB)',
      'مالديني (Build Up - CB)',
      'نيستا (Destroyer - CB)',
      'ووكر (Defensive Fullback - RB)',
      'شمايكل (Defensive GK)',
    ]);
    setTacticalNotes('تشكيلة تنافسية لأبطال الديفيجن، أبحث عن أفضل توزيع للتعليمات الفردية وأفضل مدرب للأسلوب.');
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setDashboardData(null);
    stopTts();

    const mainImage = screenshots[0]?.data;
    const additionalImages = screenshots.slice(1).map((s) => ({
      base64: s.data,
      mimeType: 'image/jpeg',
    }));

    try {
      const response = await fetch('/api/tactics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: mainImage,
          images: additionalImages,
          game: selectedGame,
          currentFormation: activePreset.name,
          currentPlaystyle: PLAYSTYLES.find((p) => p.id === selectedPlaystyle)?.name,
          notes: tacticalNotes,
          players: playerTags,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل معالجة التحليل التكتيكي');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      if (data.dashboard) {
        setDashboardData(data.dashboard);
        setActiveResultTab('dashboard');
      } else {
        setActiveResultTab('report');
      }
    } catch (err: any) {
      setAnalysisResult('حدث خطأ أثناء تحليل التشكيلة، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInstruction(id);
    setTimeout(() => setCopiedInstruction(null), 2000);
  };

  const copyFullReport = () => {
    const textToCopy = analysisResult || JSON.stringify(dashboardData, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 max-w-6xl mx-auto w-full space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/30 p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span>محلل لقطات شاشة وتشكيلات الألعاب بالـ AI</span>
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 text-[11px] font-mono border border-cyan-500/30">
                eFootball PES Meta 2026
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 text-[11px] font-mono border border-indigo-500/30 hidden sm:inline">
                Ctrl + V للصق لقطة الشاشة مباشرة 📋
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>محلل التشكيلات والخطط التكتيكية</span>
              <span className="text-emerald-400 text-lg">⚽</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              ارفع لقطة شاشة تشكيلتك من لعبة بيس (eFootball / PES) أو فيفا بالصور، ليقوم الذكاء الاصطناعي بالتعرف البصري على بطاقات لاعبيك، وتوليد أفضل خطة وأنسب أسلوب لعب، مع لوحة تفاعلية للتعليمات الفردية ونقاط القوة والثغرات!
            </p>
          </div>

          <button
            onClick={loadSampleSquad}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-2 transition-all shrink-0 shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>تجربة تشكيلة بيس نموذجية</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Screenshots Upload & Pitch Visualization (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Screenshot Upload Hub */}
          <div
            ref={dropZoneRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleProcessFile(file, 'main');
            }}
            className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-emerald-400" />
                <span>رفع لقطات الشاشة (Screenshots)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {screenshots.length} / 3 صور
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  Array.from(files).forEach((file) => handleProcessFile(file, 'main'));
                }
              }}
            />

            {/* Screenshots Grid or Empty State */}
            {screenshots.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {screenshots.map((s, index) => (
                    <div
                      key={s.id}
                      className="relative rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-950 group aspect-video"
                    >
                      <img
                        src={s.data}
                        alt={s.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900/90 text-emerald-300 text-[9px] font-mono">
                          صورة {index + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveScreenshot(s.id)}
                          className="p-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 transition-colors"
                          title="حذف"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {screenshots.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-xl flex flex-col items-center justify-center p-3 text-slate-400 hover:text-emerald-300 transition-colors bg-slate-950/40"
                    >
                      <Upload className="w-5 h-5 mb-1 text-emerald-400" />
                      <span className="text-[11px] font-bold">+ إضافة لقطة أخرى</span>
                      <span className="text-[9px] text-slate-500">(دكة البدلاء / المدرب)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-emerald-950/10 flex flex-col items-center justify-center group"
              >
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-slate-200">اضغط لرفع لقطة شاشة تشكيلتك أو اسحبها هنا</span>
                <span className="text-[11px] text-emerald-400 mt-1 font-mono">أو اضغط Ctrl + V للصق الصورة مباشرة من الحافظة 📋</span>
                <span className="text-[10px] text-slate-500 mt-1">يدعم لقطات شاشة بيس وإي فوتبول (موبايل، بلايستيشن، PC)</span>
              </div>
            )}
          </div>

          {/* Interactive Pitch Visualizer */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>محاكاة الخطة على الملعب</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-800/40">
                {activePreset.name.split(' ')[0]}
              </span>
            </div>

            {/* Football Pitch Graphic */}
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-emerald-600/40 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 shadow-inner flex flex-col justify-between p-3 select-none">
              <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(0deg,#000_0px,#000_30px,transparent_30px,transparent_60px)] pointer-events-none" />

              <div className="absolute inset-2 border border-white/30 rounded-xl pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/30" />
                <div className="absolute top-1/2 left-0 right-0 border-t border-white/30" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-16 border-b border-x border-white/30" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-16 border-t border-x border-white/30" />
              </div>

              {activePreset.pitchPositions.map((pos, idx) => (
                <div
                  key={idx}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-transform hover:scale-110 z-10"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-950/90 border-2 border-cyan-400 text-cyan-200 text-[9px] font-black font-mono flex items-center justify-center shadow-md shadow-cyan-950/60">
                    {pos.role}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 text-center font-mono">
              توزيع مراكز {activePreset.name} (يمكنك تعديلها من الإعدادات)
            </p>
          </div>
        </div>

        {/* Right Column: Configuration & Tactical Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 md:p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-indigo-400" />
              <span>إعدادات اللعبة والخطة الحالية</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">اختر اللعبة التنافسية:</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                >
                  <option value="eFootball / PES (بيس)">eFootball / PES (بيس)</option>
                  <option value="EA Sports FC / FIFA (فيفا)">EA Sports FC / FIFA (فيفا)</option>
                  <option value="Football Manager">Football Manager</option>
                  <option value="ألعاب كرة قدم أخرى">ألعاب كرة قدم أخرى</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">الخطة الأساسية الحالية:</label>
                <select
                  value={selectedFormation}
                  onChange={(e) => setSelectedFormation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                >
                  {FORMATION_PRESETS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Playstyle Selector */}
            <div>
              <label className="text-[11px] text-slate-400 mb-1.5 block">أسلوب اللعب التكتيكي المفضل:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PLAYSTYLES.map((ps) => (
                  <button
                    key={ps.id}
                    type="button"
                    onClick={() => setSelectedPlaystyle(ps.id)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col ${
                      selectedPlaystyle === ps.id
                        ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-200">{ps.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{ps.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Players Tag Input */}
            <div>
              <label className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>اللاعبون الأساسيون والبطاقات (اختياري بجانب لقطة الشاشة):</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400">{playerTags.length} لاعبين</span>
              </label>

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={playerInput}
                  onChange={(e) => setPlayerInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPlayer())}
                  placeholder="اكتب اسم اللاعب ونوع البطاقة واضغط Enter..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  إضافة
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-950/40 rounded-xl border border-slate-800/60">
                {playerTags.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]"
                  >
                    <span>{p}</span>
                    <button
                      onClick={() => handleRemovePlayer(idx)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Notes Input */}
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">تحدياتك أو أهدافك من التشكيلة:</label>
              <input
                type="text"
                value={tacticalNotes}
                onChange={(e) => setTacticalNotes(e.target.value)}
                placeholder="مثلاً: أعاني من ثغرات بالدفاع أمام المرتدات، أو أريد استغلال ميسي بالعمق..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 outline-none"
              />
            </div>

            {/* Action Submit Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-extrabold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>جاري قراءة لقطات الشاشة وفحص بطاقات التشكيلة...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>تحليل لقطة الشاشة واستخراج أفضل خطة وأساليب اللعب</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Results Dashboard Section */}
      {(dashboardData || analysisResult) && (
        <div className="rounded-3xl bg-slate-900/95 border border-emerald-500/40 p-5 md:p-6 shadow-2xl space-y-6 animate-fadeIn">
          {/* Dashboard Header & Tab Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                <Trophy className="w-6 h-6 text-slate-950" />
              </span>
              <div>
                <h3 className="text-base md:text-lg font-black text-white">
                  {dashboardData?.formationTitle || 'التقرير التكتيكي المتقدم للتشكيلة'}
                </h3>
                <p className="text-xs text-emerald-400/90 font-mono">
                  {dashboardData?.bestPlaystyle ? `أسلوب اللعب الأمثل: ${dashboardData.playstyleArabic} (${dashboardData.bestPlaystyle})` : 'تحليل احترافي لتشكيلة بيس'}
                </p>
              </div>
            </div>

            {/* View Switcher & Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {dashboardData && (
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                  <button
                    onClick={() => setActiveResultTab('dashboard')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeResultTab === 'dashboard'
                        ? 'bg-emerald-600 text-white font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    لوحة القياسات التفاعلية 📊
                  </button>
                  <button
                    onClick={() => setActiveResultTab('report')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeResultTab === 'report'
                        ? 'bg-emerald-600 text-white font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    التقرير المفصل 📝
                  </button>
                </div>
              )}

              {/* TTS Read Aloud Button */}
              <button
                onClick={() => speak(analysisResult || '', 'tactics-result')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  speakingId === 'tactics-result'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
                title="الاستماع للتقرير التكتيكي بصوت مسموع"
              >
                {speakingId === 'tactics-result' ? (
                  <>
                    <VolumeX className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>إيقاف القراءة</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>قراءة صوتية</span>
                  </>
                )}
              </button>

              {/* Copy Full Report */}
              <button
                onClick={copyFullReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                title="نسخ التقرير التكتيكي بالكامل"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>نسخ التكتيك</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* VIEW 1: INTERACTIVE DASHBOARD */}
          {activeResultTab === 'dashboard' && dashboardData && (
            <div className="space-y-6">
              {/* Stat Meters & Overall Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Overall Score Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 border border-emerald-500/40 flex flex-col items-center justify-center text-center shadow-lg">
                  <span className="text-[11px] text-emerald-300 font-semibold mb-1">التقييم التكتيكي العام</span>
                  <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1">
                    <span className="text-emerald-400">{dashboardData.ratings?.overall || 90}</span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">جاهزية الديفيجن 1</span>
                </div>

                {/* Attack Meter */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>القوة الهجومية</span>
                    </span>
                    <span className="font-mono">{dashboardData.ratings?.attack || 88}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-1000"
                      style={{ width: `${dashboardData.ratings?.attack || 88}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">إنهاء الفرص والتحولات</span>
                </div>

                {/* Defense Meter */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>الصلابة الدفاعية</span>
                    </span>
                    <span className="font-mono">{dashboardData.ratings?.defense || 84}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${dashboardData.ratings?.defense || 84}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">التغطية والافتكاك</span>
                </div>

                {/* Midfield Meter */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      <span>تماسك الوسط</span>
                    </span>
                    <span className="font-mono">{dashboardData.ratings?.midfield || 89}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${dashboardData.ratings?.midfield || 89}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">التحكم وصناعة اللعب</span>
                </div>

                {/* Transition Speed Meter */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-purple-400" />
                      <span>سرعة التحولات</span>
                    </span>
                    <span className="font-mono">{dashboardData.ratings?.transition || 94}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                      style={{ width: `${dashboardData.ratings?.transition || 94}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">الارتداد السريع</span>
                </div>
              </div>

              {/* Playstyle Recommendation & Recommended Manager */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Playstyle Match Card */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-emerald-400" />
                    <span>أسلوب اللعب الأنسب للتشكيلة:</span>
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-black text-emerald-400">
                        {dashboardData.playstyleArabic} ({dashboardData.bestPlaystyle})
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        توافق تام مع سرعات الأجنحة وتمركز بطاقات الهجوم
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-black">
                      {dashboardData.playstyleFitPercent || 94}% توافق
                    </span>
                  </div>
                </div>

                {/* Recommended Manager Card */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>المدرب الموصى به (Manager):</span>
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-black text-amber-300">
                        {dashboardData.recommendedManager}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        يعطي كفاءة أسلوب 88+ مع بوستر زيادة التسارع +3
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                      Booster Meta
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Individual Instructions (التعليمات الفردية) */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-indigo-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Gamepad2 className="w-4 h-4" />
                    </span>
                    <span>التعليمات الفردية التكتيكية (Individual Instructions)</span>
                  </h4>
                  <span className="text-[11px] text-indigo-300/80 font-mono">طبقها في شاشة التكتيك باللعبة</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Attacking Instructions */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>تعليمات الهجوم (Attacking 1 & 2):</span>
                    </span>
                    <div className="space-y-1.5">
                      {dashboardData.individualInstructions?.attacking?.map((inst, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 flex items-center justify-between gap-2"
                        >
                          <span className="leading-relaxed">{inst}</span>
                          <button
                            onClick={() => copyText(inst, `att-${i}`)}
                            className="text-slate-400 hover:text-white shrink-0"
                            title="نسخ التعليمة"
                          >
                            {copiedInstruction === `att-${i}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Defensive Instructions */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>تعليمات الدفاع (Defensive 1 & 2):</span>
                    </span>
                    <div className="space-y-1.5">
                      {dashboardData.individualInstructions?.defensive?.map((inst, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 flex items-center justify-between gap-2"
                        >
                          <span className="leading-relaxed">{inst}</span>
                          <button
                            onClick={() => copyText(inst, `def-${i}`)}
                            className="text-slate-400 hover:text-white shrink-0"
                            title="نسخ التعليمة"
                          >
                            {copiedInstruction === `def-${i}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special / Anchoring */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      <span>التثبيت والمراقبة (Special):</span>
                    </span>
                    <div className="space-y-1.5">
                      {dashboardData.individualInstructions?.special?.map((inst, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 flex items-center justify-between gap-2"
                        >
                          <span className="leading-relaxed">{inst}</span>
                          <button
                            onClick={() => copyText(inst, `spec-${i}`)}
                            className="text-slate-400 hover:text-white shrink-0"
                            title="نسخ التعليمة"
                          >
                            {copiedInstruction === `spec-${i}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2.5">
                  <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>نقاط القوة التكتيكية (Strengths)</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {dashboardData.strengths?.map((str, i) => (
                      <li key={i} className="text-xs text-emerald-100/90 flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>الثغرات التي يجب الحذر منها (Vulnerabilities)</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {dashboardData.weaknesses?.map((w, i) => (
                      <li key={i} className="text-xs text-amber-100/90 flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Division Meta Tips */}
              {dashboardData.divisionTips && dashboardData.divisionTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-cyan-400" />
                    <span>مفاتيح الفوز وتصدر الديفيجن (Division Meta Tips)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {dashboardData.divisionTips.map((tip, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-mono font-bold mt-0.5">
                          #{i + 1}
                        </span>
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: DETAILED MARKDOWN REPORT */}
          {(activeResultTab === 'report' || !dashboardData) && analysisResult && (
            <div className="text-slate-200 text-sm leading-relaxed p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <FormattedContent content={analysisResult} />
            </div>
          )}
        </div>
      )}

      {/* --- TACTICS AI CHAT ASSISTANT SECTION --- */}
      <div className="rounded-3xl bg-slate-900/95 border border-cyan-500/30 p-5 md:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Gamepad2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">المساعد التكتيكي الفوري (Tactics Chat)</h3>
              <p className="text-xs text-slate-400">اسأل المحلل عن أي تفصيل في الخطة، كيفية إيقاف هجمات الخصم، أو اختيار البدلاء</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 text-[11px] font-mono border border-cyan-800/60 font-bold">
            محادثة ذكية 💬
          </span>
        </div>

        {/* Chat Messages Container */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 h-80 overflow-y-auto space-y-3">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 text-xs font-bold">
                  ⚽
                </div>
              )}
              <div
                className={`max-w-[82%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
                }`}
              >
                <FormattedContent content={msg.content} />
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
              <span>المحلل التكتيكي يكتب الرد...</span>
            </div>
          )}
          <div ref={chatScrollRef} />
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSendChatMessage} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="مثال: كيف أواقف خصم يلعب بالاستحواذ وطول الباسات؟ أو من أفضل صانع ألعاب خطة 4213؟"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 outline-none shadow-inner"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isChatLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold text-xs md:text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 shrink-0"
          >
            <span>إرسال</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
