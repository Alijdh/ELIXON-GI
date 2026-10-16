import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { DualCompare } from './components/DualCompare';
import { QuizModule } from './components/QuizModule';
import { SynergyView } from './components/SynergyView';
import { SkillsSection } from './components/SkillsSection';
import { SessionsSidebar } from './components/SessionsSidebar';
import { InstallAppModal } from './components/InstallAppModal';
import { MediaStudio } from './components/MediaStudio';
import { StatsView } from './components/StatsView';
import { GameTacticsAnalyzer } from './components/GameTacticsAnalyzer';
import { MatchAnalysisSection } from './components/MatchAnalysisSection';
import { AIProvider, AppTab, AttachedFile, ChatMessage, ChatSession, DeepSeekModel, GeminiModel } from './types';

export default function App() {
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [geminiModel, setGeminiModel] = useState<GeminiModel>('gemini-3.8-flash');
  const [deepseekModel, setDeepseekModel] = useState<DeepSeekModel>('deepseek-chat');
  const [activeTab, setActiveTab] = useState<AppTab>('chat');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState('');

  // User Points & Tokens Wallet State (1300 points initial, 1 point = 500 tokens)
  const [userPoints, setUserPoints] = useState<number>(() => {
    const saved = localStorage.getItem('elixon_user_points');
    return saved ? parseInt(saved, 10) : 1300;
  });

  useEffect(() => {
    localStorage.setItem('elixon_user_points', userPoints.toString());
  }, [userPoints]);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('elixon_user_points');
      if (saved) setUserPoints(parseInt(saved, 10));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleRefillPoints = () => {
    setUserPoints(1300);
  };

  // Health state
  const [health, setHealth] = useState<{
    geminiConfigured: boolean;
    deepseekConfigured: boolean;
  }>({
    geminiConfigured: true,
    deepseekConfigured: true,
  });

  // Multiple Chat Sessions with LocalStorage Persistence
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('elixon_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      const oldMessages = localStorage.getItem('elixon_messages');
      const initialMsgs = oldMessages ? JSON.parse(oldMessages) : [];
      const defaultSession: ChatSession = {
        id: 'session-' + Date.now(),
        title: initialMsgs.length > 0 ? (initialMsgs[0].content.slice(0, 32) + '...') : 'المحادثة الأولى',
        messages: initialMsgs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return [defaultSession];
    } catch {
      return [{
        id: 'session-' + Date.now(),
        title: 'المحادثة الأولى',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('elixon_active_session_id');
      if (savedActive && sessions.some(s => s.id === savedActive)) {
        return savedActive;
      }
      return sessions[0]?.id || 'default';
    } catch {
      return sessions[0]?.id || 'default';
    }
  });

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elixon_sessions', JSON.stringify(sessions));
      localStorage.setItem('elixon_active_session_id', activeSessionId);
    } catch (e) {
      console.error('Failed to save sessions to localStorage', e);
    }
  }, [sessions, activeSessionId]);

  // Check health on load
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.providers) {
          setHealth({
            geminiConfigured: data.providers.gemini?.configured ?? true,
            deepseekConfigured: data.providers.deepseek?.configured ?? true,
          });
        }
      })
      .catch((err) => console.log('Health check note:', err));
  }, []);

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession ? currentSession.messages : [];

  // Create New Session
  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'محادثة جديدة',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveTab('chat');
  };

  // Clear Chat in Current Session
  const handleClearChat = () => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [], totalTokens: 0, updatedAt: Date.now() }
          : s
      )
    );
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const fresh: ChatSession = {
          id: 'session-' + Date.now(),
          title: 'محادثة جديدة',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Send Message with Multi-Turn Context, In-Chat Synergy, Web Search & File Analysis
  const handleSendMessage = async (
    prompt: string,
    useSynergy: boolean,
    useWebSearch: boolean = false,
    attachedFile?: AttachedFile
  ) => {
    const userEstimatedTokens = Math.max(1, Math.ceil((prompt.length + (attachedFile?.content?.length || 0)) / 3.5));
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      attachedFile,
      tokenUsage: {
        promptTokens: userEstimatedTokens,
        completionTokens: 0,
        totalTokens: userEstimatedTokens,
      },
      timestamp: Date.now(),
    };

    const isFirstMsg = messages.length === 0;
    const defaultTitle = prompt ? (prompt.length > 36 ? prompt.slice(0, 36) + '...' : prompt) : (attachedFile ? `تحليل: ${attachedFile.name}` : 'محادثة جديدة');
    const newTitle = isFirstMsg ? defaultTitle : currentSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: newTitle,
              messages: [...s.messages, userMsg],
              totalTokens: (s.totalTokens || 0) + userEstimatedTokens,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setLoading(true);
    const startTime = Date.now();

    try {
      if (useSynergy) {
        // Execute Collaborative Synergy Pipeline (DeepSeek Builder + Gemini Auditor)
        const response = await fetch('/api/synergy/pipeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            history: messages.slice(-10),
            useWebSearch,
            attachedFile,
          }),
        });

        if (!response.ok) {
          throw new Error('فشل خط التكامل المزدوج');
        }

        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.finalAnswer,
          provider: 'synergy',
          model: 'DeepSeek + Gemini',
          detectedDomain: data.domain,
          searchQuery: data.searchQuery,
          tokenUsage: data.tokenUsage,
          timeMs: data.timeMs || (Date.now() - startTime),
          latencies: data.latencies,
          synergyData: {
            draft: data.draft,
            auditCritique: data.auditCritique,
            finalAnswer: data.finalAnswer,
            builderReasoning: data.builderReasoning,
            builderModel: data.builderModel,
            auditorModel: data.auditorModel,
            tokenUsage: data.tokenUsage,
            latencies: data.latencies,
          },
          timestamp: Date.now(),
        };

        const addedTokens = data.tokenUsage?.totalTokens || Math.ceil(data.finalAnswer.length / 3.5);

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  lastDomain: data.domain,
                  messages: [...s.messages, assistantMsg],
                  totalTokens: (s.totalTokens || 0) + addedTokens,
                  updatedAt: Date.now(),
                }
              : s
          )
        );
      } else if (provider === 'gemini') {
        // Gemini
        const isInfoTopic = /انتقالات|نتيجة مباراة|أخبار رياضية|سعر|حالة الطقس/i.test(prompt);
        const finalUseWebSearch = useWebSearch || isInfoTopic;

        const response = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: finalUseWebSearch 
                ? `${prompt}\n\n[تعليمات حاسمة]: عند جلب المعلومات من الويب، لا تذكر المصادر الخارجية أو الروابط إطلاقاً. قدم الحقائق مباشرة كمعلومات علمية.`
                : prompt,
            model: geminiModel,
            history: messages.slice(-12),
            useWebSearch: finalUseWebSearch,
            attachedFile,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'فشل الاتصال بـ Gemini API');
        }

        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.text,
          provider: 'gemini',
          model: data.model,
          detectedDomain: data.detectedDomain,
          searchQuery: data.searchQuery,
          tokenUsage: data.tokenUsage,
          timestamp: Date.now(),
          timeMs: data.timeMs || (Date.now() - startTime),
          latencies: data.latencies,
        };

        const addedTokens = data.tokenUsage?.totalTokens || Math.ceil(data.text.length / 3.5);

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  lastDomain: data.detectedDomain,
                  messages: [...s.messages, assistantMsg],
                  totalTokens: (s.totalTokens || 0) + addedTokens,
                  updatedAt: Date.now(),
                }
              : s
          )
        );

        // Deduct points (1 point = 500 tokens)
        setUserPoints(prev => Math.max(0, prev - Math.max(1, Math.floor(addedTokens / 500))));
      } else {
        // DeepSeek
        const response = await fetch('/api/deepseek/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            model: deepseekModel,
            history: messages.slice(-12),
            useWebSearch,
            attachedFile,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'فشل الاتصال بـ DeepSeek API');
        }

        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.text,
          provider: 'deepseek',
          model: data.model,
          reasoning: data.reasoning,
          detectedDomain: data.detectedDomain,
          searchQuery: data.searchQuery,
          tokenUsage: data.tokenUsage,
          timestamp: Date.now(),
          timeMs: data.timeMs || (Date.now() - startTime),
          latencies: data.latencies,
        };

        const addedTokens = data.tokenUsage?.totalTokens || Math.ceil(data.text.length / 3.5);

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  lastDomain: data.detectedDomain,
                  messages: [...s.messages, assistantMsg],
                  totalTokens: (s.totalTokens || 0) + addedTokens,
                  updatedAt: Date.now(),
                }
              : s
          )
        );

        // Deduct points (1 point = 500 tokens)
        setUserPoints(prev => Math.max(0, prev - Math.max(1, Math.floor(addedTokens / 500))));
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **تنبيه:**\n${error.message}\n\nيرجى المحاولة مرة أخرى أو تفعيل التدقيق المزدوج.`,
        provider,
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [...s.messages, errorMsg],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSkill = (template: string) => {
    setPendingPrompt(template);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200" dir="rtl">
      {/* Low Points Warning Banner */}
      {userPoints < 100 && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-lg z-40">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>تنبيه: رصيد نقاطك قارب على الانتهاء ({userPoints} نقطة متبقية)! يرجى شحن رصيدك لتجنب توقف الخدمات الذكية.</span>
          </div>
          <button
            onClick={handleRefillPoints}
            className="px-3 py-1 rounded-lg bg-white text-rose-900 font-extrabold hover:bg-slate-100 transition-colors shadow"
          >
            شحن الرصيد الآن (+1300 نقطة)
          </button>
        </div>
      )}

      {/* Sessions Sidebar Drawer */}
      <SessionsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        points={userPoints}
        onRefillPoints={handleRefillPoints}
      />

      {/* Top Navigation */}
      <Header
        provider={provider}
        setProvider={setProvider}
        geminiModel={geminiModel}
        setGeminiModel={setGeminiModel}
        deepseekModel={deepseekModel}
        setDeepseekModel={setDeepseekModel}
        onNewChat={handleNewSession}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        health={health}
        points={userPoints}
        onRefillPoints={handleRefillPoints}
      />

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'chat' && (
          <ChatArea
            messages={messages}
            loading={loading}
            onSendMessage={handleSendMessage}
            provider={provider}
            setProvider={setProvider}
            onNewChat={handleNewSession}
            onClearChat={handleClearChat}
            onNavigateTab={setActiveTab}
            onOpenSkills={() => setActiveTab('skills')}
            onOpenMedia={() => setActiveTab('media')}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            sessionTitle={currentSession?.title}
            initialPrompt={pendingPrompt}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsSection onSelectSkill={handleSelectSkill} />
        )}

        {activeTab === 'synergy' && <SynergyView />}

        {activeTab === 'compare' && <DualCompare />}

        {activeTab === 'media' && (
          <div className="flex-1 overflow-y-auto">
            <MediaStudio />
          </div>
        )}

        {activeTab === 'quiz' && <QuizModule />}

        {activeTab === 'stats' && <StatsView />}
        {activeTab === 'tactics' && <GameTacticsAnalyzer />}
        {activeTab === 'match-analysis' && <MatchAnalysisSection />}
      </main>
    </div>
  );
}
