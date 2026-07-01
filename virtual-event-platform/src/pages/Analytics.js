import React from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function Analytics() {
  const stats = [
    { label: 'Total Registrations', value: '1,492', icon: Users, diff: '+12% this month' },
    { label: 'Event Retention Rate', value: '82.4%', icon: TrendingUp, diff: '+4.2% since last summit' },
    { label: 'Active Event Drafts', value: '6', icon: Calendar, diff: '2 ready to publish' },
    { label: 'AI Optimization Runs', value: '42', icon: Sparkles, diff: '14 saved recommendations' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">

      <PageHeader
        title="Operations Analytics"
        subtitle="Track registrations, engagement rates, pipeline event templates, and AI operations recommendations."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm font-bold text-slate-500">{stat.label}</div>
                <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
              </div>
              <div className="text-2xl font-black text-white mb-2">{stat.value}</div>
              <span className="text-xs font-semibold text-emerald-400">{stat.diff}</span>
            </div>
          );
        })}
      </div>

      {/* Main Charts Mockup Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Retention / Graph */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-[28px] md:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" /> Attendance Trends by Category
          </h3>
          <div className="h-[250px] flex items-end justify-between gap-2 border-b border-slate-800 pb-4">
            {[45, 78, 62, 90, 35, 80, 55, 70, 85].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  style={{ height: `${val}%` }}
                  className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg group-hover:opacity-80 transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Q{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-[28px] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" /> AI Recommendation
            </h3>
            <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl mb-4">
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2">Schedule Optimisation</h4>
              <p className="text-sm text-slate-300 leading-relaxed font-semibold">
                Webinar check-in data suggests that scheduling events on Wednesdays at 4:00 PM increases retention rates by 18%. Consider updating your draft settings.
              </p>
            </div>
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-4 rounded-xl text-xs font-black transition-all">
            Apply Schedule Adjustments
          </button>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
