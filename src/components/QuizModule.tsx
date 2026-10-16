import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Sparkles, Award, ArrowRight } from 'lucide-react';
import { QuizQuestion } from '../types';

export const QuizModule: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setQuestions([]);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);

    const prompt = `قم بإنشاء اختبار ذكي وتفاعلي باللغة العربية حول الموضوع التالي: "${topic}".
عدد الأسئلة المطلوب: ${count}.
يجب أن ترجع النتيجة بصيغة JSON فقط بهذا الهيكل الدقيق وبدون أي نصوص إضافية قبله أو بعده:
[
  {
    "question": "نص السؤال هنا؟",
    "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
    "correctAnswerIndex": 0,
    "explanation": "شرح سبب صحة الإجابة بشكل مبسط ومفيد"
  }
]`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction: 'أنت خبير إعداد اختبارات تعليمية ذكية. مخرجاتك JSON صالح تماماً مصفوفة أسئلة اختيار من متعدد مع correctAnswerIndex كرقم صحيح 0-3 وشرح مبسط.',
        }),
      });

      if (!response.ok) {
        throw new Error('فشل توليد الاختبار');
      }

      const data = await response.json();
      let rawText = data.text.trim();

      // Clean markdown code blocks if wrapped in ```json ... ```
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed: QuizQuestion[] = JSON.parse(rawText);
      setQuestions(parsed);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إعداد الأسئلة، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleSubmitQuiz = () => {
    if (submitted) return;
    let currentScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        currentScore += 1;
      }
    });
    setScore(currentScore);
    setSubmitted(true);
  };

  const sampleTopics = ['الذكاء الاصطناعي وشبكات التعلم العميق', 'قواعد بيانات SQL و NoSQL', 'أساسيات الأمن السيبراني والتشفير', 'الفيزياء الكلاسيكية والنسبية'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-xs text-indigo-300 font-mono">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>مختبر الاختبارات الذكية (Smart Quiz Lab)</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          اختبر فهمك ومعلوماتك في أي موضوع
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          اكتب اسم الدرس، الكتاب، أو المفهوم البرمجي، وسيقوم الذكاء الاصطناعي بتوليد اختبار تفاعلي فوري لتقييم مستواك.
        </p>
      </div>

      {/* Generator Form */}
      <form onSubmit={generateQuiz} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="اكتب موضوع الاختبار (مثال: البرمجة كائنية التوجه OOP، الثورة الصناعية، تفاعلات الكيمياء العضوية...)"
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          />

          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            aria-label="عدد الأسئلة"
            className="bg-slate-950 border border-slate-800 text-indigo-300 rounded-xl px-3 py-2.5 text-sm outline-none font-mono"
          >
            <option value={3}>3 أسئلة</option>
            <option value={5}>5 أسئلة</option>
            <option value={8}>8 أسئلة</option>
          </select>

          <button
            type="submit"
            disabled={!topic.trim() || loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>جاري إعداد الاختبار...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>توليد الاختبار</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
          <span className="text-xs text-slate-500">مواضيع مقترحة:</span>
          {sampleTopics.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTopic(t)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </form>

      {/* Questions Display */}
      {questions.length > 0 && (
        <div className="space-y-6">
          {/* Progress / Score Header */}
          {submitted && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-800 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                  <Award className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">النتيجة النهائية</h3>
                  <p className="text-sm text-indigo-300">
                    أجبت بشكل صحيح على {score} من أصل {questions.length} سؤال (
                    {Math.round((score / questions.length) * 100)}%)
                  </p>
                </div>
              </div>

              <button
                onClick={generateQuiz}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة الاختبار</span>
              </button>
            </div>
          )}

          {/* Question Cards */}
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
                  {qIdx + 1}
                </span>
                <h3 className="text-base font-bold text-white leading-snug">
                  {q.question}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;
                  const isCorrect = q.correctAnswerIndex === optIdx;

                  let optionStyle =
                    'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700';

                  if (isSelected && !submitted) {
                    optionStyle = 'bg-indigo-950 border-indigo-500 text-indigo-200 font-semibold';
                  } else if (submitted) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between text-xs md:text-sm ${optionStyle}`}
                    >
                      <span>{opt}</span>
                      {submitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after submit */}
              {submitted && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>تفسير الإجابة:</span>
                  </div>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}

          {/* Submit Quiz Button */}
          {!submitted && (
            <div className="text-center pt-2">
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length < questions.length}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl transition-all"
              >
                تصحيح الاختبار وعرض النتيجة
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
