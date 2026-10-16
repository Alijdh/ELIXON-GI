import React from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  Plus,
  Layers,
  HelpCircle,
  ShieldCheck,
  Wand2,
  Menu,
  Clock,
  Smartphone,
  Download,
  Film,
  BarChart3,
  Trophy,
} from 'lucide-react';
import { AIProvider, AppTab, DeepSeekModel, GeminiModel } from '../types';

interface HeaderProps {
  provider: AIProvider;
  setProvider: (p: AIProvider) => void;
  geminiModel: GeminiModel;
  setGeminiModel: (m: GeminiModel) => void;
  deepseekModel: DeepSeekModel;
  setDeepseekModel: (m: DeepSeekModel) => void;
  onNewChat: () => void;
  activeTab: AppTab;
  setActiveTab: (t: AppTab) => void;
  onToggleSidebar: () => void;
  onOpenInstallModal?: () => void;
  health: {
    geminiConfigured: boolean;
    deepseekConfigured: boolean;
  };
  points: number;
  onRefillPoints: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  provider,
  setProvider,
  deepseekModel,
  setDeepseekModel,
  onNewChat,
  activeTab,
  setActiveTab,
  onToggleSidebar,
  onOpenInstallModal,
  health,
  points,
  onRefillPoints,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Zone & Sidebar Trigger */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            {/* Sidebar toggle button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center justify-center"
              title="فتح سجل المحادثات والجلسات السابقة"
            >
              <Menu className="w-4 h-4 text-cyan-400" />
            </button>

            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-cyan-100 to-emerald-300 bg-clip-text text-transparent">
                  ELIXON-GI
                </h1>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-bold">
                  v3.5 UNIFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                المنظومة المعرفية الشاملة وحفظ سياق الدردشة
              </p>
            </div>
          </div>

          {/* Points Wallet Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono shadow-sm">
            <span className="text-amber-400 text-sm">🪙</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-amber-200">{points.toLocaleString()} نقطة</span>
                <span className="text-[10px] text-amber-400/80">({(points * 500).toLocaleString()} Tokens)</span>
              </div>
              <div className="text-[10px] text-slate-400">1 نقطة = 500 Token</div>
            </div>
            <button
              onClick={onRefillPoints}
              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 text-xs font-bold transition-colors shadow-sm"
              title="شحن رصيد النقاط مجاناً"
            >
              + شحن 1300
            </button>
          </div>

          {/* Quick API status on mobile */}
          <div className="flex md:hidden items-center gap-1.5 text-[11px] font-mono">
            <span
              className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${
                health.geminiConfigured
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
              }`}
            >
              G
            </span>
            <span
              className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${
                health.deepseekConfigured
                  ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
              }`}
            >
              DS
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Unified Chat / Skills Lab / Dual Synergy / Compare / Quiz) */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 text-xs md:text-sm font-medium overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'chat'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>الشات الموحد</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'skills'
                ? 'bg-gradient-to-r from-amber-600 to-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-4 h-4 text-amber-300" />
            <span>مكتبة المهارات</span>
          </button>

          <button
            onClick={() => setActiveTab('synergy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'synergy'
                ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>خط التكامل</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'compare'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>مقارنة حرة</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'media'
                ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-pink-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4 text-pink-300" />
            <span>استوديو الصور والفيديو</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-300" />
            <span>إحصائيات الاستهلاك</span>
          </button>

          <button
            onClick={() => setActiveTab('tactics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'tactics'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4 text-emerald-300" />
            <span>محلل التشكيلات والخطط ⚽</span>
          </button>

          <button
            onClick={() => setActiveTab('match-analysis')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'match-analysis'
                ? 'bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white shadow-md shadow-yellow-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span>تحليل المباريات والانتقالات</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>مختبر الاختبارات</span>
          </button>
        </div>

        {/* Engine Switcher & New Chat */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {activeTab === 'chat' && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setProvider('gemini')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  provider === 'gemini'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gemini</span>
              </button>

              <button
                onClick={() => setProvider('deepseek')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  provider === 'deepseek'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>DeepSeek</span>
              </button>
            </div>
          )}

          {activeTab === 'chat' && provider === 'deepseek' && (
            <select
              value={deepseekModel}
              onChange={(e) => setDeepseekModel(e.target.value as DeepSeekModel)}
              aria-label="اختر نموذج ديب سيك"
              className="bg-slate-900 border border-slate-800 text-cyan-300 text-xs rounded-lg px-2 py-1 outline-none focus:border-cyan-500"
            >
              <option value="deepseek-chat">Chat (V3)</option>
              <option value="deepseek-reasoner">Reasoner (R1)</option>
            </select>
          )}

          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold shadow-sm transition-all"
              title="تثبيت التطبيق على الهاتف بصيغة APK أو WebAPK"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>تطبيق APK</span>
            </button>
          )}

          <button
            onClick={onNewChat}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
            title="محادثة جديدة"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">جلسة جديدة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
