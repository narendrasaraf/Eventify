import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Loader2, CalendarDays, Ticket, Sparkles,
  Plus, User as UserIcon, Shield, Mail,
  BarChart2, TrendingUp, Clock, ArrowRight,
  X, ChevronRight,
} from 'lucide-react';
import EventCard from '../components/EventCard';
import { toast } from 'react-toastify';
import FormattedMarkdown from '../components/FormattedMarkdown';

// ── STAT CARD ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, trend, color }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-1">{label}</div>
        <div className="font-display text-2xl font-bold text-text-1">{value}</div>
        {trend && <div className="text-xs text-success mt-0.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{trend}</div>}
      </div>
    </div>
  );
}

// ── AI INSIGHT PANEL ──────────────────────────────────────
function AIInsightPanel() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/v1/intelligence/dashboard-insights',
        { query },
        { withCredentials: true }
      );
      if (res.data?.data?.insights) setResult(res.data.data.insights);
    } catch (err) {
      setResult('Failed to fetch insights. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const samples = [
    'How many events am I registered for?',
    'What upcoming events should I attend?',
    'Give me networking tips for tech conferences',
  ];

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-brand" />
        </div>
        <div>
          <div className="font-semibold text-text-1 text-sm">AI Assistant</div>
          <div className="text-xs text-text-2">Ask anything about your events</div>
        </div>
      </div>

      <form onSubmit={run} className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask a question..."
          className="input flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary btn-md shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      {/* Sample prompts */}
      {!result && (
        <div className="flex flex-wrap gap-2">
          {samples.map(s => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="text-xs px-2.5 py-1 rounded-full bg-surface-2 hover:bg-surface-3 text-text-2 hover:text-text-1 border border-border transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {result && (
        <div className="bg-surface-2 rounded-xl p-4 text-sm text-text-2 leading-relaxed border border-border relative">
          <button
            onClick={() => setResult(null)}
            className="absolute top-3 right-3 text-text-3 hover:text-text-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <FormattedMarkdown text={result} />
        </div>
      )}
    </div>
  );
}

// ── OPTIMIZER MODAL ───────────────────────────────────────
function OptimizerModal({ event, onClose }) {
  const [topics, setTopics] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);

  const run = async (e) => {
    e.preventDefault();
    if (!topics.trim() || loading) return;
    setLoading(true);
    setSchedule(null);
    try {
      const topicList = topics.split('\n').map(l => l.trim()).filter(Boolean);
      const res = await axios.post(
        'http://localhost:5000/api/v1/intelligence/schedule-optimizer',
        { topics: topicList, constraints: { startTime, eventName: event?.eventName || event?.title } },
        { withCredentials: true }
      );
      if (res.data?.data?.schedule) setSchedule(res.data.data.schedule);
    } catch (err) {
      alert('Failed to optimize: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-2xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="font-display text-lg font-bold text-text-1">AI Schedule Optimizer</div>
            <div className="text-sm text-text-2 mt-0.5">{event?.eventName || event?.title}</div>
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={run} className="space-y-4">
          <div>
            <label className="label">Topics / Sessions (one per line)</label>
            <textarea
              value={topics}
              onChange={e => setTopics(e.target.value)}
              rows={5}
              placeholder={'Keynote: The Future of AI\nBreak: Networking\nWorkshop: Building ML Pipelines'}
              className="input font-mono text-xs"
            />
          </div>
          <div>
            <label className="label">Start Time</label>
            <input
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="input"
              placeholder="09:00 AM"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary btn-md w-full">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Optimizing...</>
            ) : (
              <><Sparkles className="w-4 h-4" />Optimize Schedule</>
            )}
          </button>
        </form>

        {schedule && (
          <div className="mt-5 bg-surface-2 rounded-xl p-4 space-y-2 border border-border">
            <div className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-3">Optimized Schedule</div>
            {Array.isArray(schedule) ? (
              schedule.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-brand font-mono text-xs pt-0.5 shrink-0 w-20">{item.time}</span>
                  <span className="text-text-1">{item.topic || item.title || item.session}</span>
                </div>
              ))
            ) : (
              <pre className="text-text-2 text-xs whitespace-pre-wrap">{JSON.stringify(schedule, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('registered');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [optimizerEvent, setOptimizerEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, [activeTab]); // eslint-disable-line

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, eventsRes] = await Promise.all([
        axios.get('http://localhost:5000/auth/me', { withCredentials: true }),
        activeTab === 'registered'
          ? axios.get('http://localhost:5000/api/my-bookings', { withCredentials: true })
          : axios.get('http://localhost:5000/api/events', { withCredentials: true }),
      ]);

      const u = userRes.data.user;
      setUser(u);

      const raw = Array.isArray(eventsRes.data)
        ? eventsRes.data
        : eventsRes.data.data?.bookings || eventsRes.data.data?.events || [];

      if (activeTab === 'registered') {
        setEvents(raw.map(b => b.eventId || b).filter(Boolean));
      } else {
        setEvents(raw.filter(e => e.organizerEmail === u.email));
      }
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this event?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/events/${id}`, { withCredentials: true });
      setEvents(prev => prev.filter(e => (e._id || e.id) !== id));
      toast.success('Event template permanently deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event template.');
    }
  };

  if (!user && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-3">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
        <span className="text-text-2 text-sm">Loading workspace...</span>
      </div>
    );
  }

  return (
    <div className="page-wrap space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-1">
            {user?.name ? `Hello, ${user.name.split(' ')[0]} 👋` : 'Dashboard'}
          </h1>
          <p className="text-sm text-text-2 mt-1">Here's what's happening with your events.</p>
        </div>
        <Link to="/create-event" className="btn-primary btn-md shrink-0">
          <Plus className="w-4 h-4" /> Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Ticket}       label="Registered"   value={activeTab === 'registered' ? events.length : '—'} color="bg-brand/10 text-brand" />
        <StatCard icon={CalendarDays} label="My Events"    value={activeTab === 'my' ? events.length : '—'}          color="bg-violet-500/10 text-violet-400" />
        <StatCard icon={BarChart2}    label="Views"        value="—"                                                  color="bg-emerald-500/10 text-emerald-400" />
        <StatCard icon={Clock}        label="Hours saved"  value="—"                                                  color="bg-amber-500/10 text-amber-400" />
      </div>

      {/* AI Panel */}
      <AIInsightPanel />

      {/* User profile strip */}
      {user && (
        <div className="card flex flex-col sm:flex-row items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-surface-2 border-2 border-border flex items-center justify-center overflow-hidden">
              {user.profilePicture
                ? <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                : <UserIcon className="w-7 h-7 text-text-3" />
              }
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-2 border-surface" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="font-semibold text-text-1">{user.name}</div>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1.5 text-xs text-text-2"><Mail className="w-3.5 h-3.5" />{user.email}</span>
              <span className="badge badge-brand"><Shield className="w-3 h-3" />{user.authProvider || 'local'}</span>
            </div>
          </div>
          <Link to="/profile" className="btn-secondary btn-sm shrink-0">
            View Profile <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Events section */}
      <div>
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-surface-2 rounded-xl w-fit mb-6 border border-border">
          {[
            { id: 'registered', label: 'Registered Events' },
            { id: 'my',         label: 'My Events' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-surface text-text-1 border border-border shadow-sm'
                  : 'text-text-2 hover:text-text-1'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="skeleton h-64" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">
              <CalendarDays className="w-8 h-8" />
            </div>
            <div>
              <div className="font-semibold text-text-1 mb-1">
                {activeTab === 'registered' ? 'No registered events yet' : 'No events created yet'}
              </div>
              <div className="text-sm text-text-2">
                {activeTab === 'registered'
                  ? 'Browse events and register to see them here.'
                  : 'Use the AI Co-Creator to build your first event.'}
              </div>
            </div>
            <Link
              to={activeTab === 'registered' ? '/discover' : '/co-creator'}
              className="btn-primary btn-md"
            >
              {activeTab === 'registered' ? 'Browse Events' : 'Create with AI'}{' '}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 grid-fade">
            {events.map(event => (
              <EventCard
                key={event._id}
                event={event}
                isRegistered={activeTab === 'registered'}
                onDelete={activeTab === 'my' ? handleDelete : undefined}
                onClick={(ev) => navigate(`/event/${ev._id || ev.id}`)}
                onOptimize={activeTab === 'my' ? (ev) => setOptimizerEvent(ev) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Schedule Optimizer Modal */}
      {optimizerEvent && (
        <OptimizerModal
          event={optimizerEvent}
          onClose={() => setOptimizerEvent(null)}
        />
      )}
    </div>
  );
}
