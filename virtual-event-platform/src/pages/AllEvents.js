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
  
  // Pagination & Sorting State
  const [sortBy, setSortBy] = useState('date-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  // Reset page to 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sortBy]);

  const filtered = useMemo(() => {
    let list = events;
    if (search) list = list.filter(e => (e.title || e.eventName || '').toLowerCase().includes(search.toLowerCase()) || (e.description || '').toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') list = list.filter(e => e.category === category);
    return list;
  }, [events, search, category]);

  // Apply sorting and pagination
  const { paginatedList, totalPages, totalItems, actualPage } = useMemo(() => {
    let list = [...filtered];

    // Apply sorting
    list.sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.startDate || a.date) - new Date(b.startDate || b.date);
      }
      if (sortBy === 'date-desc') {
        return new Date(b.startDate || b.date) - new Date(a.startDate || a.date);
      }
      if (sortBy === 'price-asc') {
        return (a.ticketPrice || 0) - (b.ticketPrice || 0);
      }
      if (sortBy === 'price-desc') {
        return (b.ticketPrice || 0) - (a.ticketPrice || 0);
      }
      if (sortBy === 'name-asc') {
        const nameA = (a.eventName || a.title || '').toLowerCase();
        const nameB = (b.eventName || b.title || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const page = Math.min(currentPage, Math.max(1, totalPages));
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedList = list.slice(startIndex, startIndex + itemsPerPage);

    return {
      paginatedList,
      totalPages,
      totalItems,
      actualPage: page
    };
  }, [filtered, sortBy, currentPage]);

  const handleRegister = async (id) => {
    if (!user) { toast.warning('Please login to register.'); navigate('/login'); return; }
    
    // Redirect to details page for payment if event is paid
    const targetEvent = events.find(e => (e._id || e.id) === id);
    if (targetEvent && targetEvent.ticketType === 'Paid' && targetEvent.ticketPrice > 0) {
      toast.info(`Redirecting to details page to complete payment for "${targetEvent.eventName || targetEvent.title}"...`);
      navigate(`/event/${id}`);
      return;
    }

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

      {/* Filters & Sorting */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-10 w-full"
              placeholder="Search events..."
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-3">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-3 uppercase tracking-wider">Sort by</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input py-2 text-sm max-w-xs cursor-pointer bg-slate-950 border-slate-800 text-text-1"
            >
              <option value="date-asc" className="bg-slate-900 text-white">Soonest first</option>
              <option value="date-desc" className="bg-slate-900 text-white">Latest first</option>
              <option value="price-asc" className="bg-slate-900 text-white">Price: Low to High</option>
              <option value="price-desc" className="bg-slate-900 text-white">Price: High to Low</option>
              <option value="name-asc" className="bg-slate-900 text-white">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`chip ${category === c ? 'chip-active' : 'chip-idle'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="text-xs text-text-3">
          Showing {paginatedList.length} of {totalItems} event{totalItems !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-72" />)}
        </div>
      ) : paginatedList.length === 0 ? (
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
          {paginatedList.map(ev => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={actualPage === 1}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                actualPage === pageNum
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={actualPage === totalPages}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
