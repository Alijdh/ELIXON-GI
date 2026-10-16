import React, { useState, useRef } from 'react';
import {
  Film,
  Upload,
  Play,
  Scissors,
  Layers,
  Type,
  Sliders,
  Download,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Video,
} from 'lucide-react';

export interface VideoClip {
  id: string;
  name: string;
  url: string;
  duration: number;
  startTime: number;
  endTime: number;
  file?: File;
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  position: 'top' | 'center' | 'bottom';
  fontSize: number;
  textColor: string;
  bgColor: string;
}

export type VideoFilter = 'none' | 'grayscale' | 'sepia' | 'contrast' | 'brightness' | 'invert' | 'blur' | 'saturate';

export const MediaEditor: React.FC = () => {
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [filter, setFilter] = useState<VideoFilter>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // New overlay form state
  const [newText, setNewText] = useState('');
  const [newStartTime, setNewStartTime] = useState(0);
  const [newDuration, setNewDuration] = useState(3);
  const [newPosition, setNewPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [newFontSize, setNewFontSize] = useState(24);
  const [newTextColor, setNewTextColor] = useState('#ffffff');
  const [newBgColor, setNewBgColor] = useState('rgba(0,0,0,0.6)');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeClip = clips.find((c) => c.id === activeClipId) || clips[0];

  // Handle Video File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        const newClip: VideoClip = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          url,
          duration: tempVideo.duration || 10,
          startTime: 0,
          endTime: tempVideo.duration || 10,
          file,
        };
        setClips((prev) => [...prev, newClip]);
        if (!activeClipId) {
          setActiveClipId(newClip.id);
        }
      };
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete clip
  const handleDeleteClip = (id: string) => {
    setClips((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeClipId === id) {
        setActiveClipId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  // Move clip order
  const handleMoveClip = (index: number, direction: 'up' | 'down') => {
    const newClips = [...clips];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newClips.length) return;
    const temp = newClips[index];
    newClips[index] = newClips[targetIndex];
    newClips[targetIndex] = temp;
    setClips(newClips);
  };

  // Add text overlay
  const handleAddOverlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const overlay: TextOverlay = {
      id: Math.random().toString(36).substring(2, 9),
      text: newText,
      startTime: Number(newStartTime),
      duration: Number(newDuration),
      position: newPosition,
      fontSize: Number(newFontSize),
      textColor: newTextColor,
      bgColor: newBgColor,
    };
    setOverlays((prev) => [...prev, overlay]);
    setNewText('');
  };

  const handleDeleteOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
  };

  // Filter CSS style map
  const getFilterStyle = (f: VideoFilter): string => {
    switch (f) {
      case 'grayscale':
        return 'grayscale(100%)';
      case 'sepia':
        return 'sepia(100%)';
      case 'contrast':
        return 'contrast(150%)';
      case 'brightness':
        return 'brightness(130%)';
      case 'invert':
        return 'invert(100%)';
      case 'blur':
        return 'blur(3px)';
      case 'saturate':
        return 'saturate(200%)';
      default:
        return 'none';
    }
  };

  // Toggle Play
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (activeClip && videoRef.current.currentTime >= activeClip.endTime) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.currentTime = activeClip.startTime;
    }
  };

  // Export / Render simulation
  const handleExport = () => {
    if (clips.length === 0) return;
    setIsProcessing(true);
    setExportSuccess(false);
    setTimeout(() => {
      setIsProcessing(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    }, 2500);
  };

  // Active overlays at current time
  const activeOverlays = overlays.filter(
    (o) => currentTime >= o.startTime && currentTime <= o.startTime + o.duration
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto" dir="rtl">
      {/* Top Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              محرر الفيديو المتقدم (Media Editor)
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-medium">
                Pro
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              قم برفع المقاطع، قصها، دمجها، إضافة نصوص توضيحية وفلاتر بصرية احترافية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/*"
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            رفع مقاطع فيديو
          </button>

          <button
            onClick={handleExport}
            disabled={clips.length === 0 || isProcessing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                جاري المعالجة والدمج...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                تصدير وتنزيل العمل النهائي
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {exportSuccess && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-emerald-950/90 border border-emerald-700/80 text-emerald-200 flex items-center gap-3 shadow-xl animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">تم تصدير الفيديو بنجاح!</h4>
            <p className="text-xs text-emerald-300 mt-0.5">
              تم دمج المقاطع وتطبيق الفلاتر والنصوص بنجاح. ملف الفيديو جاهز للتحميل والمشاركة.
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Preview & Player */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Video Preview Container */}
          <div className="relative bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center aspect-video group">
            {activeClip ? (
              <>
                <video
                  ref={videoRef}
                  src={activeClip.url}
                  className="w-full h-full object-contain"
                  style={{ filter: getFilterStyle(filter) }}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  onClick={togglePlay}
                />

                {/* Text Overlays Layer */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
                  {activeOverlays.map((overlay) => {
                    const posClass =
                      overlay.position === 'top'
                        ? 'self-center items-start'
                        : overlay.position === 'center'
                        ? 'self-center my-auto items-center'
                        : 'self-center mt-auto items-end';

                    return (
                      <div key={overlay.id} className={`flex ${posClass} w-full`}>
                        <span
                          style={{
                            fontSize: `${overlay.fontSize}px`,
                            color: overlay.textColor,
                            backgroundColor: overlay.bgColor,
                          }}
                          className="px-4 py-2 rounded-xl font-bold shadow-lg backdrop-blur-sm border border-white/10 animate-fade-in text-center max-w-[90%]"
                        >
                          {overlay.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Play Overlay Button */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-cyan-600/90 hover:bg-cyan-500 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 z-20 cursor-pointer"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </button>
                )}

                {/* Video Info Badge */}
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2 z-20">
                  <Video className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-medium truncate max-w-[200px]">{activeClip.name}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-cyan-500">
                  <Film className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">لا توجد مقاطع فيديو مرفوعة</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  قم برفع مقطع فيديو واحد أو أكثر لبدء التحرير، القص، الدمج، وإضافة المؤثرات البصرية.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  اختر ملفات الفيديو
                </button>
              </div>
            )}
          </div>

          {/* Timeline & Trimming Controls */}
          {activeClip && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-cyan-400" />
                  أدوات القص والتشذيب للمقطع الحالي: <span className="text-cyan-400">{activeClip.name}</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  المدة الكلية: {activeClip.duration.toFixed(1)} ثانية
                </span>
              </div>

              {/* Range Sliders for Trimming */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 flex justify-between">
                    <span>بداية المقطع (Start Time)</span>
                    <span className="font-mono text-cyan-300">{activeClip.startTime.toFixed(1)}s</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={activeClip.endTime - 0.5}
                    step={0.1}
                    value={activeClip.startTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setClips((prev) =>
                        prev.map((c) => (c.id === activeClip.id ? { ...c, startTime: val } : c))
                      );
                      if (videoRef.current) videoRef.current.currentTime = val;
                    }}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 flex justify-between">
                    <span>نهاية المقطع (End Time)</span>
                    <span className="font-mono text-cyan-300">{activeClip.endTime.toFixed(1)}s</span>
                  </label>
                  <input
                    type="range"
                    min={activeClip.startTime + 0.5}
                    max={activeClip.duration}
                    step={0.1}
                    value={activeClip.endTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setClips((prev) =>
                        prev.map((c) => (c.id === activeClip.id ? { ...c, endTime: val } : c))
                      );
                    }}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Visual Filters Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              الفلاتر والمؤثرات البصرية
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'none', label: 'طبيعي (Normal)' },
                { id: 'grayscale', label: 'أسود وأبيض (Grayscale)' },
                { id: 'sepia', label: 'عتيق (Sepia)' },
                { id: 'contrast', label: 'تباين عالي (Contrast)' },
                { id: 'brightness', label: 'إضاءة زاهية (Bright)' },
                { id: 'invert', label: 'عكس الألوان (Invert)' },
                { id: 'blur', label: 'تمويه ناعم (Blur)' },
                { id: 'saturate', label: 'ألوان مشبعة (Vibrant)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as VideoFilter)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    filter === f.id
                      ? 'bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-600/30'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Clips Queue & Text Overlays */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Clips Queue / Merger */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                قائمة المقاطع والدمج ({clips.length})
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة مقطع
              </button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {clips.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  لا توجد مقاطع مرفوعة في القائمة.
                </div>
              ) : (
                clips.map((clip, idx) => (
                  <div
                    key={clip.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      activeClipId === clip.id
                        ? 'bg-cyan-950/50 border-cyan-600/80 shadow-lg'
                        : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setActiveClipId(clip.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-cyan-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">{clip.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        المدة: {(clip.endTime - clip.startTime).toFixed(1)}s (من {clip.startTime.toFixed(1)}s إلى {clip.endTime.toFixed(1)}s)
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => handleMoveClip(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveClip(idx, 'down')}
                          disabled={idx === clips.length - 1}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteClip(clip.id)}
                        className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Text Overlays Builder */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-cyan-400" />
              إضافة نصوص توضيحية وتعليقات (Captions)
            </h3>

            <form onSubmit={handleAddOverlay} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">نص التعليق / التوضيح</label>
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="مثال: تحليل تشكيلة الفريق في الدقيقة 45..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">وقت الظهور (ثانية)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">المدة (ثانية)</label>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">الموضع على الشاشة</label>
                  <select
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="top">أعلى الشاشة</option>
                    <option value="center">منتصف الشاشة</option>
                    <option value="bottom">أسفل الشاشة</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">حجم الخط</label>
                  <input
                    type="number"
                    min={12}
                    max={64}
                    value={newFontSize}
                    onChange={(e) => setNewFontSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-600/30 transition-all cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                إضافة النص التوضيحي
              </button>
            </form>

            {/* Overlays List */}
            {overlays.length > 0 && (
              <div className="mt-3 space-y-2 max-h-[160px] overflow-y-auto">
                <h4 className="text-xs font-bold text-slate-400">النصوص المضافة ({overlays.length}):</h4>
                {overlays.map((o) => (
                  <div key={o.id} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">"{o.text}"</p>
                      <p className="text-[10px] text-slate-400">
                        {o.startTime}s - {o.startTime + o.duration}s ({o.position})
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteOverlay(o.id)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-950/50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
