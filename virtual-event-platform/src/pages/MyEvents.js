import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, LayoutDashboard, Ticket, Loader2, CalendarDays } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EventCard from '../components/EventCard';
import axios from 'axios';
import { toast } from 'react-toastify';

function MyEvents() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState((location.state && location.state.activeTab) || 'registered');
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      if (activeTab === 'registered') {
        // Fetch User Bookings
        const res = await axios.get('http://localhost:5000/api/v1/bookings', { withCredentials: true });
        const bookingsArray = Array.isArray(res.data)
          ? res.data
          : res.data.data?.bookings || [];

        // Extract event objects
        setAllEvents(bookingsArray.map(b => b.eventId).filter(e => e !== null));
      } else {
        // Fetch User Created Events
        const res = await axios.get('http://localhost:5000/api/v1/events/my', { withCredentials: true });
        const createdArray = Array.isArray(res.data.data?.events)
          ? res.data.data.events
          : [];
        setAllEvents(createdArray);
      }
    } catch (error) {
      console.error('Error fetching dashboard events:', error);
      toast.error('Failed to sync operations lists');
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'registered', label: 'My Registrations', icon: Ticket },
    { id: 'created', label: 'My Created Events', icon: LayoutDashboard }
  ];

  const handleDelete = async (id) => {
    if (activeTab === 'created') {
      try {
        await axios.delete(`http://localhost:5000/api/v1/events/${id}`, { withCredentials: true });
        setAllEvents(prev => prev.filter(e => (e._id || e.id) !== id));
        toast.success("Successfully deleted event template.");
      } catch (err) {
        console.error("Failed to delete event:", err);
        toast.error("Failed to delete event.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageHeader
          title="Tickets & Operations Hub"
          subtitle="Review your registered event admissions, tickets wallet, and manage templates you created."
          className="mb-0"
        />

        <Link
          to="/create-event"
          className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 self-start md:self-auto px-6 py-3.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-xl shadow-indigo-600/20 active:scale-95 text-sm"
        >
          <Plus className="h-5 w-5" /> Create Event
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-full md:w-fit backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-500 hover:text-slate-350 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 animate-pulse font-medium">Syncing tickets lists...</p>
        </div>
      ) : allEvents.length === 0 ? (
        <div className="text-center py-24 bg-slate-900/10 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center">
          <div className="bg-slate-900 h-20 w-20 rounded-3xl flex items-center justify-center mb-6 border border-slate-800">
            {activeTab === 'registered' ? <Ticket className="h-9 w-9 text-slate-700" /> : <LayoutDashboard className="h-9 w-9 text-slate-700" />}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {activeTab === 'registered' ? "No active tickets" : "No event canvases published"}
          </h3>
          <p className="text-slate-450 max-w-sm mx-auto mb-8 font-medium">
            {activeTab === 'registered'
              ? "Discover expert webinars, hybrid conferences, and local meetups to begin your ticketing history."
              : "Launch your community today. Tap Co-Create above to describe your operations to the AI assistant."}
          </p>
          {activeTab === 'registered' ? (
            <Link to="/discover" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20">Browse Discover Feed</Link>
          ) : (
            <Link to="/create-event" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20">Create Event</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents.map(event => (
            <EventCard
              key={event._id || event.id}
              event={event}
              isRegistered={activeTab === 'registered'}
              onClick={(ev) => navigate(`/event/${ev._id || ev.id}`)}
              onDelete={activeTab === 'created' ? () => handleDelete(event._id || event.id) : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyEvents;
