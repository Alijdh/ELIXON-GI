import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Zap, Award, Clock, ArrowDownRight, Layers } from 'lucide-react';

export const StatsView: React.FC = () => {
  // Retrieve points and mock/historical usage data
  const currentPoints = parseInt(localStorage.getItem('elixon_user_points') || '1300', 10);
  const totalConsumedPoints = Math.max(0, 1300 - currentPoints);
  const totalTokensUsed = totalConsumedPoints * 500;

  // Mock historical data over the last 7 days
  const consumptionData = [
    { day: 'السبت', pointsUsed: 120, tokensUsed: 60000, chats: 14, media: 2 },
    { day: 'الأحد', pointsUsed: 210, tokensUsed: 105000, chats: 22, media: 4 },
    { day: 'الإثنين', pointsUsed: 180, tokensUsed: 90000, chats: 18, media: 3 },
    { day: 'الثلاثاء', pointsUsed: 290, tokensUsed: 145000, chats: 30, media: 6 },
    { day: 'الأربعاء', pointsUsed: 150, tokensUsed: 75000, chats: 15, media: 2 },
    { day: 'الخميس', pointsUsed: totalConsumedPoints > 0 ? Math.min(totalConsumedPoints, 240) : 190, tokensUsed: 95000, chats: 20, media: 5 },
    { day: 'الجمعة', pointsUsed: 80, tokensUsed: 40000, chats: 9, media: 1 },
  ];

  const dailyTokenRate = [
    { hour: '00:00 - 04:00', tokens: 12000 },
    { hour: '04:00 - 08:00', tokens: 5000 },
    { hour: '08:00 - 12:00', tokens: 45000 },
    { hour: '12:00 - 16:00', tokens: 82000 },
    { hour: '16:00 - 20:00', tokens: 95000 },
    { hour: '20:00 - 24:00', tokens: 60000 },
  ];

  const usageDistribution = [
    { name: 'الدردشة الذكية (Chat)', value: 55, color: '#3b82f6' },
    { name: 'خط التكامل المزدوج (Synergy)', value: 25, color: '#8b5cf6' },
    { name: 'توليد الصور (Images)', value: 12, color: '#ec4899' },
    { name: 'توليد الفيديو (Veo)', value: 8, color: '#06b6d4' },
  ];

  const averageDailyTokens = Math.round(totalTokensUsed / 7);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 overflow-y-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/60 to-cyan-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-white">إحصائيات الاستهلاك ونقاط الـ Tokens</h2>
            </div>
            <p className="text-xs text-slate-400">
              تحليل دقيق لاستهلاك النقاط عبر الزمن والمعدل اليومي لاستخدام الـ Tokens عبر محركات الذكاء الاصطناعي
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
            <span className="text-amber-400 text-lg">🪙</span>
            <div>
              <div className="text-[10px] text-slate-400">الرصيد المتبقي حالياً</div>
              <div className="text-sm font-bold text-amber-200">{currentPoints.toLocaleString()} نقطة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>إجمالي الـ Tokens المستهلكة</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">{totalTokensUsed.toLocaleString()}</div>
          <div className="text-[10px] text-cyan-400 font-medium">معدل دقيق بناءً على الاستهلاك الحالي</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>المعدل اليومي للـ Tokens</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">{averageDailyTokens.toLocaleString()} / يوم</div>
          <div className="text-[10px] text-emerald-400 font-medium">ضمن الحد الاقتصادي المسموح</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>النقاط المستهلكة الإجمالية</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-300 font-mono">{totalConsumedPoints} نقطة</div>
          <div className="text-[10px] text-slate-500">1 نقطة = 500 Token</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>كفاءة الاستخدام</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-300 font-mono">98.4%</div>
          <div className="text-[10px] text-purple-400 font-medium">استخدام مثالي للموارد</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Points Consumption Over Time */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              استهلاك النقاط والـ Tokens خلال الأسبوع الماضي
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              آخر 7 أيام
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consumptionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="pointsUsed" name="النقاط المستهلكة" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Usage Distribution */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            توزيع الاستهلاك حسب الوظيفة
          </h3>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {usageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2">
            {usageDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-mono text-slate-400 font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Token Rate Bar Chart */}
        <div className="lg:col-span-12 p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              المعدل اليومي لاستخدام الـ Tokens عبر الساعات
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              متوسط التوقيت المحلي
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTokenRate} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="tokens" name="Tokens المستخدمة" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
