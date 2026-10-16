export type AIProvider = 'gemini' | 'deepseek' | 'dual' | 'synergy';

export type GeminiModel = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';
export type DeepSeekModel = 'deepseek-chat' | 'deepseek-reasoner';

export type AppTab = 'chat' | 'skills' | 'compare' | 'quiz' | 'synergy' | 'media' | 'stats' | 'tactics' | 'match-analysis';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface WebSource {
  title: string;
  snippet: string;
  url?: string;
  domain?: string;
}

export interface ModelLatencies {
  gemini?: number;
  deepseek?: number;
  total?: number;
}

export interface AttachedFile {
  name: string;
  size: number;
  type: string;
  content: string;
  isText?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: 'gemini' | 'deepseek' | 'dual' | 'synergy';
  model?: string;
  reasoning?: string | null;
  detectedDomain?: string;
  sources?: WebSource[];
  searchQuery?: string;
  tokenUsage?: TokenUsage;
  timestamp: number;
  timeMs?: number;
  latencies?: ModelLatencies;
  attachedFile?: AttachedFile;
  dualComparison?: {
    gemini?: { text: string; timeMs?: number; error?: string; tokenUsage?: TokenUsage };
    deepseek?: { text: string; reasoning?: string | null; timeMs?: number; error?: string; tokenUsage?: TokenUsage };
  };
  synergyData?: {
    draft: string;
    auditCritique: string;
    finalAnswer: string;
    builderReasoning?: string | null;
    builderModel: string;
    auditorModel: string;
    tokenUsage?: TokenUsage;
    latencies?: ModelLatencies;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  lastDomain?: string;
  totalTokens?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface SynergyResult {
  prompt: string;
  domain: string;
  draft: string;
  builderReasoning?: string | null;
  auditCritique: string;
  finalAnswer: string;
  builderModel: string;
  auditorModel: string;
  sources?: WebSource[];
  searchQuery?: string;
  tokenUsage?: TokenUsage;
  timeMs: number;
  latencies?: ModelLatencies;
}

export interface SkillItem {
  id: string;
  title: string;
  category: string;
  categoryBadge: string;
  icon: string;
  description: string;
  promptTemplate: string;
  sampleInput?: string;
}

export interface KnowledgeDomain {
  id: string;
  name: string;
  icon: string;
  description: string;
  samplePrompt: string;
}
