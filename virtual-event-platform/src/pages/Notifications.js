import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, Shield, Sparkles, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import axios from 'axios';
import { toast } from 'react-toastify';

const formatTimeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return "just now";
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + ` year${interval !== 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + ` month${interval !== 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + ` day${interval !== 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + ` hour${interval !== 1 ? 's' : ''} ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + ` minute${interval !== 1 ? 's' : ''} ago`;
  return "just now";
};

const getIcon = (type) => {
  if (type === 'ai') return Sparkles;
  if (type === 'success') return Calendar;
  return Shield;
};

function Notifications() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/v1/notifications', { withCredentials: true });
      if (res.data && res.data.data?.notifications) {
        setMessages(res.data.data.notifications);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toast.error("Failed to sync notifications center.");
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.post('http://localhost:5000/api/v1/notifications/read-all', {}, { withCredentials: true });
      setMessages(prev => prev.map(m => ({ ...m, unread: false })));
      toast.success("Marked all notifications as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteMsg = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/v1/notifications/${id}`, { withCredentials: true });
      setMessages(prev => prev.filter(m => (m._id || m.id) !== id));
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Notification Center"
          subtitle="Keep track of registrations, agenda changes, security logs, and operations updates."
          className="mb-0"
        />

        {!loading && messages.some(m => m.unread) && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all self-start md:self-auto"
          >
            <Check className="h-4 w-4 text-emerald-400" /> Mark all read
          </button>
        )}
      </div>

      <div className="max-w-4xl space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            <p className="text-slate-400 animate-pulse font-medium">Syncing inbox...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
            <Bell className="h-10 w-10 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">All caught up!</h3>
            <p className="text-slate-500 text-sm">No new notifications to display.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const Icon = getIcon(msg.type);
            const msgId = msg._id || msg.id;
            return (
              <div
                key={msgId}
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
                      {formatTimeAgo(msg.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteMsg(msgId)}
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
