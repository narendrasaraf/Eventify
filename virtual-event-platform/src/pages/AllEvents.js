import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, CalendarDays, X, RotateCcw } from 'lucide-react';
import EventCard from '../components/EventCard';
import { toast } from 'react-toastify';

const CATEGORIES = ['All', 'Technology', 'Conference', 'Meetup', 'Workshop', 'Webinar', 'Healthcare', 'Finance', 'Design'];

export default function AllEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const navigate = useNavigate();

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, bkRes] = await Promise.all([
          axios.get('http://localhost:5000/api/events'),
          user ? axios.get('http://localhost:5000/api/my-bookings', { withCredentials: true }) : Promise.resolve({ data: [] }),
        ]);

        const evArr = Array.isArray(evRes.data) ? evRes.data : evRes.data.data?.events || [];
        setEvents(evArr);

        const bkArr = Array.isArray(bkRes.data) ? bkRes.data : bkRes.data.data?.bookings || [];
        const map = {};
        bkArr.forEach(b => { if (b.eventId) map[b.eventId._id || b.eventId.id] = true; });
        setRegistered(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // eslint-disable-line

  const filtered = useMemo(() => {
    let list = events;
    if (search) list = list.filter(e => (e.title || e.eventName || '').toLowerCase().includes(search.toLowerCase()) || (e.description || '').toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') list = list.filter(e => e.category === category);
    return list;
  }, [events, search, category]);

  const handleRegister = async (id) => {
    if (!user) { toast.warning('Please login to register.'); navigate('/login'); return; }
    try {
      await axios.post('http://localhost:5000/api/book', { eventId: id }, { withCredentials: true });
      setRegistered(prev => ({ ...prev, [id]: true }));
      toast.success('Registered successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="page-wrap space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-brand" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-text-1">Discover Events</h1>
        <p className="text-text-2 mt-1.5">Explore every event on Eventify — from local meetups to global summits.</p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10 max-w-md w-full"
            placeholder="Search events..."
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute left-[calc(100%-2rem)] sm:left-[calc(28rem-2rem)] top-1/2 -translate-y-1/2 text-text-3">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`chip ${category === c ? 'chip-active' : 'chip-idle'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="text-xs text-text-3">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-72" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon"><CalendarDays className="w-8 h-8" /></div>
          <div>
            <div className="font-semibold text-text-1 mb-1">
              {events.length === 0 ? 'No events yet' : 'No results found'}
            </div>
            <div className="text-sm text-text-2">
              {events.length === 0
                ? 'Be the first to create an event using the AI Co-Creator.'
                : 'Try a different search or category filter.'}
            </div>
          </div>
          <button onClick={() => { setSearch(''); setCategory('All'); }} className="btn-secondary btn-md">
            <RotateCcw className="w-4 h-4" /> Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 grid-fade">
          {filtered.map(ev => (
            <EventCard
              key={ev._id}
              event={ev}
              isRegistered={registered[ev._id]}
              onRegister={handleRegister}
              onClick={(e) => navigate(`/event/${e._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
