import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  Copy,
  Check,
  X,
  Layers,
  Terminal,
  AlertTriangle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'direct' | 'apkGuide' | 'ios'>('direct');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setTimeout(() => onClose(), 1000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center overflow-hidden">
                <img src="/icon.svg" alt="ELIXON-GI Icon" className="w-10 h-10 object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">تثبيت تطبيق ELIXON-GI</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Android & WebAPK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                تحويل المنصة إلى تطبيق أندرويد مستقل وسريع يعمل مثل أي تطبيق APK مثبت على جهازك
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-b border-slate-800/80 -mb-6 pb-2">
            <button
              onClick={() => setActiveTab('direct')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'direct'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              تثبيت أندرويد الفوري (WebAPK)
            </button>
            <button
              onClick={() => setActiveTab('apkGuide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'apkGuide'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              توليد ملف APK مستقل
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'ios'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              أجهزة آبل (iOS)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Alert if Already Installed */}
          {isInstalled && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-bold">التطبيق مثبت بالفعل!</span>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  أنت تستخدم حالياً ELIXON-GI في وضع التطبيق المستقل (Standalone App).
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: Direct Android Install (WebAPK) */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 flex-shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">كيف يعمل التثبيت المباشر على أندرويد؟</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      يقوم نظام أندرويد عبر متصفح Chrome أو Samsung Internet بتوليد حزمة <strong>WebAPK</strong> حقيقية وتثبيتها مباشرة في قائمة التطبيقات على هاتفك مع أيقونة مستقلة، شاشة تحميل (Splash Screen)، وشريط أدوات مدمج بدون شريط المتصفح!
                    </p>
                  </div>
                </div>

                {/* 1-Click Install Button if supported */}
                {isInstallable && !isInstalled && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5" /> الجهاز متوافق للتثبيت المباشر
                    </span>
                    <button
                      onClick={handleInstallClick}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      تثبيت التطبيق الآن
                    </button>
                  </div>
                )}
              </div>

              {/* Step by Step Android Instructions */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  طريقة التثبيت اليدوي عبر الهاتف في 3 ثوانٍ:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center text-center">
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center mb-2">
                      1
                    </div>
                    <span className="font-semibold text-slate-200 text-xs">افتح قائمة المتصفح</span>
                    <span className="text-[11px] text-slate-400 mt-1">اضغط على زر الخيارات (⋮) أعلى يمين أو يسار شاشة Chrome.</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center text-center">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mb-2">
                      2
                    </div>
                    <span className="font-semibold text-slate-200 text-xs">اختر "تثبيت التطبيق"</span>
                    <span className="text-[11px] text-slate-400 mt-1">أو اختر "إضافة إلى الشاشة الرئيسية" (Install App).</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex flex-col items-center text-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-2">
                      3
                    </div>
                    <span className="font-semibold text-slate-200 text-xs">تم التثبيت بنجاح!</span>
                    <span className="text-[11px] text-slate-400 mt-1">ستجد تطبيق ELIXON-GI على شاشتك مع الإشعارات ودعم عدم الاتصال.</span>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 flex items-center justify-around text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> آمن ولا يحتاج أذونات مريبة</span>
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-cyan-400" /> خفيف الحجم وسريع الإقلاع</span>
                <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-purple-400" /> شاشة كاملة بدون متصفح</span>
              </div>
            </div>
          )}

          {/* TAB 2: Generate Standalone .APK File (PWABuilder / Bubblewrap) */}
          {activeTab === 'apkGuide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-400" />
                  هل ترغب بملف APK بصيغة (.apk) مستقل تماماً لتوزيعه وتثبيته؟
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  نظراً لأن ELIXON-GI متوافق 100% مع معايير PWA و Web Manifest الحديثة، يمكنك تحويله إلى ملف <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">.apk</code> موقع وجاهز للنشر أو التثبيت عبر طريقتين رسميتين وسريعتين:
                </p>
              </div>

              {/* Option A: PWABuilder with Crawler Note */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center text-[10px]">A</span>
                    توليد ملف APK عبر أداة (PWABuilder من مايكروسوفت)
                  </div>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    فتح الأداة <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Important Alert about Google AI Studio Preview URL */}
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>توضيح سبب رسالة «التطبيق غير جاهز» في PWABuilder:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-100/90">
                    رابط التطبيق الحالي مستضاف داخل بيئة سحابية مطورة تتطلب تسجيل دخول Google للمعاينة، لذلك عندما يقوم روبوت PWABuilder بفحص الرابط يصله تحويل (302 Redirect) ولا يستطيع قراءة ملفات التطبيق من الخارج.
                  </p>
                </div>

                {/* Resolution Steps */}
                <div className="space-y-2 text-xs text-slate-300">
                  <p className="font-semibold text-slate-200 text-xs">
                    كيفية الحصول على الـ APK وتخطي هذه المشكلة:
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-emerald-300">
                        1. الطريقة المباشرة والأسرع (WebAPK في الأندرويد بدون أي أدوات):
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      افتح هذا الرابط على هاتفك في متصفح Chrome، واضغط على <strong>«تثبيت التطبيق»</strong> من القائمة أعلاه. سيقوم نظام أندرويد تلقائياً بإنشاء حزمة <strong>APK رسمية (WebAPK)</strong> وتثبيتها فوراً على جهازك!
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-cyan-300">
                        2. استخدام ملف الـ Manifest الجاهز في PWABuilder:
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      يمكنك نسخ كود الـ Manifest وتنزيله لإدخاله يدوياً في PWABuilder عبر خيار <strong>Manifest Editor</strong>:
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/manifest.webmanifest');
                            const json = await res.text();
                            await navigator.clipboard.writeText(json);
                            setCopiedCmd('manifest-json');
                            setTimeout(() => setCopiedCmd(null), 2500);
                          } catch {
                            // fallback
                          }
                        }}
                        className="px-2.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] flex items-center gap-1.5 font-medium transition-colors"
                      >
                        {copiedCmd === 'manifest-json' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedCmd === 'manifest-json' ? 'تم نسخ كود الـ Manifest!' : 'نسخ كود Manifest (JSON)'}
                      </button>

                      <a
                        href="/manifest.webmanifest"
                        download="manifest.json"
                        className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1.5 font-medium border border-slate-700"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        تحميل ملف manifest.json
                      </a>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-emerald-400" />
                        3. تحميل حزمة البناء الجاهزة كاملة (ZIP):
                      </span>
                      <a
                        href="/elixon-gi-build.zip"
                        download="elixon-gi-build.zip"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        تحميل ZIP (240KB)
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      تحتوي الحزمة على مخرجات البناء الكاملة (<code className="text-emerald-400">dist/</code>): ملفات <code className="text-cyan-300">index.html</code>، <code className="text-cyan-300">manifest.json</code>، <code className="text-cyan-300">sw.js</code>، الأيقونات والشاشات، والأكواد المجمعة.
                    </p>
                    <p className="text-[10px] text-emerald-200/80">
                      💡 <strong>فكرة رائعة:</strong> يمكنك سحب وإفلات هذا الملف في <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="underline font-bold text-white hover:text-emerald-300">Netlify Drop</a> ليصبح لديك موقع عام فوري ومجاني يمكنك تمرير رابطه إلى PWABuilder وتحميل الـ APK مباشرة!
                    </p>
                  </div>
                </div>
              </div>

              {/* Option B: Bubblewrap / CLI */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px]">B</span>
                    توليد APK عبر سطر الأوامر (Google Bubblewrap CLI)
                  </div>
                  <button
                    onClick={() => copyToClipboard('npx @bubblewrap/cli init --manifest=https://your-domain/manifest.webmanifest', 'bubble')}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    {copiedCmd === 'bubble' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCmd === 'bubble' ? 'تم النسخ' : 'نسخ الأمر'}
                  </button>
                </div>
                <div className="mt-2 p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-cyan-300 overflow-x-auto flex items-center justify-between">
                  <span>npx @bubblewrap/cli build</span>
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  تقوم أداة جوجل الرسمية بتحويل الـ PWA إلى ملف APK و AAB أصلي جاهز لمتجر Play Store.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: iOS Installation Guide */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  تثبيت التطبيق على هواتف iPhone وأجهزة iPad
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  على نظام iOS (Safari)، يتم تثبيت تطبيق الويب كـ تطبيق مستقل كامل على الشاشة الرئيسية عبر زر المشاركة:
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
                  <span>اضغط على زر المشاركة <strong>(Share / سهم المشاركة)</strong> في أسفل شاشة متصفح Safari.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
                  <span>مرّر لأسفل واضغط على <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
                  <span>اضغط <strong>"إضافة" (Add)</strong>، وسيظهر تطبيق ELIXON-GI كأيقونة تطبيق كامل على جهازك.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>يدعم التحديث التلقائي والأداء الفائق للذكاء الاصطناعي</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
