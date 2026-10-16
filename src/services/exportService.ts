import { jsPDF } from 'jspdf';
import { ChatMessage } from '../types';

export const exportChat = (messages: ChatMessage[], format: 'pdf' | 'txt' | 'md' | 'py') => {
  const content = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  let blob: Blob;
  let filename = `chat_history.${format}`;

  switch (format) {
    case 'pdf':
      const doc = new jsPDF();
      doc.text(content, 10, 10, { maxWidth: 180 });
      blob = doc.output('blob');
      break;
    case 'txt':
      blob = new Blob([content], { type: 'text/plain' });
      break;
    case 'md':
      const mdContent = messages
        .map((m) => `### ${m.role.toUpperCase()}\n${m.content}`)
        .join('\n\n---\n\n');
      blob = new Blob([mdContent], { type: 'text/markdown' });
      break;
    case 'py':
      const pyContent = messages
        .map((m) => `# ${m.role.toUpperCase()}\n"""\n${m.content}\n"""`)
        .join('\n\n');
      blob = new Blob([pyContent], { type: 'text/x-python' });
      break;
    default:
      return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
