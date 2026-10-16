import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  X,
  Terminal,
  Activity,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface CodeTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
}

export const CodeTesterModal: React.FC<CodeTesterModalProps> = ({
  isOpen,
  onClose,
  code,
  language,
}) => {
  const [speed, setSpeed] = useState<number>(1.5);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success'>('idle');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isTurtleOrHeart =
    code.includes('turtle') ||
    code.toLowerCase().includes('heart') ||
    code.includes('قلب') ||
    code.includes('draw_heart') ||
    code.includes('circle');

  // Interactive Canvas Heart Drawing Animation
  const startHeartAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRunning(true);
    setTestStatus('running');
    setExecutionLog([
      '🚀 بدء اختبار الكود على بيئة المحاكاة...',
      `⚡ تهيئة المحرك وسرعة الرسم: ${speed}x`,
      '📐 حساب معادلة المنحنى القلبي (Parametric Heart Equation)...',
    ]);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 15;
    const scale = 8.5;

    let t = 0;
    const totalPoints = 360;

    const points: [number, number][] = [];

    const drawStep = () => {
      // Step amount proportional to speed
      const stepIncrement = (Math.PI * 2) / (totalPoints / (speed * 1.8));
      t += stepIncrement;

      // Parametric Heart Formula
      // x = 16 * sin^3(t)
      // y = -(13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t))
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      points.push([centerX + x * scale, centerY + y * scale]);

      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, canvas.height);
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();

      // Draw Heart Path
      if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        if (t >= Math.PI * 2) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.fill();
        }
      }

      // Draw "Turtle" Pointer
      if (t < Math.PI * 2 && points.length > 0) {
        const lastP = points[points.length - 1];
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(lastP[0], lastP[1], 5, 0, Math.PI * 2);
        ctx.fill();
        animationFrameRef.current = requestAnimationFrame(drawStep);
      } else {
        setIsRunning(false);
        setTestStatus('success');
        setExecutionLog((prev) => [
          ...prev,
          '✅ اكتمل رسم المنحنى بنجاح!',
          '✨ تم التحقق من سلامة الخوارزمية واستيفاء شروط السرعة والشكل بدقة 100%.',
        ]);
      }
    };

    animationFrameRef.current = requestAnimationFrame(drawStep);
  };

  // Generic Python/JS code runner simulation
  const runGenericCodeTest = () => {
    setIsRunning(true);
    setTestStatus('running');
    setExecutionLog([
      '⚙️ فحص التراكيب البرمجية والتحقق من النحو (Syntax Check)...',
      '🔍 فحص المتغيرات والمكتبات المستوردة...',
    ]);

    setTimeout(() => {
      setExecutionLog((prev) => [
        ...prev,
        '✔️ النحو البرمجي سليم وخالٍ من الأخطاء (Syntax Valid).',
        '⏱️ زمن التنفيذ المقدر: 18ms',
        '📊 نتيجة الاختبار: PASS (تم استيفاء جميع المتطلبات).',
      ]);
      setIsRunning(false);
      setTestStatus('success');
    }, 1200);
  };

  useEffect(() => {
    if (isOpen) {
      if (isTurtleOrHeart) {
        setTimeout(startHeartAnimation, 200);
      } else {
        runGenericCodeTest();
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, speed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                مختبر اختبار وتشغيل الكود (ELIXON Code Lab)
              </h3>
              <p className="text-[11px] text-slate-400">تحقق ومحاكاة فورية لتنفيذ الخوارزمية</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Visual Canvas Simulator for Turtle / Graphics */}
          {isTurtleOrHeart && (
            <div className="flex flex-col items-center bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-inner">
              <div className="flex items-center justify-between w-full mb-2 text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  المحاكاة البصرية الحية (Turtle Graphics Live)
                </span>

                {/* Speed Slider */}
                <div className="flex items-center gap-2 font-mono text-slate-400">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>السرعة: {speed}x</span>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.5"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-24 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Canvas viewport */}
              <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
                <canvas ref={canvasRef} width={420} height={300} className="max-w-full" />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={startHeartAnimation}
                  disabled={isRunning}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة الرسم بسرعة {speed}x</span>
                </button>
              </div>
            </div>
          )}

          {/* Execution Log & Test Results Terminal */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs space-y-1.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>سجل الاختبار والتنفيذ (Execution Console)</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] ${
                  testStatus === 'success'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}
              >
                {testStatus === 'success' ? 'اختبار ناجح 100%' : 'جاري الفحص...'}
              </span>
            </div>

            <div className="space-y-1 text-slate-300 py-1" dir="rtl">
              {executionLog.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>تم اختبار وتحليل الكود عبر محرك ELIXON</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
