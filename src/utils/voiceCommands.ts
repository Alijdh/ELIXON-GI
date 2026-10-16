export interface VoiceCommandAction {
  type:
    | 'clear_chat'
    | 'new_chat'
    | 'set_provider_gemini'
    | 'set_provider_deepseek'
    | 'set_provider_synergy'
    | 'set_provider_dual'
    | 'toggle_web_search_on'
    | 'toggle_web_search_off'
    | 'navigate_media'
    | 'navigate_skills'
    | 'navigate_stats'
    | 'navigate_tactics'
    | 'navigate_chat'
    | 'tts_read_last'
    | 'tts_stop'
    | 'submit_prompt';
  feedbackMessage: string;
}

export const detectVoiceCommand = (text: string): VoiceCommandAction | null => {
  if (!text) return null;
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[.,?!،؟]/g, '')
    .replace(/\s+/g, ' ');

  // 1. Clear chat / امسح المحادثة
  if (
    /^(امسح|احذف|تفريغ|تصفية|مسح|حذف)\s*(المحادثة|الدردشة|الشات|الرسائل|كل شيء)$/i.test(normalized) ||
    /^(clear|delete)\s*(chat|messages|conversation)$/i.test(normalized)
  ) {
    return {
      type: 'clear_chat',
      feedbackMessage: '🧹 تم مسح المحادثة بنجاح',
    };
  }

  // 2. Start new conversation / محادثة جديدة
  if (
    /^(محادثة جديدة|شات جديد|جلسة جديدة|دردشة جديدة)$/i.test(normalized) ||
    /^(ابدأ|افتح|أنشئ|سوي|اعمل|بدء)\s*(محادثة|شات|جلسة|دردشة)\s*(جديدة)?$/i.test(normalized) ||
    /^(new chat|start new chat|new conversation)$/i.test(normalized)
  ) {
    return {
      type: 'new_chat',
      feedbackMessage: '✨ تم بدء محادثة جديدة',
    };
  }

  // 3. Switch to Gemini / غير النموذج إلى Gemini
  if (
    /(غير|حول|تبديل|بدل|استخدم|اختر)?\s*(النموذج|المحرك|المزود|الذكاء)?\s*(إلى|لـ)?\s*(gemini|جيميني|جوجل جيميني)/i.test(normalized) &&
    !normalized.includes('deepseek')
  ) {
    return {
      type: 'set_provider_gemini',
      feedbackMessage: '⚡ تم تغيير النموذج إلى Google Gemini',
    };
  }

  // 4. Switch to DeepSeek / غير النموذج إلى DeepSeek
  if (
    /(غير|حول|تبديل|بدل|استخدم|اختر)?\s*(النموذج|المحرك|المزود|الذكاء)?\s*(إلى|لـ)?\s*(deepseek|ديب سيك|ديبسيك)/i.test(normalized) &&
    !normalized.includes('gemini')
  ) {
    return {
      type: 'set_provider_deepseek',
      feedbackMessage: '🧠 تم تغيير النموذج إلى DeepSeek',
    };
  }

  // 5. Switch to Synergy / خط التكامل
  if (
    /(تفعيل|غير إلى|حول لـ|شغل)?\s*(خط التكامل|التكامل المزدوج|synergy|سينرجي)/i.test(normalized)
  ) {
    return {
      type: 'set_provider_synergy',
      feedbackMessage: '🛡️ تم تفعيل خط التكامل المزدوج (DeepSeek + Gemini)',
    };
  }

  // 6. Switch to Dual Compare / المقارنة
  if (
    /(وضع|شغل|غير إلى|افتح)?\s*(المقارنة|مقارنة حرة|المقارنة المزدوجة|dual compare)/i.test(normalized)
  ) {
    return {
      type: 'set_provider_dual',
      feedbackMessage: '⚖️ تم تفعيل وضع المقارنة المزدوجة',
    };
  }

  // 7. Enable Web Search / تفعيل بحث الويب
  if (
    /(تفعيل|شغل|افتح|ابحث في)\s*(بحث الويب|البحث في الويب|الويب|الإنترنت)/i.test(normalized) ||
    /^(enable web search|turn on search)$/i.test(normalized)
  ) {
    return {
      type: 'toggle_web_search_on',
      feedbackMessage: '🌐 تم تفعيل البحث المباشر في الويب',
    };
  }

  // 8. Disable Web Search / تعطيل بحث الويب
  if (
    /(تعطيل|إيقاف|اوقف|أغلق|اطفئ)\s*(بحث الويب|البحث في الويب)/i.test(normalized) ||
    /^(disable web search|turn off search)$/i.test(normalized)
  ) {
    return {
      type: 'toggle_web_search_off',
      feedbackMessage: '⚪ تم تعطيل بحث الويب',
    };
  }

  // 9. Navigation commands
  if (/(افتح|انتقل إلى|روح لـ|عرض)?\s*(استوديو الصور|استوديو الفيديو|الاستوديو|توليد الصور|توليد الفيديو)/i.test(normalized)) {
    return {
      type: 'navigate_media',
      feedbackMessage: '🎬 تم الانتقال إلى استوديو الصور والفيديو',
    };
  }

  if (/(افتح|انتقل إلى|روح لـ|عرض)?\s*(مكتبة المهارات|المهارات الذكية|المهارات)/i.test(normalized)) {
    return {
      type: 'navigate_skills',
      feedbackMessage: '🪄 تم الانتقال إلى مكتبة المهارات',
    };
  }

  if (/(افتح|انتقل إلى|روح لـ|عرض)?\s*(إحصائيات الاستهلاك|إحصائيات|الإحصائيات)/i.test(normalized)) {
    return {
      type: 'navigate_stats',
      feedbackMessage: '📊 تم الانتقال إلى إحصائيات الاستهلاك',
    };
  }

  if (/(افتح|انتقل إلى|روح لـ|عرض)?\s*(محلل التشكيلات|تحليل التشكيلة|تشكيلة بيس|خطط بيس|التشكيلات والخطط|بيس|efootball|فيفا|fifa)/i.test(normalized)) {
    return {
      type: 'navigate_tactics',
      feedbackMessage: '⚽ تم فتح محلل التشكيلات والخطط للألعاب',
    };
  }

  if (/(افتح|انتقل إلى|ارجع إلى|الرجوع إلى)?\s*(الدردشة|المحادثة|الشات)/i.test(normalized)) {
    return {
      type: 'navigate_chat',
      feedbackMessage: '💬 تم الرجوع إلى شاشة الدردشة',
    };
  }

  // 10. TTS Voice playback controls
  if (/(اقرأ|اقرا|اسمع|قراءة صوتية)\s*(آخر إجابة|اخر اجابة|الرد|الإجابة|النص)/i.test(normalized)) {
    return {
      type: 'tts_read_last',
      feedbackMessage: '🔊 جاري قراءة آخر إجابة بصوت مسموع',
    };
  }

  if (/^(اسكت|توقف|إيقاف الصوت|أوقف القراءة|توقف عن القراءة|stop|pause)$/i.test(normalized)) {
    return {
      type: 'tts_stop',
      feedbackMessage: '🔇 تم إيقاف القراءة الصوتية',
    };
  }

  // 11. Send / Submit prompt
  if (/^(إرسال|ارسل|أرسل|send)$/i.test(normalized)) {
    return {
      type: 'submit_prompt',
      feedbackMessage: '🚀 جاري إرسال الرسالة...',
    };
  }

  return null;
};
