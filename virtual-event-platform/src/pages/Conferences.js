import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Search, MonitorPlay, X, RotateCcw,
} from 'lucide-react';
import EventCard from '../components/EventCard';
import { toast } from 'react-toastify';

// ── PREDEFINED FALLBACK DATA ───────────────────────────────
const PREDEFINED = [
  { _id: 'conf_1', eventName: 'Annual Tech Summit 2025', title: 'Annual Tech Summit 2025', startDate: '2025-08-10', venueName: 'Hyderabad International Convention Center', organizerName: 'TechLeaders Association', category: 'Technology', ticketType: 'Free', ticketPrice: 0, description: "India's largest technology conference bringing together developers, CTOs, and innovators for 3 days of learning." },
  { _id: 'conf_2', eventName: 'Healthcare Innovation Conference', title: 'Healthcare Innovation Conference', startDate: '2025-09-18', venueName: 'Taj Conference Center, Mumbai', organizerName: 'Health Innovations India', category: 'Healthcare', ticketType: 'Paid', ticketPrice: 1499, description: 'Exploring the next generation of digital health, AI diagnostics, and patient experience transformation.' },
  { _id: 'conf_3', eventName: 'Financial Markets Summit', title: 'Financial Markets Summit', startDate: '2025-10-05', venueName: 'The Grand Ballroom, New Delhi', organizerName: 'Financial Today Group', category: 'Finance', ticketType: 'Paid', ticketPrice: 2499, description: 'A premier forum for fintech leaders, investors, and regulators to explore global capital market trends.' },
  { _id: 'conf_4', eventName: 'AI & Future of Work', title: 'AI & Future of Work', startDate: '2025-11-12', venueName: 'ITC Grand Chola, Chennai', organizerName: 'DeepWork Collective', category: 'Technology', ticketType: 'Free', ticketPrice: 0, description: 'Understanding how artificial intelligence is reshaping industries, jobs, and human collaboration.' },
  { _id: 'conf_5', eventName: 'Green Energy Summit', title: 'Green Energy Summit', startDate: '2025-12-01', venueName: 'Science City Auditorium, Kolkata', organizerName: 'EcoForward India', category: 'Environment', ticketType: 'Free', ticketPrice: 0, description: 'Bringing together energy researchers, policymakers, and entrepreneurs to accelerate the clean energy transition.' },
  { _id: 'conf_6', eventName: 'Design Systems Conference', title: 'Design Systems Conference', startDate: '2025-08-22', venueName: 'CoWrks Prestige, Bengaluru', organizerName: 'UX Collective India', category: 'Design', ticketType: 'Paid', ticketPrice: 999, description: 'For product designers and frontend engineers passionate about scalable, accessible design systems.' },
];

const CATEGORIES = ['All', 'Technology', 'Healthcare', 'Finance', 'Design', 'Environment', 'Business'];

// ── FILTERS BAR ───────────────────────────────────────────
function FiltersBar({ search, setSearch, category, setCategory, price, setPrice, onReset, total }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 w-full"
            placeholder="Search conferences..."
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Price filter */}
        <select
          value={price} onChange={e => setPrice(e.target.value)}
          className="input w-full sm:w-40 cursor-pointer"
        >
          <option>All Prices</option>
          <option>Free</option>
          <option>Paid</option>
        </select>

        {/* Reset */}
        <button onClick={onReset} className="btn-secondary btn-md shrink-0">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`chip ${category === c ? 'chip-active' : 'chip-idle'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="text-xs text-text-3">{total} conference{total !== 1 ? 's' : ''} found</div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────
export default function Conferences() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [price, setPrice] = useState('All Prices');
  const navigate = useNavigate();

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('registeredConferences') || '{}');
    setRegistered(saved);
    fetchData();
  }, []); // eslint-disable-line

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, bkRes] = await Promise.all([
        axios.get('http://localhost:5000/api/v1/events?type=Conference').catch(() => ({ data: [] })),
        user ? axios.get('http://localhost:5000/api/v1/bookings', { withCredentials: true }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);

      const live = Array.isArray(evRes.data) ? evRes.data : evRes.data.data?.events || [];
      const merged = [...live, ...PREDEFINED];
      const unique = Array.from(new Map(merged.map(c => [c._id || c.id, c])).values());
      setAll(unique);

      const bkArr = Array.isArray(bkRes.data) ? bkRes.data : bkRes.data.data?.bookings || [];
      const regMap = { ...saved };
      bkArr.forEach(b => { if (b.eventId) regMap[b.eventId._id || b.eventId.id] = true; });
      setRegistered(regMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saved = useMemo(() => JSON.parse(localStorage.getItem('registeredConferences') || '{}'), []);

  const filtered = useMemo(() => {
    let list = all;
    if (search) list = list.filter(c => (c.eventName || c.title || '').toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') list = list.filter(c => c.category === category);
    if (price === 'Free') list = list.filter(c => c.ticketType === 'Free' || c.ticketPrice === 0);
    if (price === 'Paid') list = list.filter(c => c.ticketType === 'Paid' || c.ticketPrice > 0);
    return list;
  }, [all, search, category, price]);

  const handleRegister = async (id) => {
    if (!user) { toast.warning('Please login to register.'); navigate('/login'); return; }
    
    // Simulate booking for fallback mock events locally
    if (typeof id === 'string' && id.startsWith('conf_')) {
      const next = { ...registered, [id]: true };
      setRegistered(next);
      localStorage.setItem('registeredConferences', JSON.stringify(next));
      toast.success('Sandbox: Registered for demo conference!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/v1/bookings', { eventId: id }, { withCredentials: true });
      const next = { ...registered, [id]: true };
      setRegistered(next);
      localStorage.setItem('registeredConferences', JSON.stringify(next));
      toast.success('Registered for conference!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const reset = () => { setSearch(''); setCategory('All'); setPrice('All Prices'); };

  return (
    <div className="page-wrap space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <MonitorPlay className="w-4 h-4 text-violet-400" />
            </div>
            <span className="badge badge-neutral">Core Module</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-text-1">Conferences</h1>
          <p className="text-text-2 mt-1.5 max-w-lg">
            Professional multi-track conferences across technology, business, health, and more. Find your next big event.
          </p>
        </div>
      </div>

      {/* Filters */}
      <FiltersBar
        search={search} setSearch={setSearch}
        category={category} setCategory={setCategory}
        price={price} setPrice={setPrice}
        onReset={reset} total={filtered.length}
      />

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-72" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon"><MonitorPlay className="w-8 h-8" /></div>
          <div>
            <div className="font-semibold text-text-1 mb-1">No conferences found</div>
            <div className="text-sm text-text-2">Try adjusting your filters or search term.</div>
          </div>
          <button onClick={reset} className="btn-secondary btn-md">
            <RotateCcw className="w-4 h-4" /> Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 grid-fade">
          {filtered.map(c => (
            <EventCard
              key={c._id}
              event={{ ...c, title: c.eventName || c.title, category: c.category || 'Conference', location: c.venueName || c.location }}
              isRegistered={registered[c._id]}
              onRegister={handleRegister}
            />
          ))}
        </div>
      )}
    </div>
  );
}
