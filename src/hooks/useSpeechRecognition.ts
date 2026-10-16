import { useState, useRef, useEffect, useCallback } from 'react';

export const useSpeechRecognition = (lang: string = 'ar-SA') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'not-allowed' | 'unsupported' | 'network' | 'other' | null>(null);
  const recognitionRef = useRef<any>(null);

  // Explicitly prompt the user for microphone access via getUserMedia
  const requestMicrophonePermission = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setError(null);
        setErrorType(null);
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn('Microphone permission status:', err?.name || err?.message || 'denied');
      setError('تم حظر الوصول إلى المايكروفون. يرجى تفعيل إذن المايكروفون من إعدادات المتصفح أو رمز القفل في شريط العنوان.');
      setErrorType('not-allowed');
      return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setErrorType(null);

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setError('متصفحك الحالي لا يدعم ميزة الإملاء الصوتي (Web Speech API). يرجى تجربة متصفح حديث مثل Chrome أو Edge.');
      setErrorType('unsupported');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setErrorType(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => (prev ? prev + ' ' + t : t));
          } else {
            currentInterim += t;
          }
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        // Use console.warn to handle non-fatal user permission denials gracefully
        console.warn('Speech recognition status:', event?.error);
        setIsListening(false);
        setInterimTranscript('');

        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          setError('تم رفض أو حظر إذن المايكروفون. انقر على أيقونة القفل أو الأذونات في شريط العنوان للسماح بالمايكروفون ثم حاول مجدداً.');
          setErrorType('not-allowed');
        } else if (event?.error === 'no-speech') {
          // Softly ignored to avoid annoying user
        } else if (event?.error === 'network') {
          setError('تعذر الاتصال بخدمة التعرف على الصوت. تحقق من اتصال الإنترنت.');
          setErrorType('network');
        } else {
          setError(`تنبيه أثناء الاستماع: ${event?.error}`);
          setErrorType('other');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition initialization notice:', err?.message);
      setIsListening(false);
      setError('تعذر بدء المايكروفون. يرجى التأكد من توصيل المايكروفون وتفعيل الأذونات.');
      setErrorType('other');
    }
  }, [lang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    errorType,
    startListening,
    stopListening,
    requestMicrophonePermission,
    clearError,
    resetTranscript,
  };
};
