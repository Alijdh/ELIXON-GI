import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  X,
  Clock,
  Sparkles,
  ChevronLeft,
  Zap,
  Smartphone,
} from 'lucide-react';
import { ChatSession } from '../types';

interface SessionsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onOpenInstallModal?: () => void;
  points: number;
  onRefillPoints: () => void;
}

export const SessionsSidebar: React.FC<SessionsSidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onOpenInstallModal,
  points,
  onRefillPoints,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = s.title.toLowerCase().includes(q);
    const matchesMessage = s.messages.some((m) => m.content.toLowerCase().includes(q));
    return matchesTitle || matchesMessage;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
      />

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 bg-slate-950 border-l border-slate-800/80 shadow-2xl flex flex-col transition-all duration-300 font-sans`}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">سجل المحادثات</h3>
              <p className="text-[11px] text-slate-400">حفظ سياق الجلسات والذاكرة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Session Action */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>بدء محادثة جديدة</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-cyan-500/60 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في المحادثات..."
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
            />
          </div>
        </div>

        {/* Consumption Stats Section */}
        <div className="px-4 py-4 border-t border-slate-800 space-y-3">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">إحصائيات الاستهلاك</h4>
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-400">الرصيد الحالي:</span>
              <span className="text-amber-400 font-bold">{points.toLocaleString()} نقطة</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (points / 1300) * 100)}%` }}></div>
            </div>
          </div>
          <button
            onClick={onRefillPoints}
            className="w-full py-2 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold hover:bg-amber-600/30 transition-all cursor-pointer"
          >
            إعادة تعيين رصيد الاستهلاك
          </button>
          <p className="text-[10px] text-slate-500 text-center">يتم إعادة تعيين الرصيد تلقائياً كل 5 ساعات.</p>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-500 text-xs">
              {searchQuery ? 'لا توجد جلسات تطابق البحث' : 'لا توجد محادثات سابقة حتى الآن'}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const dateStr = new Date(session.updatedAt).toLocaleDateString('ar-SA', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group relative p-3 rounded-xl border text-right cursor-pointer transition-all flex items-start justify-between gap-2 ${
                    isActive
                      ? 'bg-slate-900 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-950/40 border-transparent hover:bg-slate-900/60 hover:border-slate-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-xs font-bold truncate ${
                          isActive ? 'text-cyan-300' : 'text-slate-200'
                        }`}
                      >
                        {session.title || 'محادثة بدون عنوان'}
                      </span>
                    </div>

                    {(() => {
                      const sessionTokens = session.totalTokens || session.messages.reduce((acc, m) => acc + (m.tokenUsage?.totalTokens || Math.ceil(m.content.length / 3.5)), 0);
                      return (
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>{session.messages.length} رسائل</span>
                          <span>·</span>
                          <span className="text-amber-400/90 flex items-center gap-0.5 font-bold">
                            <Zap className="w-2.5 h-2.5 text-amber-400" />
                            {sessionTokens.toLocaleString()} T
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {dateStr}
                          </span>
                        </div>
                      );
                    })()}

                    {session.lastDomain && (
                      <span className="inline-block mt-1 text-[10px] text-emerald-400/80">
                        {session.lastDomain}
                      </span>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
                        onDeleteSession(session.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                    title="حذف المحادثة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Install App Button */}
        {onOpenInstallModal && (
          <div className="p-3 border-t border-slate-800/80">
            <button
              onClick={() => {
                onOpenInstallModal();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 hover:from-emerald-600/30 hover:to-cyan-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all shadow-sm"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>تثبيت التطبيق (Android APK)</span>
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 text-center font-mono">
          <span>سياق المحادثات محفوظ تلقائياً</span>
        </div>
      </aside>
    </>
  );
};
