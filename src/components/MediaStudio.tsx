import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Film,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Upload,
  X,
  Play,
  Maximize2,
  Wand2,
  Sliders,
  Layers,
  Clock,
  AlertCircle,
  Eye,
  Camera,
  Video,
  Scissors,
} from 'lucide-react';
import { MediaEditor } from './MediaEditor';

type StudioMode = 'images' | 'videos' | 'editor';
type ImageSubMode = 'text-to-image' | 'edit-image';

interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  model: string;
  aspectRatio: string;
  timestamp: number;
}

export const MediaStudio: React.FC = () => {
  const [studioMode, setStudioMode] = useState<StudioMode>('images');
  const [imageSubMode, setImageSubMode] = useState<ImageSubMode>('text-to-image');

  // Image Generation States
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [imageStyle, setImageStyle] = useState('cinematic');
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedUploadImage, setSelectedUploadImage] = useState<string | null>(null);
  const [uploadImageMime, setUploadImageMime] = useState('image/png');
  const [imageError, setImageError] = useState<string | null>(null);

  // Video Generation States
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');
  const [videoResolution, setVideoResolution] = useState('720p');
  const [videoStartImage, setVideoStartImage] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoProgressStep, setVideoProgressStep] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  // Gallery History
  const [gallery, setGallery] = useState<GeneratedMedia[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoImageInputRef = useRef<HTMLInputElement>(null);

  // Image Style Presets
  const styles = [
    { id: 'cinematic', label: 'سينمائي ثلاثي الأبعاد', desc: 'إضاءة درامية وتفاصيل فائقة 8K' },
    { id: 'photorealistic', label: 'واقعي فوتوغرافي', desc: 'عدسة احترافية 35mm وتفاصيل حية' },
    { id: 'cyberpunk', label: 'نيون وسايبربانك', desc: 'أضواء نيون ومستقبلية مظلمة' },
    { id: 'anime', label: 'أنمي ياباني 3D', desc: 'ألوان ساطعة وأسلوب ماكوتو شينكاي' },
    { id: 'oil_painting', label: 'لوحة زيتية كلاسيكية', desc: 'ضربات فرشاة فنية وتناغم لوني' },
    { id: 'minimalist', label: 'ناقل مينيمال', desc: 'خطوط أنيقة مسطحة وعصرية' },
  ];

  // Quick Prompt Ideas
  const sampleImagePrompts = [
    'رائد فضاء عربي يستكشف كوكباً بلورياً زمرّدياً مشعاً في الفضاء الخارجي',
    'واحة مستقبلية ذكية وسط صحراء نيون مع مبانٍ بيئية وأبراج كريستالية',
    'أسد ملكي أسطوري بتاج ذهبي متوهج في قمة جبل ثلجي وقت الغروب',
    'مدينة دائرية ذكية فائقة التطور عام 2090 مع قطارات طائرة وقطرات مطر واقعية',
  ];

  const sampleVideoPrompts = [
    'كاميرا سينمائية بطيئة تدور حول برج زجاجي متوهج وسط مدينة مستقبلية',
    'لقطة درون جوية فوق شلال مضيء يتدفق عبر غابة استوائية في الليل',
    'قطرة ماء تسقط بالحركة البطيئة على زهرة لوتس زجاجية متوهجة بالضوء',
    'سيارة رياضية فائقة السرعة تسير في نفق نيون أزرق بأسلوب سايبربانك',
  ];

  // Handle Image File Selection for Editing
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setImageError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 8 ميجابايت');
        return;
      }
      setUploadImageMime(file.type || 'image/png');
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedUploadImage(reader.result as string);
        setImageError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Video Start Image Selection
  const handleVideoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setVideoStartImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Image
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() && !selectedUploadImage) {
      setImageError('يرجى كتابة وصف للصورة المطلوبة أولاً');
      return;
    }

    setImageLoading(true);
    setImageError(null);

    try {
      const res = await fetch('/api/media/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspectRatio,
          style: imageStyle,
          base64Image: imageSubMode === 'edit-image' ? selectedUploadImage : undefined,
          mimeType: uploadImageMime,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'فشل توليد الصورة');
      }

      const newMedia: GeneratedMedia = {
        id: 'img-' + Date.now(),
        type: 'image',
        url: data.imageUrl,
        prompt: imagePrompt,
        model: data.model || 'Gemini Vision AI',
        aspectRatio: imageAspectRatio,
        timestamp: Date.now(),
      };

      setGallery((prev) => [newMedia, ...prev]);

      // Deduct points for image generation (10 points)
      const currentPts = parseInt(localStorage.getItem('elixon_user_points') || '1300', 10);
      const updatedPts = Math.max(0, currentPts - 10);
      localStorage.setItem('elixon_user_points', updatedPts.toString());
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      setImageError(err.message || 'حدث خطأ أثناء معالجة الصورة، يرجى المحاولة مجدداً');
    } finally {
      setImageLoading(false);
    }
  };

  // Generate Video
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() && !videoStartImage) {
      setVideoError('يرجى كتابة وصف لحركة الفيديو أو إرفاق صورة أولاً');
      return;
    }

    setVideoLoading(true);
    setVideoError(null);
    setVideoProgressStep(1);

    try {
      const startRes = await fetch('/api/media/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoAspectRatio,
          resolution: videoResolution,
          startImageBase64: videoStartImage || undefined,
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok || startData.error) {
        throw new Error(startData.error || 'فشل بدء إنشاء الفيديو');
      }

      const operationName = startData.operationName;
      setVideoProgressStep(2);

      // Poll status every 8 seconds
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 35; // ~4.5 minutes max

      while (!isDone && attempts < maxAttempts) {
        attempts++;
        await new Promise((r) => setTimeout(r, 8000));
        setVideoProgressStep((prev) => (prev < 4 ? prev + 1 : 4));

        const statusRes = await fetch('/api/media/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        const statusData = await statusRes.json();
        if (statusData.error) {
          throw new Error(statusData.error);
        }

        if (statusData.done) {
          isDone = true;
          break;
        }
      }

      if (!isDone) {
        throw new Error('استغرقت العملية وقتاً أطول من المتوقع، يمكنك إعادة المحاولة بعد قليل');
      }

      // Download / retrieve video stream
      const dlRes = await fetch('/api/media/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });

      if (!dlRes.ok) {
        throw new Error('فشل جلب ملف الفيديو المصيّر');
      }

      const blob = await dlRes.blob();
      const videoBlobUrl = URL.createObjectURL(blob);
      setCurrentVideoUrl(videoBlobUrl);

      const newMedia: GeneratedMedia = {
        id: 'vid-' + Date.now(),
        type: 'video',
        url: videoBlobUrl,
        prompt: videoPrompt,
        model: 'Google Veo 3.1 Lite',
        aspectRatio: videoAspectRatio,
        timestamp: Date.now(),
      };

      setGallery((prev) => [newMedia, ...prev]);

      // Deduct points for video generation (50 points)
      const currentPts = parseInt(localStorage.getItem('elixon_user_points') || '1300', 10);
      const updatedPts = Math.max(0, currentPts - 50);
      localStorage.setItem('elixon_user_points', updatedPts.toString());
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      setVideoError(err.message || 'حدث خطأ أثناء توليد الفيديو بمحرك Veo');
    } finally {
      setVideoLoading(false);
      setVideoProgressStep(0);
    }
  };

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Studio Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                استوديو الوسائط الذكية
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                Gemini Vision + Veo
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              إنشاء وتعديل الصور ومقاطع الفيديو بالذكاء الاصطناعي
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              حوّل أفكارك وخيالك إلى لوحات فائقة الدقة أو مشاهد فيديو سينمائية متحركة بدقة 8K مع تحكم كامل بالأبعاد والأنماط الفنية.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setStudioMode('images')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                studioMode === 'images'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>استوديو الصور</span>
            </button>
            <button
              onClick={() => setStudioMode('videos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                studioMode === 'videos'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>استوديو الفيديو (Veo)</span>
            </button>
            <button
              onClick={() => setStudioMode('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                studioMode === 'editor'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>محرر الفيديو والدمج</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: IMAGE STUDIO                                          */}
      {/* ============================================================ */}
      {studioMode === 'images' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Sub Mode Selector */}
            <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setImageSubMode('text-to-image')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                  imageSubMode === 'text-to-image'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-pink-400" />
                توليد صورة جديدة من نص
              </button>
              <button
                onClick={() => setImageSubMode('edit-image')}
                className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                  imageSubMode === 'edit-image'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                تعديل وتطوير صورة مرفوعة
              </button>
            </div>

            {/* Upload Box (When in Edit Mode) */}
            {imageSubMode === 'edit-image' && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    الصورة الأصلية المراد تعديلها:
                  </span>
                  {selectedUploadImage && (
                    <button
                      onClick={() => setSelectedUploadImage(null)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      إزالة الصورة
                    </button>
                  )}
                </div>

                {selectedUploadImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-700 max-h-56 flex items-center justify-center bg-slate-950">
                    <img
                      src={selectedUploadImage}
                      alt="Uploaded preview"
                      className="max-h-56 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => imageFileInputRef.current?.click()}
                    className="p-6 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/40 hover:bg-slate-900/40 transition-colors cursor-pointer text-center space-y-2"
                  >
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-xs text-slate-300 font-medium">
                      انقر لاختيار صورة من جهازك، أو اسحبها إلى هنا
                    </div>
                    <div className="text-[11px] text-slate-500">
                      يدعم PNG و JPG حتى 8 ميجابايت
                    </div>
                  </div>
                )}
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Prompt Input */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>{imageSubMode === 'edit-image' ? 'ما التعديل المطلوب إجراؤه على الصورة؟' : 'وصف المشهد المراد رسمه (Prompt):'}</span>
                <span className="text-[11px] text-slate-400">يمكنك الكتابة بالعربية أو الإنجليزية</span>
              </label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder={
                  imageSubMode === 'edit-image'
                    ? 'مثال: أضف نظارات شمسية للشخص، غيّر الخلفية لتصبح سماءً ليلية مليئة بالنجوم...'
                    : 'مثال: قلعة خيالية محاطة بالغيوم الذهبية وقت الشروق، تفاصيل سينمائية واقعية...'
                }
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-pink-500 resize-none transition-colors"
              />

              {/* Sample Prompts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sampleImagePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setImagePrompt(p)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors truncate max-w-xs"
                    title={p}
                  >
                    ✨ {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <span className="text-xs font-semibold text-slate-200">أبعاد الصورة (Aspect Ratio):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: '1:1', label: '1:1 مربع', sub: 'Instagram / Feed' },
                  { id: '16:9', label: '16:9 سينمائي', sub: 'YouTube / Desktop' },
                  { id: '9:16', label: '9:16 طولي', sub: 'TikTok / Story' },
                  { id: '4:3', label: '4:3 كلاسيكي', sub: 'Standard Art' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setImageAspectRatio(item.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      imageAspectRatio === item.id
                        ? 'bg-pink-950/40 border-pink-500/60 text-pink-200 font-bold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-mono text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <span className="text-xs font-semibold text-slate-200">النمط الفني (Artistic Style):</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setImageStyle(s.id)}
                    className={`p-2.5 rounded-xl border text-right transition-all ${
                      imageStyle === s.id
                        ? 'bg-purple-950/50 border-purple-500/60 text-purple-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-medium">{s.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {imageError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerateImage}
              disabled={imageLoading}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                imageLoading
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-pink-500/20 active:scale-[0.99]'
              }`}
            >
              {imageLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-pink-300" />
                  <span>جاري رسم وتوليد الصورة الذكية...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{imageSubMode === 'edit-image' ? 'تطبيق التعديلات الذكية' : 'توليد الصورة الآن'}</span>
                </>
              )}
            </button>
          </div>

          {/* Preview & Gallery Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 sticky top-20">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-pink-400" />
                  معاينة النتيجة الأخيرة
                </h3>
                {gallery.find((m) => m.type === 'image') && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    مكتمل
                  </span>
                )}
              </div>

              {/* Latest Image Display */}
              {imageLoading ? (
                <div className="aspect-square rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-2 border-pink-500/30 border-t-pink-500 animate-spin" />
                  <div className="text-xs text-slate-300 font-semibold">
                    جاري المعالجة بمحرك الرؤية الحاسوبية...
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    نقوم بضبط الإضاءة، بناء المجسمات ثلاثية الأبعاد، وتطبيق النمط الفني بدقة 1K
                  </p>
                </div>
              ) : gallery.find((m) => m.type === 'image') ? (
                (() => {
                  const latestImg = gallery.find((m) => m.type === 'image')!;
                  return (
                    <div className="space-y-3">
                      <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
                        <img
                          src={latestImg.url}
                          alt={latestImg.prompt}
                          className="w-full object-cover max-h-[380px]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                          <button
                            onClick={() => setLightboxUrl(latestImg.url)}
                            className="p-2.5 rounded-lg bg-slate-900/90 text-white hover:bg-slate-800 shadow"
                            title="تكبير الصورة"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          <a
                            href={latestImg.url}
                            download={`elixon-${latestImg.id}.png`}
                            className="p-2.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white shadow font-bold text-xs flex items-center gap-1.5"
                          >
                            <Download className="w-4 h-4" />
                            تحميل
                          </a>
                        </div>
                      </div>

                      {/* Details Box */}
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span className="font-mono text-cyan-400">{latestImg.model}</span>
                          <span>الأبعاد: {latestImg.aspectRatio}</span>
                        </div>
                        <p className="text-slate-300 line-clamp-2 text-[11px] leading-relaxed">
                          {latestImg.prompt}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => copyPrompt(latestImg.id, latestImg.prompt)}
                            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                          >
                            {copiedId === latestImg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedId === latestImg.id ? 'تم نسخ الوصف!' : 'نسخ الوصف'}
                          </button>
                          <a
                            href={latestImg.url}
                            download={`elixon-${latestImg.id}.png`}
                            className="text-[11px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            تنزيل بجودة عالية
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="aspect-square rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                  <ImageIcon className="w-10 h-10 stroke-[1.2] text-slate-600" />
                  <p className="text-xs">لم يتم توليد أي صورة بعد في هذه الجلسة</p>
                  <p className="text-[10px] text-slate-600">اكتب وصفاً أو اختر فكرة سريعة واضغط «توليد الصورة»</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: VIDEO STUDIO (VEO)                                    */}
      {/* ============================================================ */}
      {studioMode === 'videos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Prompt Box */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>سيناريو وحركة الفيديو (Veo Motion Prompt):</span>
                <span className="text-[11px] text-indigo-400 font-mono">Google Veo 3.1</span>
              </label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="صف حركة الكاميرا، الأجواء، وتصرف العناصر في المشهد (مثال: كاميرا سينمائية تدور ببطء حول شجرة كريستالية مضيئة، مع تطاير أوراق ذهبية في الهواء)..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 resize-none transition-colors"
              />

              {/* Sample Video Prompts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sampleVideoPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setVideoPrompt(p)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors truncate max-w-xs"
                    title={p}
                  >
                    🎬 {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Starting Frame Image */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  صورة البداية (اختياري - تحريك صورة موجودة):
                </span>
                {videoStartImage && (
                  <button
                    onClick={() => setVideoStartImage(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    إلغاء الصورة
                  </button>
                )}
              </div>

              {videoStartImage ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-700 max-h-48 flex items-center justify-center bg-slate-950">
                  <img
                    src={videoStartImage}
                    alt="Start frame"
                    className="max-h-48 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div
                  onClick={() => videoImageInputRef.current?.click()}
                  className="p-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-950/40 hover:bg-slate-900/40 transition-colors cursor-pointer text-center space-y-1.5"
                >
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="text-xs text-slate-300">
                    اضغط هنا لإرفاق صورة البداية ليتم تحريكها بالفيديو
                  </div>
                </div>
              )}
              <input
                ref={videoImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleVideoImageChange}
                className="hidden"
              />
            </div>

            {/* Video Settings (Aspect Ratio & Resolution) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-200">اتجاه وأبعاد الفيديو:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setVideoAspectRatio('16:9')}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      videoAspectRatio === '16:9'
                        ? 'bg-indigo-950/50 border-indigo-500 text-indigo-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    16:9 أفقي
                  </button>
                  <button
                    onClick={() => setVideoAspectRatio('9:16')}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      videoAspectRatio === '9:16'
                        ? 'bg-indigo-950/50 border-indigo-500 text-indigo-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    9:16 رأسي (Reels)
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-200">دقة العرض (Resolution):</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setVideoResolution('720p')}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      videoResolution === '720p'
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    720p HD (سريع)
                  </button>
                  <button
                    onClick={() => setVideoResolution('1080p')}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      videoResolution === '1080p'
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    1080p FHD (فائق)
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {videoError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{videoError}</span>
                </div>
                {videoError.includes('429') && (
                  <button
                    onClick={() => setStudioMode('images')}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    الانتقال إلى استوديو الصور (المتاح مجاناً)
                  </button>
                )}
              </div>
            )}

            {/* Generate Video Button */}
            <button
              onClick={handleGenerateVideo}
              disabled={videoLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                videoLoading
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-indigo-500/25 active:scale-[0.99]'
              }`}
            >
              {videoLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>جاري تصيير مقطع الفيديو (Veo Engine)...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>توليد فيديو الذكاء الاصطناعي الآن</span>
                </>
              )}
            </button>
          </div>

          {/* Video Preview Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 sticky top-20">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-cyan-400" />
                  مشغل الفيديو والنتيجة
                </h3>
              </div>

              {/* Video Progress or Player */}
              {videoLoading ? (
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">
                      محرك Veo يقوم بتصيير المشهد السينمائي...
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      عمليات توليد الفيديو بالذكاء الاصطناعي تستغرق عادة من دقيقة إلى دقيقتين لمحاكاة الحركة الطبيعية
                    </p>
                  </div>

                  {/* Progress Milestones */}
                  <div className="space-y-2 text-right pt-2 border-t border-slate-800/80">
                    {[
                      { step: 1, label: 'تحليل الأوامر وهندسة المشهد الحركي' },
                      { step: 2, label: 'محاكاة حركة الكاميرا والفيزياء البصرية' },
                      { step: 3, label: 'توليد الإطارات العالية وتصحيح الإضاءة' },
                      { step: 4, label: 'ترميز وتجميع ملف الـ MP4 النهائي' },
                    ].map((m) => (
                      <div
                        key={m.step}
                        className={`flex items-center gap-2 text-xs transition-colors ${
                          videoProgressStep >= m.step
                            ? 'text-emerald-400 font-semibold'
                            : 'text-slate-600'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            videoProgressStep >= m.step
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {videoProgressStep >= m.step ? '✓' : m.step}
                        </div>
                        <span>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : currentVideoUrl ? (
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
                    <video
                      src={currentVideoUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full max-h-[380px] bg-black"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      <span>محرك الفيديو: </span>
                      <span className="font-mono text-cyan-300">Veo 3.1 Lite</span>
                    </div>
                    <a
                      href={currentVideoUrl}
                      download="elixon-generated-video.mp4"
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      تنزيل الفيديو (MP4)
                    </a>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-slate-950/60 border border-slate-800/60 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                  <Film className="w-10 h-10 stroke-[1.2] text-slate-600" />
                  <p className="text-xs">مشغل الفيديو جاهز للاستخدام</p>
                  <p className="text-[10px] text-slate-600">اكتب وصف الحركة المطلوب واضغط على «توليد فيديو»</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: VIDEO EDITOR & MERGER                                 */}
      {/* ============================================================ */}
      {studioMode === 'editor' && <MediaEditor />}

      {/* Lightbox Modal for Zooming Images */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxUrl}
              alt="Zoomed"
              className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
