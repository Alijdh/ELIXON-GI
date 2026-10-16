import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Search,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Scale,
  Briefcase,
  Code2,
  HeartPulse,
  PenTool,
  Zap,
  Plus,
  X,
  Layers,
} from 'lucide-react';
import { SkillItem } from '../types';

interface SkillsSectionProps {
  onSelectSkill: (promptTemplate: string) => void;
}

export const skillsList: SkillItem[] = [
  {
    id: 'feynman',
    title: 'أسلوب فاينمان للتعلم العميق',
    category: 'التعليم والفهم',
    categoryBadge: 'تعليم',
    icon: '🎓',
    description: 'تبسيط أعقد المفاهيم والنظريات العلمية لدرجة فهم طفل بالتشبيهات الواقعية.',
    promptTemplate: 'اشرح لي مفهوم [اكتب اسم المفهوم أو النظرية هنا] مستخدماً أسلوب فاينمان للتعلم: ابدأ بمثال من واقع الحياة اليومية، ثم بسط الميكانيكية العلمية بدون مصطلحات معقدة، واختم باختبار ذاتي لفهم الفكرة.',
    sampleInput: 'الحوسبة الكمية ومبدأ التراكب',
  },
  {
    id: 'critical-thinking',
    title: 'التفكير النقدي وفحص الأدلة',
    category: 'المنطق والتحليل',
    categoryBadge: 'منطق',
    icon: '🔍',
    description: 'تفكيك المزاعم والحجج المنطقية، كشف المغالطات الخفية، ووزن الأدلة بموضوعية.',
    promptTemplate: 'أريدك أن تفحص وتدقق الادعاء التالي تفكيراً نقدياً محايداً: "[اكتب الادعاء أو الرأي هنا]". فكك الفرضيات المسبقة، حدد نقاط الضعف والمغالطات المنطقية المحتملة، وقدم الرأي المقابل بأقوى حججه.',
    sampleInput: 'الذكاء الاصطناعي سيقضي على كافة الوظائف البشرية خلال 5 سنوات',
  },
  {
    id: 'business-swot',
    title: 'دراسة الجدوى وتحليل SWOT',
    category: 'الأعمال والاستثمار',
    categoryBadge: 'اقتصاد',
    icon: '📊',
    description: 'تحليل استراتيجي متكامل يشمل نقاط القوة والضعف والفرص والتهديدات وتقدير الجدوى.',
    promptTemplate: 'قم بإعداد تحليل SWOT ودراسة جدوى استراتيجية لفكرة المشروع التالية: "[اكتب فكرة مشروعك هنا]". وضّح القيمة المضافة التنافسية، تكلفة اكتساب العميل (CAC)، وقنوات الإيرادات المحتملة.',
    sampleInput: 'تطبيق توصيل طلبات سحابية متخصص في الأغذية الصحية والمكملات',
  },
  {
    id: 'legal-synthesis',
    title: 'التحليل القانوني وتفكيك العقود',
    category: 'القانون والتشريع',
    categoryBadge: 'قانون',
    icon: '⚖️',
    description: 'فحص الالتزامات والبنود القانونية، تقييم المخاطر، وصياغة الحجج الدفاعية.',
    promptTemplate: 'حلل من منظور قانوني ومنطقي المسألة أو البند التالي: "[اكتب النص أو البند القانوني هنا]". حدد الالتزامات المترتبة على الأطراف، الثغرات أو المخاطر المحتملة، واقترح صياغة بديلة تحمي الحقوق.',
    sampleInput: 'بند عدم المنافسة في عقد العمل الحر وسريان مدته بعد انتهاء التعاقد',
  },
  {
    id: 'executive-summary',
    title: 'التلخيص التنفيذي واستخراج الزبدة',
    category: 'الإنتاجية والمعرفة',
    categoryBadge: 'إنتاجية',
    icon: '📝',
    description: 'تحويل الأبحاث والكتب والنصوص المطولة إلى تقرير تنفيذي مكثف في 5 محاور.',
    promptTemplate: 'لخص الموضوع أو النص التالي تلخيصاً تنفيذياً حاسماً: "[الصق النص أو اكتب اسم الكتاب/الموضوع هنا]". قدم الملخص في 5 نقاط رئيسية، متبوعة بـ 3 توصيات تنفيذية مباشرة.',
    sampleInput: 'كتاب التفكير بسرعة وببطء لدانيال كانمان',
  },
  {
    id: 'code-audit',
    title: 'استوديو تدقيق وهندسة الأكواد',
    category: 'البرمجة والتقنية',
    categoryBadge: 'تقنية',
    icon: '💻',
    description: 'فحص الشيفرات البرمجية، اكتشاف الثغرات الأمنية، وتحسين التعقيد الخوارزمي.',
    promptTemplate: 'قم بمراجعة وتدقيق الكود التالي: \n\n[الصق الكود هنا]\n\nالمطلوب: 1) كشف أي أخطاء أو ثغرات أمنية، 2) تحليل التعقيد الزمني والمكاني Big-O، 3) إعادة كتابة الكود بنسخة محسنة ونظيفة مع التعليقات.',
    sampleInput: 'دالة لحساب المسافات وتوليد مسارات في مصفوفة ثنائية الأبعاد',
  },
  {
    id: 'medical-bio',
    title: 'التبسيط الطبي والفسيولوجي',
    category: 'العلوم والصحة',
    categoryBadge: 'صحة',
    icon: '🩺',
    description: 'شرح فسيولوجي دقيق للأمراض والأدوية والفحوصات مع مراعاة المعايير العلمية.',
    promptTemplate: 'اشرح علمياً وبأسلوب دقيق ومبسط: "[اكتب الحالة أو التحليل الطبي أو التساؤل الصحي هنا]". اشرح الآلية الحيوية، العوامل المؤثرة، والإرشادات العامة مع التنبيه الطبي المناسب.',
    sampleInput: 'مقاومة الإنسولين وكيف تتطور إلى السكري من النوع الثاني',
  },
  {
    id: 'creative-writing',
    title: 'البلاغة والصياغة الأدبية الإبداعية',
    category: 'اللغة والأدب',
    categoryBadge: 'أدب',
    icon: '🎨',
    description: 'إعادة صياغة الأفكار بأساليب بيانية رصينة، مع حسن التشبيه وقوة التعبير.',
    promptTemplate: 'أعد صياغة الفكرة التالية بأسلوب أدبي بليغ ومؤثر يجمع بين جزالة المعنى ورشاقة الأسلوب: "[اكتب فكرتك أو مسودتك هنا]".',
    sampleInput: 'أهمية الصبر ومقاومة الصعاب لتحقيق الأحلام الكبرى',
  },
  {
    id: 'ai-media-prompting',
    title: 'هندسة أوامر الصور والفيديو (Veo & Vision)',
    category: 'الذكاء المرئي والوسائط',
    categoryBadge: 'وسائط',
    icon: '🎬',
    description: 'صياغة برومبتات سينمائية فائقة الاحترافية لتوليد الصور والفيديوهات بأدق تفاصيل الإضاءة والحركة.',
    promptTemplate: 'قم بصياغة برومبت سينمائي احترافي باللغتين العربية والإنجليزية لإنشاء [صورة / فيديو] حول الفكرة التالية: "[اكتب فكرتك هنا]". حدد نوع العدسة، زوايا الإضاءة السينمائية، النمط الفني، وحركة الكاميرا لمحرك Veo.',
    sampleInput: 'سفينة فضائية تبحر بين كواكب نيون بأسلوب سينمائي مذهل',
  },
];

