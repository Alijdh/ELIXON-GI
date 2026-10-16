import React, { useState } from 'react';
import { Download, FileText, FileCode, FileType } from 'lucide-react';
import { exportChat } from '../services/exportService';
import { ChatMessage } from '../types';

interface ChatExportMenuProps {
  messages: ChatMessage[];
}

export const ChatExportMenu: React.FC<ChatExportMenuProps> = ({ messages }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formats = [
    { id: 'pdf', label: 'PDF', icon: FileText },
    { id: 'txt', label: 'TXT', icon: FileText },
    { id: 'md', label: 'Markdown', icon: FileCode },
    { id: 'py', label: 'Python', icon: FileCode },
  ] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        title="تصدير المحادثة"
      >
        <Download className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                exportChat(messages, f.id);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
            >
              <f.icon className="w-4 h-4 text-cyan-400" />
              تصدير كـ {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
