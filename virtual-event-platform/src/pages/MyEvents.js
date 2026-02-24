import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  LayoutDashboard,
  Ticket,
  Loader2,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EventCard from '../components/EventCard';

function MyEvents() {
  const [activeTab, setActiveTab] = useState('registered');
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const route = activeTab === 'registered' ? 'http://localhost:5000/api/my-bookings' : 'http://localhost:5000/api/events';
        const res = await fetch(route, { credentials: 'include' });
        const data = await res.json();

        if (activeTab === 'registered') {
          // data is bookings, extract eventId
          setAllEvents(data.map(b => b.eventId).filter(e => e !== null));
        } else {
          // data is all events, filter for createdByUser on client side
          setAllEvents(data.filter(event => event.createdByUser));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setAllEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [activeTab]);

  const tabs = [
    { id: 'registered', label: 'My Registrations', icon: Ticket },
    { id: 'created', label: 'My Events', icon: LayoutDashboard }
  ];

  const handleDelete = (id) => {
    // In a real app we would call an API. 
    // For now we just update state if it's the created tab
    if (activeTab === 'created') {
      setAllEvents(prev => prev.filter(e => (e._id || e.id) !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageHeader
          title="Dashboard"
          subtitle="Manage your journey and track your event experiences in one place."
          className="mb-0"
        />

        <Link to="/create-event" className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 self-start md:self-auto px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-xl shadow-indigo-600/20 active:scale-95">
          <Plus className="h-5 w-5" /> Create Event
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-full md:w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
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
          <p className="text-slate-400 animate-pulse">Fetching your events...</p>
        </div>
      ) : allEvents.length === 0 ? (
        <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center">
          <div className="bg-slate-900 h-20 w-20 rounded-3xl flex items-center justify-center mb-6 border border-slate-800">
            {activeTab === 'registered' ? <Ticket className="h-10 w-10 text-slate-700" /> : <LayoutDashboard className="h-10 w-10 text-slate-700" />}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {activeTab === 'registered' ? "No registrations yet" : "No events created"}
          </h3>
          <p className="text-slate-400 max-w-md mx-auto mb-8 font-medium">
            {activeTab === 'registered'
              ? "Start your journey by discovering amazing webinars, conferences, and meetups happening around you."
              : "Ready to host? Create your first event and start building your community today."}
          </p>
          {activeTab === 'registered' ? (
            <Link to="/conferences" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">Browse Events</Link>
          ) : (
            <Link to="/create-event" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">Get Started</Link>
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
              onDelete={activeTab === 'created' ? handleDelete : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyEvents;
