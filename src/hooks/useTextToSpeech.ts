import { useState, useEffect, useCallback, useRef } from 'react';

// Helper to sanitize markdown into clean spoken text
export const sanitizeForSpeech = (markdown: string): string => {
  if (!markdown) return '';
  return markdown
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, 'تم تخطي مقطع الشيفرة البرمجية.')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove markdown headers #, ##, etc.
    .replace(/#{1,6}\s+/g, '')
    // Remove emphasis *, **, _, __, ~~
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    // Remove blockquotes >
    .replace(/^\s*>\s+/gm, '')
    // Remove bullet points / numbering
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Clean emojis & formatting boxes
    .replace(/[─│┌┐└┘├┤┬┴┼═║]/g, '')
    // Remove multiple newlines/spaces
    .replace(/\s+/g, ' ')
    .trim();
};

export const useTextToSpeech = () => {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
      return () => {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      };
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setSpeakingId(null);
    setIsPaused(false);
  }, []);

  const speak = useCallback(
    (text: string, id: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      // If already speaking this specific message, stop it
      if (speakingId === id) {
        stop();
        return;
      }

      // Stop any other currently playing speech
      try {
        window.speechSynthesis.cancel();
      } catch {}

      const cleanedText = sanitizeForSpeech(text);
      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utteranceRef.current = utterance;

      // Detect language (Arabic vs English)
      const hasArabic = /[\u0600-\u06FF]/.test(cleanedText);
      const targetLang = hasArabic ? 'ar' : 'en';

      utterance.lang = hasArabic ? 'ar-SA' : 'en-US';

      // Pick best matching voice from available voices
      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetLang));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setSpeakingId(id);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setSpeakingId(null);
        setIsPaused(false);
      };

      utterance.onerror = (e) => {
        console.warn('TTS playback notice:', e);
        setSpeakingId(null);
        setIsPaused(false);
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis playback notice:', err);
        setSpeakingId(null);
      }
    },
    [speakingId, stop, availableVoices]
  );

  return {
    speak,
    stop,
    speakingId,
    isSpeaking: Boolean(speakingId),
    isPaused,
    supported,
  };
};
