import React, { useState } from 'react';
import { Bell, Check, Trash2, Calendar, Shield, Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function Notifications() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      title: 'Booking Confirmed',
      body: 'Your ticket for the Annual Tech Summit 2025 has been issued successfully. Access code: CONF_TKT_1029.',
      time: '2 hours ago',
      type: 'success',
      icon: Calendar,
      unread: true
    },
    {
      id: 2,
      title: 'AI Draft Completed',
      body: 'Gemini Agent drafted your event "Data Modeling in MongoDB". Tap to review the timeline, pricing, and venues.',
      time: '1 day ago',
      type: 'ai',
      icon: Sparkles,
      unread: true
    },
    {
      id: 3,
      title: 'Security Alert',
      body: 'Logged in successfully from a new Chrome browser session (IP 192.168.1.42). Contact support if this was not you.',
      time: '2 days ago',
      type: 'warning',
      icon: Shield,
      unread: false
    }
  ]);

  const markAllRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, unread: false })));
  };

  const deleteMsg = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Notification Center"
          subtitle="Keep track of registrations, agenda changes, security logs, and operations updates."
          className="mb-0"
        />

        {messages.some(m => m.unread) && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all self-start md:self-auto"
          >
            <Check className="h-4 w-4 text-emerald-400" /> Mark all read
          </button>
        )}
      </div>

      <div className="max-w-4xl space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
            <Bell className="h-10 w-10 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">All caught up!</h3>
            <p className="text-slate-500 text-sm">No new notifications to display.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const Icon = msg.icon;
            return (
              <div
                key={msg.id}
                className={`bg-slate-900/40 backdrop-blur-xl border p-6 rounded-2xl flex gap-4 justify-between items-start transition-all ${
                  msg.unread ? 'border-indigo-500/30 bg-slate-900/60 shadow-[0_0_20px_rgba(79,70,229,0.05)]' : 'border-slate-800'
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`p-3 rounded-xl border self-start ${
                      msg.type === 'ai'
                        ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
                        : msg.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      {msg.title}
                      {msg.unread && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-semibold mt-1">
                      {msg.body}
                    </p>
                    <span className="text-[10px] font-bold text-slate-500 block mt-2 uppercase">
                      {msg.time}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteMsg(msg.id)}
                  className="text-slate-500 hover:text-red-400 p-2 transition-all"
                  title="Delete message"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Notifications;
