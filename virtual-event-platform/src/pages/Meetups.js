import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, X, RotateCcw,
} from 'lucide-react';
import EventCard from '../components/EventCard';
import { toast } from 'react-toastify';

const PREDEFINED = [
  { _id: 'meet_1', eventName: 'Pune JavaScript Developers Meet', title: 'Pune JavaScript Developers Meet', startDate: '2025-08-20', venueName: 'Workspaces Co., Koregaon Park', organizerName: 'Pune JS Community', category: 'Technology', ticketType: 'Free', ticketPrice: 0, description: 'Monthly gathering for JavaScript enthusiasts — lightning talks, networking, and live coding sessions.' },
  { _id: 'meet_2', eventName: 'Book Lovers Club Meetup', title: 'Book Lovers Club Meetup', startDate: '2025-08-25', venueName: 'Cafe Reading Room, Aundh', organizerName: 'Pune Readers Circle', category: 'Books & Literature', ticketType: 'Free', ticketPrice: 0, description: "An intimate evening for bibliophiles - this month's pick: The Remains of the Day." },
  { _id: 'meet_3', eventName: 'Entrepreneurship Networking Brunch', title: 'Entrepreneurship Networking Brunch', startDate: '2025-09-02', venueName: 'Business Hub, Viman Nagar', organizerName: 'Startup Catalysts', category: 'Business', ticketType: 'Paid', ticketPrice: 499, description: 'Casual Sunday brunch for founders, investors, and operators. Build real relationships over good food.' },
  { _id: 'meet_4', eventName: 'Bangalore AI Builders Meetup', title: 'Bangalore AI Builders Meetup', startDate: '2025-09-10', venueName: 'IndiQube Edge, HSR Layout', organizerName: 'AI Tinkerers BLR', category: 'Technology', ticketType: 'Free', ticketPrice: 0, description: 'Monthly meetup for ML engineers and AI researchers — demos, papers, and community discussions.' },
  { _id: 'meet_5', eventName: 'Women in Tech Connect', title: 'Women in Tech Connect', startDate: '2025-09-18', venueName: 'WeWork Galaxy, Bengaluru', organizerName: 'SheTech India', category: 'Technology', ticketType: 'Free', ticketPrice: 0, description: 'A welcoming space for women in technology — mentoring, career sessions, and peer networking.' },
  { _id: 'meet_6', eventName: 'Hyderabad Photography Walk', title: 'Hyderabad Photography Walk', startDate: '2025-10-05', venueName: 'Charminar, Old City', organizerName: 'HYD Lens Collective', category: 'Art & Photography', ticketType: 'Free', ticketPrice: 0, description: 'Explore the iconic old city of Hyderabad through a lens — open to all skill levels.' },
];

const CATEGORIES = ['All', 'Technology', 'Business', 'Books & Literature', 'Art & Photography', 'Design'];

export default function Meetups() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [price, setPrice] = useState('All Prices');
  const navigate = useNavigate();

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('joinedMeetups') || '{}');
    setJoined(saved);
    fetchData();
  }, []); // eslint-disable-line

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, bkRes] = await Promise.all([
        axios.get('http://localhost:5000/api/v1/events?type=Meetup').catch(() => ({ data: [] })),
        user ? axios.get('http://localhost:5000/api/v1/bookings', { withCredentials: true }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);
      const live = Array.isArray(evRes.data) ? evRes.data : evRes.data.data?.events || [];
      const merged = [...live, ...PREDEFINED];
      const unique = Array.from(new Map(merged.map(m => [m._id || m.id, m])).values());
      setAll(unique);

      const bkArr = Array.isArray(bkRes.data) ? bkRes.data : bkRes.data.data?.bookings || [];
      const jMap = JSON.parse(localStorage.getItem('joinedMeetups') || '{}');
      bkArr.forEach(b => { if (b.eventId) jMap[b.eventId._id || b.eventId.id] = true; });
      setJoined(jMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = all;
    if (search) list = list.filter(m => (m.eventName || m.title || '').toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') list = list.filter(m => m.category === category);
    if (price === 'Free') list = list.filter(m => m.ticketType === 'Free' || m.ticketPrice === 0);
    if (price === 'Paid') list = list.filter(m => m.ticketType === 'Paid' || m.ticketPrice > 0);
    return list;
  }, [all, search, category, price]);

  const handleJoin = async (id) => {
    if (!user) { toast.warning('Please login to join a meetup.'); navigate('/login'); return; }
    try {
      await axios.post('http://localhost:5000/api/v1/bookings', { eventId: id }, { withCredentials: true });
      const next = { ...joined, [id]: true };
      setJoined(next);
      localStorage.setItem('joinedMeetups', JSON.stringify(next));
      toast.success('You joined the meetup!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not join meetup');
    }
  };

  const reset = () => { setSearch(''); setCategory('All'); setPrice('All Prices'); };

  return (
    <div className="page-wrap space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <span className="badge badge-neutral">Core Module</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-text-1">Meetups</h1>
        <p className="text-text-2 mt-1.5 max-w-lg">
          Hyper-local community gatherings across technology, art, business, and culture. Find your people.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-10 w-full" placeholder="Search meetups..."
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <select value={price} onChange={e => setPrice(e.target.value)} className="input w-full sm:w-40 cursor-pointer">
            <option>All Prices</option>
            <option>Free</option>
            <option>Paid</option>
          </select>
          <button onClick={reset} className="btn-secondary btn-md shrink-0">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c} onClick={() => setCategory(c)}
              className={`chip ${category === c ? 'chip-active' : 'chip-idle'}`}
            >{c}</button>
          ))}
        </div>
        <div className="text-xs text-text-3">{filtered.length} meetup{filtered.length !== 1 ? 's' : ''} found</div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-72" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon"><Users className="w-8 h-8" /></div>
          <div>
            <div className="font-semibold text-text-1 mb-1">No meetups found</div>
            <div className="text-sm text-text-2">Try different filters or check back soon.</div>
          </div>
          <button onClick={reset} className="btn-secondary btn-md">
            <RotateCcw className="w-4 h-4" /> Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 grid-fade">
          {filtered.map(m => (
            <EventCard
              key={m._id}
              event={{ ...m, title: m.eventName || m.title, category: m.category || 'Meetup', location: m.venueName || m.location }}
              isRegistered={joined[m._id]}
              onRegister={handleJoin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
