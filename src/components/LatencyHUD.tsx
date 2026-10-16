import React, { useState } from 'react';
import { Sparkles, Bot, Clock, Zap, Gauge, ChevronDown, ChevronUp, Activity, CheckCircle2 } from 'lucide-react';
import { ModelLatencies } from '../types';

interface LatencyHUDProps {
  latencies?: ModelLatencies;
  timeMs?: number;
  provider?: 'gemini' | 'deepseek' | 'dual' | 'synergy';
  modelName?: string;
  className?: string;
}

export const LatencyHUD: React.FC<LatencyHUDProps> = ({
  latencies,
  timeMs,
  provider = 'gemini',
  modelName,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Derive model-specific latencies
  const totalMs = latencies?.total || timeMs || 0;
  const geminiMs = latencies?.gemini || (provider === 'gemini' ? totalMs : undefined);
  const deepseekMs = latencies?.deepseek || (provider === 'deepseek' ? totalMs : undefined);

  if (!totalMs && !geminiMs && !deepseekMs) return null;

  const formatSpeed = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  const getSpeedGrade = (ms: number) => {
    if (ms < 850) {
      return {
        label: 'فائقة السرعة ⚡',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
        progressColor: 'bg-emerald-500',
        percent: Math.min(100, Math.max(15, Math.round((1 - ms / 2500) * 100))),
      };
    }
    if (ms < 2200) {
      return {
        label: 'استجابة سريعة 🚀',
        color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40',
        progressColor: 'bg-cyan-500',
        percent: Math.min(100, Math.max(15, Math.round((1 - ms / 3500) * 100))),
      };
    }
    return {
      label: 'معالجة عميقة 🧠',
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/40',
      progressColor: 'bg-indigo-500',
      percent: Math.min(100, Math.max(15, Math.round((1 - ms / 6000) * 100))),
    };
  };

  const totalGrade = getSpeedGrade(totalMs);

  return (
    <div
      className={`mt-3 rounded-xl border border-slate-800/90 bg-slate-950/90 p-3 transition-all text-xs font-mono select-none ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Gauge className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-200 flex items-center gap-1.5 font-sans">
            <span>لوحة سرعة الاستجابة</span>
            <span className="text-[10px] text-slate-500 font-mono">(Latency)</span>
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-sans font-medium ${totalGrade.color}`}
          >
            {totalGrade.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{formatSpeed(totalMs)}</span>
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-colors"
            title={isExpanded ? 'طي التفاصيل' : 'عرض تفاصيل النماذج'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Grid of Models Latency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
        {/* Gemini Model Card */}
        {(geminiMs !== undefined || provider === 'gemini' || provider === 'synergy' || provider === 'dual') && (
          <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <span className="font-bold text-slate-200 text-[11px] font-sans">
                  {provider === 'synergy' ? 'Gemini Auditor (المدقق)' : 'Google Gemini'}
                </span>
              </div>
              <span className="font-bold text-emerald-400 text-[11px]">
                {formatSpeed(geminiMs)}
              </span>
            </div>

            {geminiMs && (
              <div className="space-y-1">
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${getSpeedGrade(geminiMs).percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-sans">
                  <span>{provider === 'synergy' ? 'مرحلة التدقيق والصقل' : modelName || 'معالجة فورية'}</span>
                  <span className="text-emerald-400/90">{getSpeedGrade(geminiMs).label}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DeepSeek Model Card */}
        {(deepseekMs !== undefined || provider === 'deepseek' || provider === 'synergy' || provider === 'dual') && (
          <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-cyan-500/20 flex items-center justify-center">
                  <Bot className="w-2.5 h-2.5 text-cyan-400" />
                </div>
                <span className="font-bold text-slate-200 text-[11px] font-sans">
                  {provider === 'synergy' ? 'DeepSeek Builder (الباني)' : 'DeepSeek Engine'}
                </span>
              </div>
              <span className="font-bold text-cyan-400 text-[11px]">
                {formatSpeed(deepseekMs)}
              </span>
            </div>

            {deepseekMs && (
              <div className="space-y-1">
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${getSpeedGrade(deepseekMs).percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-sans">
                  <span>{provider === 'synergy' ? 'مرحلة بناء الهيكل والمسودة' : modelName || 'استدلال منطقي'}</span>
                  <span className="text-cyan-400/90">{getSpeedGrade(deepseekMs).label}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Telemetry breakdown */}
      {isExpanded && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-400 font-sans">
          <div>
            <span className="text-slate-500 block">إجمالي وقت المعالجة:</span>
            <span className="text-slate-200 font-mono font-semibold">{totalMs} ms</span>
          </div>
          <div>
            <span className="text-slate-500 block">النموذج النشط:</span>
            <span className="text-cyan-300 font-mono">{provider.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-slate-500 block">حالة الخادم:</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> استجابة مكتملة بنجاح
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
