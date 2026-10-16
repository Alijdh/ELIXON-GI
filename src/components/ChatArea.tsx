import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  Brain,
  Mic,
  MicOff,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Globe,
  X,
  Zap,
  ShieldCheck,
  Wand2,
  Paperclip,
  FileCode,
  FileText,
  Gauge,
  UploadCloud,
  Film,
  Download,
  Volume2,
  VolumeX,
  AlertCircle,
  Command,
} from 'lucide-react';
import { ChatMessage, AIProvider, AttachedFile, AppTab } from '../types';
import { FormattedContent } from './FormattedContent';
import { LatencyHUD } from './LatencyHUD';
import { ChatExportMenu } from './ChatExportMenu';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { detectVoiceCommand } from '../utils/voiceCommands';

interface ChatAreaProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (
    prompt: string,
    useSynergy: boolean,
    useWebSearch: boolean,
    attachedFile?: AttachedFile
  ) => void;
  provider: AIProvider;
  setProvider?: (provider: AIProvider) => void;
  onNewChat?: () => void;
  onClearChat?: () => void;
  onNavigateTab?: (tab: AppTab) => void;
  onOpenSkills?: () => void;
  onOpenMedia?: () => void;
  onOpenSidebar?: () => void;
  sessionTitle?: string;
  initialPrompt?: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  loading,
  onSendMessage,
  provider,
  setProvider,
  onNewChat,
  onClearChat,
  onNavigateTab,
  onOpenSkills,
  onOpenMedia,
  initialPrompt = '',
}) => {
  const [input, setInput] = useState(initialPrompt);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [speechLang, setSpeechLang] = useState<'ar-SA' | 'en-US'>('ar-SA');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [useSynergyInChat, setUseSynergyInChat] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [showVoiceCommandsHelp, setShowVoiceCommandsHelp] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      inputRef.current?.focus();
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle local file reading
  const processSelectedFile = (file: File) => {
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('حجم الملف كبير جداً. يرجى اختيار ملف أصغر من 8 ميغابايت.');
      return;
    }

    const reader = new FileReader();
    const isText =
      file.type.startsWith('text/') ||
      file.type.includes('json') ||
      file.type.includes('javascript') ||
      file.type.includes('xml') ||
      /\.(py|js|jsx|ts|tsx|html|css|json|md|txt|csv|sql|java|c|cpp|h|hpp|sh|yaml|yml|xml|env|log|rs|go|php|rb)$/i.test(
        file.name
      );

    if (isText) {
      reader.onload = (e) => {
        const textContent = (e.target?.result as string) || '';
        setAttachedFile({
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          content: textContent,
          isText: true,
        });
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '';
        setAttachedFile({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          content: dataUrl,
          isText: false,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    // reset input
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isListening) {
      stopListening();
    }
    stopTts();
    if ((!input.trim() && !attachedFile) || loading) return;
    const text = input.trim();
    const fileToSend = attachedFile;
    setInput('');
    setAttachedFile(null);
    resetTranscript();
    
    // Media analysis/enhancement
    let finalPrompt = text;
    if (fileToSend && !fileToSend.isText) {
      try {
        const analyzeRes = await fetch('/api/media/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `تحليل وتحسين الصورة/الفيديو: ${text || 'حلل هذه الوسائط وحسن جودتها.'}`,
            base64Media: fileToSend.content,
            mimeType: fileToSend.type,
          }),
        });
        const analyzeData = await analyzeRes.json();
        if (analyzeRes.ok) {
          finalPrompt = `تحليل الوسائط: ${analyzeData.analysis}\n\nسؤال المستخدم الأصلي: ${text}`;
        }
      } catch (e) {
        console.error('Media analysis failed:', e);
      }
    }

    onSendMessage(finalPrompt, useSynergyInChat, useWebSearch, fileToSend || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReasoning = (id: string) => {
    setExpandedReasoning((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Hook for Voice Dictation
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    errorType: speechErrorType,
    startListening,
    stopListening,
    requestMicrophonePermission,
    clearError: clearSpeechError,
    resetTranscript,
  } = useSpeechRecognition(speechLang);

  // Hook for Text to Speech (TTS)
  const { speak, stop: stopTts, speakingId } = useTextToSpeech();

  useEffect(() => {
    if (transcript) {
      const command = detectVoiceCommand(transcript);
      if (command) {
        setCommandFeedback(command.feedbackMessage);
        const timer = setTimeout(() => setCommandFeedback(null), 4000);

        switch (command.type) {
          case 'clear_chat':
            onClearChat?.();
            break;
          case 'new_chat':
            onNewChat?.();
            break;
          case 'set_provider_gemini':
            setProvider?.('gemini');
            break;
          case 'set_provider_deepseek':
            setProvider?.('deepseek');
            break;
          case 'set_provider_synergy':
            setProvider?.('synergy');
            break;
          case 'set_provider_dual':
            setProvider?.('dual');
            break;
          case 'toggle_web_search_on':
            setUseWebSearch(true);
            break;
          case 'toggle_web_search_off':
            setUseWebSearch(false);
            break;
          case 'navigate_media':
            if (onNavigateTab) onNavigateTab('media');
            else onOpenMedia?.();
            break;
          case 'navigate_skills':
            if (onNavigateTab) onNavigateTab('skills');
            else onOpenSkills?.();
            break;
          case 'navigate_stats':
            onNavigateTab?.('stats');
            break;
          case 'navigate_tactics':
            onNavigateTab?.('tactics');
            break;
          case 'navigate_chat':
            onNavigateTab?.('chat');
            break;
          case 'tts_read_last':
            for (let i = messages.length - 1; i >= 0; i--) {
              if (messages[i].role === 'assistant') {
                speak(messages[i].content, messages[i].id);
                break;
              }
            }
            break;
          case 'tts_stop':
            stopTts();
            break;
          case 'submit_prompt':
            if (input.trim() || attachedFile) {
              handleSubmit();
            }
            break;
        }
      } else {
        setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      }
      resetTranscript();
    }
  }, [
    transcript,
    resetTranscript,
    onClearChat,
    onNewChat,
    setProvider,
    onNavigateTab,
    onOpenMedia,
    onOpenSkills,
    messages,
    speak,
    stopTts,
    input,
    attachedFile,
  ]);

  const toggleSpeechRecognition = () => {
    stopTts();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const multiDomainPrompts = [
    { label: 'سؤال عام وحوار طبيعي 👋', prompt: 'مرحباً، كيف حالك؟ حدثني عن نفسك وما الذي يمكنك مساعدتي به.' },
    { label: 'البحث في الويب واستنتاج الأخبار 🌐', prompt: 'ابحث في الإنترنت ولخص لي أهم المستجدات العلمية والتقنية اليوم واستنتج الاتجاه العام دون ذكر مصادر.' },
    { label: 'طلب برمجي دقيق 💻', prompt: 'اكتب كود بايثون لرسم شكل قلب تدريجياً بسرعة 1.5 باستخدام السلحفاة مع الشرح.' },
    { label: 'العلوم والطب 🔬', prompt: 'اشرح الآلية الحيوية لعمل اللقاحات القائمة على mRNA وتفاعل الجهاز المناعي الخلوي معها.' },
  ];

  // Dynamic token calculation across current session
  const sessionTokenStats = useMemo(() => {
    let promptTokens = 0;
    let completionTokens = 0;
    for (const msg of messages) {
      if (msg.tokenUsage) {
        promptTokens += msg.tokenUsage.promptTokens || 0;
        completionTokens += msg.tokenUsage.completionTokens || 0;
      } else {
        const est = Math.max(1, Math.ceil(msg.content.length / 3.5));
        if (msg.role === 'user') promptTokens += est;
        else completionTokens += est;
      }
    }
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }, [messages]);

  // Last assistant message's latency for header status
  const lastAssistantMsg = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        return messages[i];
      }
    }
    return null;
  }, [messages]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full max-w-5xl mx-auto w-full px-2 md:px-4 relative transition-colors ${
        isDragging ? 'bg-cyan-950/20' : ''
      }`}
    >
      {/* Drag & drop overlay indicator */}
      {isDragging && (
        <div className="absolute inset-0 z-50 rounded-2xl border-2 border-dashed border-cyan-400 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none text-center">
          <UploadCloud className="w-16 h-16 text-cyan-400 animate-bounce mb-3" />
          <h3 className="text-xl font-bold text-white mb-1">أفلت الملف هنا للإرفاق والتحليل</h3>
          <p className="text-sm text-cyan-300">سيتم فحص الكود أو المستند وتصحيح أي أخطاء وتقديم تقرير كامل</p>
        </div>
      )}

      {/* Session Header Bar: Token Counter & Active Controls & Latest Latency */}
      <div className="pt-2 pb-1">
        <div className="py-2 px-3 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 shadow-sm">
          {/* Live Token Usage Counter */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs shadow-xs"
              title="إجمالي الرموز (Tokens) المحسوبة في هذه المحادثة حتى الآن"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span className="font-bold">{sessionTokenStats.totalTokens.toLocaleString()}</span>
              <span className="text-[11px] text-amber-200/70">رمز (Token)</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>
                مدخلات: <strong className="text-slate-200">{sessionTokenStats.promptTokens.toLocaleString()}</strong>
              </span>
              <span>·</span>
              <span>
                مخرجات: <strong className="text-slate-200">{sessionTokenStats.completionTokens.toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Quick Active Controls & Latency Monitor */}
          <div className="flex items-center gap-2">
            <ChatExportMenu messages={messages} />
            {lastAssistantMsg?.timeMs && (
              <div
                className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-300"
                title={`سرعة استجابة آخر معالجة: ${lastAssistantMsg.timeMs}ms`}
              >
                <Gauge className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-400 text-[10px]">آخر معالجة:</span>
                <span className="text-cyan-300 font-bold">{(lastAssistantMsg.timeMs / 1000).toFixed(2)}s</span>
              </div>
            )}

            {/* Web search toggle button */}
            <button
              onClick={() => setUseWebSearch(!useWebSearch)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                useWebSearch
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
              title="البحث المباشر في الويب واستنتاج الإجابة مباشرة دون ذكر مصادر"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>البحث في الويب</span>
              {useWebSearch && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>}
            </button>

            {/* Synergy toggle */}
            <button
              onClick={() => setUseSynergyInChat(!useSynergyInChat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                useSynergyInChat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
              title="تفعيل خط التكامل المزدوج (DeepSeek للبناء + Gemini للفحص والتدقيق)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>تدقيق Synergy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scrollable List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 px-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-12">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center mb-5 shadow-2xl">
              <Bot className="w-8 h-8 md:w-10 md:h-10 text-cyan-400 animate-pulse" />
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              مرحباً بك في <span className="text-cyan-400">ELIXON-GI</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-lg mb-8 leading-relaxed">
              رفيقك الذكي الذي يتحدث بأسلوب بشري طبيعي، يدعم فحص الملفات وتصحيحها، والبحث المباشر في الويب مع قياس سرعة
              الاستجابة (Latency) لكل نموذج:
            </p>

            {/* Quick Multi-Domain Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-right">
              {multiDomainPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(item.prompt, useSynergyInChat, useWebSearch)}
                  className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-right transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">{item.label}</span>
                    <span className="text-[10px] text-slate-500 group-hover:text-cyan-400 font-mono">بدء ←</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.prompt}</p>
                </button>
              ))}
            </div>

            {onOpenMedia && (
              <div className="mt-5 flex items-center justify-center">
                <button
                  onClick={onOpenMedia}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-950/60 via-purple-950/60 to-indigo-950/60 hover:from-pink-900/60 hover:to-indigo-900/60 border border-pink-500/40 text-pink-200 text-xs font-bold flex items-center gap-2.5 shadow-lg shadow-pink-500/10 transition-all group"
                >
                  <Film className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span>جديد: جرّب استوديو إنشاء الصور والفيديوهات بالذكاء الاصطناعي (Veo & Vision)</span>
                  <span className="text-[10px] text-pink-400 font-mono">فتح الاستوديو ←</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} transition-all`}
            >
              {/* Message Header & Meta Badges */}
              <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400 px-1 font-mono">
                {message.role === 'user' ? (
                  <div className="flex items-center gap-2">
                    <span>أنت</span>
                    {message.tokenUsage && (
                      <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-cyan-400" />
                        {message.tokenUsage.totalTokens.toLocaleString()} T
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center flex-wrap gap-2">
                    {message.provider === 'synergy' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        تكامل مزدوج (بناء + فحص)
                      </span>
                    ) : message.provider === 'gemini' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <Sparkles className="w-3 h-3" />
                        Gemini Engine
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold">
                        <Bot className="w-3 h-3" />
                        DeepSeek Engine
                      </span>
                    )}

                    {/* Auto-Detected Domain Badge */}
                    {message.detectedDomain && (
                      <span className="text-slate-400 font-sans flex items-center gap-1 text-[11px]">
                        <span>·</span>
                        <span className="text-cyan-300/90 font-medium">المجال: {message.detectedDomain}</span>
                      </span>
                    )}

                    {/* Per-Message Token Usage Badge */}
                    {message.tokenUsage && (
                      <span
                        className="text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded-md flex items-center gap-1"
                        title={`المدخلات: ${message.tokenUsage.promptTokens} | المخرجات: ${message.tokenUsage.completionTokens} | الإجمالي: ${message.tokenUsage.totalTokens}`}
                      >
                        <Zap className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                        <span className="font-semibold">{message.tokenUsage.totalTokens.toLocaleString()} رمز</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Message Card */}
              <div
                className={`rounded-2xl p-4 md:p-5 max-w-[92%] md:max-w-[85%] shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-bl-sm'
                }`}
              >
                {/* Attached File Display in User Message */}
                {message.attachedFile && (
                  <div className="mb-3 p-2.5 rounded-xl bg-slate-950/50 border border-white/20 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      {message.attachedFile.isText ? (
                        <FileCode className="w-4 h-4 text-cyan-300 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-emerald-300 shrink-0" />
                      )}
                      <span className="font-mono font-bold text-white truncate max-w-[200px]">
                        {message.attachedFile.name}
                      </span>
                      <span className="text-[10px] text-cyan-200/70 font-mono">
                        ({(message.attachedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      مرفق للتحليل
                    </span>
                  </div>
                )}

                {/* DeepSeek Reasoning if available */}
                {message.reasoning && (
                  <div className="mb-3 rounded-xl border border-indigo-900/50 bg-indigo-950/40 p-2.5">
                    <button
                      onClick={() => toggleReasoning(message.id)}
                      className="w-full flex items-center justify-between text-xs text-indigo-300 font-semibold hover:text-indigo-200 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
                        <span>سلسلة التفكير المنطقي (Chain of Thought)</span>
                      </div>
                      {expandedReasoning[message.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedReasoning[message.id] && (
                      <div className="mt-2.5 pt-2.5 border-t border-indigo-900/40 text-xs text-indigo-200/80 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                        {message.reasoning}
                      </div>
                    )}
                  </div>
                )}

                {/* Formatted Text Content */}
                <FormattedContent content={message.content} />

                {/* Latency Dashboard Widget (Speed of Response for Gemini & DeepSeek) */}
                {message.role === 'assistant' && (
                  <LatencyHUD
                    latencies={message.latencies}
                    timeMs={message.timeMs}
                    provider={message.provider}
                    modelName={message.model}
                  />
                )}

                {/* Card Footer */}
                {message.role === 'assistant' && (
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/70 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyMessage(message.content, message.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {copiedId === message.id ? (
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

                      <span className="text-slate-700">·</span>

                      {/* Text-to-Speech (TTS) Button */}
                      <button
                        type="button"
                        onClick={() => speak(message.content, message.id)}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
                          speakingId === message.id
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                            : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
                        }`}
                        title={speakingId === message.id ? 'إيقاف القراءة الصوتية' : 'قراءة الإجابة بصوت مسموع (Text-to-Speech)'}
                      >
                        {speakingId === message.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span className="text-amber-300 font-semibold">إيقاف القراءة</span>
                            <span className="flex items-center gap-0.5 mr-0.5">
                              <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                              <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                              <span className="w-1 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                            </span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>قراءة صوتية</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {message.tokenUsage && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {message.tokenUsage.totalTokens} Tokens
                        </span>
                      )}
                      <span className="text-[10px] text-slate-600 font-mono">رد ذكي منظم</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-md">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="font-semibold text-slate-200">
                  {useSynergyInChat
                    ? 'جاري البناء بواسطة DeepSeek والتدقيق بواسطة Gemini...'
                    : useWebSearch
                    ? 'جاري استيعاب الحقائق من الويب وتوليد الجواب المنظم...'
                    : 'جاري صياغة الرد الذكي وحساب مؤشرات السرعة (Latency)...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="py-3 space-y-2">
        {/* System Command Feedback Toast */}
        {commandFeedback && (
          <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950 via-teal-950 to-cyan-950 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center justify-between gap-3 shadow-xl animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300">
                <Command className="w-4 h-4" />
              </span>
              <span>أمر صوتي تم تنفيذه: {commandFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setCommandFeedback(null)}
              className="p-1 rounded-md text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition-colors"
              title="إغلاق"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Microphone Error / Permission Alert Banner */}
        {speechError && (
          <div className="px-4 py-2.5 rounded-xl bg-rose-950/90 border border-rose-800/80 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{speechError}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {speechErrorType === 'not-allowed' && (
                <button
                  type="button"
                  onClick={async () => {
                    const granted = await requestMicrophonePermission();
                    if (granted) {
                      startListening();
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  طلب الإذن مجدداً
                </button>
              )}
              <button
                type="button"
                onClick={clearSpeechError}
                className="p-1 rounded-md text-rose-300 hover:text-white hover:bg-rose-900/60 transition-colors"
                title="إغلاق التنبيه"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Voice Dictation Live Banner */}
        {isListening && (
          <div className="px-4 py-2.5 rounded-xl bg-cyan-950/90 border border-cyan-800/80 flex items-center justify-between gap-3 shadow-lg animate-pulse">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="w-1 bg-cyan-400 rounded-full animate-[bounce_0.6s_infinite] h-3"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite] h-5"></span>
                <span className="w-1 bg-indigo-400 rounded-full animate-[bounce_0.5s_infinite] h-2"></span>
              </div>

              <span className="text-xs text-slate-200 truncate">
                {interimTranscript || 'تحدث الآن، جاري تحويل صوتك إلى نص...'}
              </span>
            </div>

            <button
              onClick={stopListening}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold"
            >
              إنهاء
            </button>
          </div>
        )}

        {/* Quick Features Toolbar: Web Search Toggle, Synergy Toggle, Skills */}
        <div className="flex items-center justify-between px-1 text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {/* Live Web Search Toggle */}
            <button
              type="button"
              onClick={() => setUseWebSearch(!useWebSearch)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all border text-xs font-semibold ${
                useWebSearch
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/70 shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="تفعيل البحث في الويب بدون ذكر مصادر"
            >
              <Globe className={`w-3.5 h-3.5 ${useWebSearch ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
              <span>بحث الويب</span>
              <span
                className={`text-[10px] px-1 rounded font-mono ${
                  useWebSearch ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {useWebSearch ? 'مفعّل' : 'معطّل'}
              </span>
            </button>

            {/* Synergy Toggle */}
            <button
              type="button"
              onClick={() => setUseSynergyInChat(!useSynergyInChat)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all border text-xs font-semibold ${
                useSynergyInChat
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/70 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="يقوم DeepSeek بالبناء وGemini بالتدقيق والفحص"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${useSynergyInChat ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>التدقيق المزدوج</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Commands Guide Button */}
            <button
              type="button"
              onClick={() => setShowVoiceCommandsHelp(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-slate-800 transition-colors font-medium text-xs"
              title="دليل الأوامر الصوتية للنظام"
            >
              <Command className="w-3.5 h-3.5 text-cyan-400" />
              <span>أوامر صوتية 🎙️</span>
            </button>

            {/* Open Skills toolkit */}
            {onOpenSkills && (
              <button
                type="button"
                onClick={onOpenSkills}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-800 transition-colors font-medium"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span>مكتبة المهارات</span>
              </button>
            )}
          </div>
        </div>

        {/* Input Form with Attachment Button, Microphone & Send */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-2.5 focus-within:border-cyan-500/70 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all shadow-xl">
            {/* Attached File Chip (if any) */}
            {attachedFile && (
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-xs text-cyan-200 animate-fadeIn">
                <div className="flex items-center gap-2 truncate">
                  {attachedFile.isText ? (
                    <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="font-semibold truncate max-w-[240px] font-mono">{attachedFile.name}</span>
                  <span className="text-[10px] text-cyan-400/80 font-mono">
                    ({(attachedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <span className="text-[10px] bg-cyan-900/90 text-cyan-200 px-2 py-0.5 rounded-md font-sans">
                    جاهز للتحليل والتصحيح
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 rounded-md text-cyan-400 hover:text-rose-400 hover:bg-cyan-900/60 transition-colors"
                  title="إلغاء المرفق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
                accept=".py,.js,.jsx,.ts,.tsx,.html,.css,.json,.txt,.md,.csv,.sql,.java,.c,.cpp,.h,.hpp,.sh,.yaml,.yml,.xml,.pdf,image/*"
              />

              {/* Seamless Attach File Button (No special mode, just attach!) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-xl transition-colors flex items-center justify-center shrink-0 ${
                  attachedFile
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
                title="إرفاق ملف (كود بايثون، سكربت، مستند، نص) للتحليل وتصحيح الأخطاء"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  attachedFile
                    ? 'اكتب طلبك حول الملف (مثال: صحح الأخطاء، اشرح الكود، طور الميزة...) أو اضغط إرسال للتحليل الفوري...'
                    : isListening
                    ? 'جاري تدوين صوتك... تحدث الآن...'
                    : useWebSearch
                    ? 'اكتب سؤالك للبحث المباشر في الويب واستنتاج الجواب المنظم...'
                    : 'تحدث بطبيعية، اسأل في أي مجال، أرفق ملفاً لتصحيحه، أو اطلب كوداً...'
                }
                rows={1}
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base resize-none outline-none py-1.5 px-2 max-h-36 min-h-[40px]"
              />

              {/* Language toggle for mic */}
              <button
                type="button"
                onClick={() => {
                  const nextLang = speechLang === 'ar-SA' ? 'en-US' : 'ar-SA';
                  setSpeechLang(nextLang);
                  if (isListening) stopListening();
                }}
                className="p-2 rounded-xl text-xs font-mono font-bold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors flex items-center gap-1 shrink-0"
                title={`لغة الإملاء: ${speechLang === 'ar-SA' ? 'عربي' : 'EN'}`}
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{speechLang === 'ar-SA' ? 'عربي' : 'EN'}</span>
              </button>

              {/* Microphone Button with Web Speech API */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`relative p-3 rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 ring-4 ring-rose-500/30 animate-pulse'
                    : 'bg-slate-800/80 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
                title={isListening ? 'إيقاف الاستماع' : 'إملاء صوتي بالمايكروفون (Web Speech API)'}
                aria-label="Microphone Voice Input"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 text-white" />
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span className="text-xs font-bold hidden sm:inline">تحدث</span>
                  </>
                )}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!input.trim() && !attachedFile && !interimTranscript) || loading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center shrink-0"
                title="إرسال"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 font-mono">
          <span>إرفاق الملفات والسحب والإفلات مدعوم مباشرة 📎</span>
          <span>• قياس زمن الاستجابة (Latency) لكل نموذج نشط ⚡ •</span>
          <span>Shift + Enter لسطر جديد</span>
        </div>
      </div>

      {/* Voice Commands Guide Modal */}
      {showVoiceCommandsHelp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Command className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">دليل أوامر النظام الصوتية المباشرة</h3>
                  <p className="text-[11px] text-slate-400">تحدث بالمايكروفون بهذه العبارات للتحكم بالنظام مباشرة دون الحاجة للكتابة:</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVoiceCommandsHelp(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs max-h-[70vh] overflow-y-auto">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>🧹 إدارة المحادثات</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono">"امسح المحادثة"</div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono">"ابدأ محادثة جديدة"</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <span>🧠 تبديل النماذج الذكية</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono">"غير النموذج إلى Gemini"</div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono">"غير النموذج إلى DeepSeek"</div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono">"تفعيل خط التكامل"</div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono">"المقارنة المزدوجة"</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>🌐 الإنترنت والبحث</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono">"تفعيل بحث الويب"</div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono">"تعطيل بحث الويب"</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>🔊 الصوت والتنقل السريع</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono">"اقرأ آخر إجابة"</div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono">"إيقاف الصوت" / "اسكت"</div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono">"افتح الاستوديو"</div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono">"إرسال"</div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <span>أي كلام آخر لا يطابق أمراً يتم كتابته كنص عادي في الشات.</span>
              <button
                type="button"
                onClick={() => setShowVoiceCommandsHelp(false)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors shadow-sm"
              >
                فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