export const SkillsSection: React.FC<SkillsSectionProps> = ({ onSelectSkill }) => {
  const [customSkills, setCustomSkills] = useState<SkillItem[]>(() => {
    try {
      const saved = localStorage.getItem('elixon_custom_skills');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('مخصص');
  const [newBadge, setNewBadge] = useState('مهارة');
  const [newIcon, setNewIcon] = useState('⚡');
  const [newDescription, setNewDescription] = useState('');
  const [newPrompt, setNewPrompt] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('elixon_custom_skills', JSON.stringify(customSkills));
    } catch {
      // ignore
    }
  }, [customSkills]);

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrompt.trim()) return;

    const skill: SkillItem = {
      id: 'custom-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory.trim() || 'مخصص',
      categoryBadge: newBadge.trim() || 'مخصص',
      icon: newIcon.trim() || '⚡',
      description: newDescription.trim() || 'مهارة مخصصة أضيفت بناءً على طلبك.',
      promptTemplate: newPrompt.trim(),
    };

    setCustomSkills((prev) => [skill, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setNewPrompt('');
    setIsModalOpen(false);
  };

  const allSkills = [...customSkills, ...skillsList];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>مكتبة المهارات الذكية (ELIXON Skills Toolkit)</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            أدوات تفكير متخصصة لكافة المجالات
          </h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
            اختر أي مهارة معرفية لتطبيقها مباشرة داخل المحادثة، أو أضف مهاراتك الخاصة حسب الطلب.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهارة مخصصة (Custom Skill)</span>
        </button>
      </div>

      {/* Grid of Skill Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {allSkills.map((skill) => (
          <div
            key={skill.id}
            className="group relative rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/50 p-5 shadow-lg flex flex-col justify-between transition-all hover:bg-slate-900 duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{skill.icon}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700/60">
                  {skill.categoryBadge}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-1.5">
                {skill.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {skill.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/60">
              <button
                onClick={() => onSelectSkill(skill.promptTemplate)}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>تطبيق المهارة في الشات</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-white">إضافة مهارة ذكية مخصصة حسب الطلب</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSkill} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-slate-300">عنوان المهارة:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: تحليل البيانات المالية..."
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">أيقونة (Emoji):</label>
                  <input
                    type="text"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    maxLength={4}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-center text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">التصنيف:</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="مثال: الأعمال والمال"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">شارة التصنيف:</label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    placeholder="مثال: مالية"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">وصف قصير للمهارة:</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="مثال: قراءة الميزانية العمومية واستخراج المؤشرات المالية الحساسة."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">قالب البرومبت / التعليمات (Prompt Template):</label>
                <textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="اكتب الأوامر أو الإرشادات التي سيقوم الذكاء الاصطناعي بتنفيذها عند تطبيق هذه المهارة..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors shadow-lg shadow-cyan-500/20"
                >
                  حفظ وإضافة المهارة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
