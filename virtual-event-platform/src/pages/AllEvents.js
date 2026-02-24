import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import EventCard from '../components/EventCard';
import PageHeader from '../components/PageHeader';

function AllEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState({});
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/events'),
        user ? axios.get('http://localhost:5000/api/my-bookings', { withCredentials: true }) : Promise.resolve({ data: [] })
      ]);

      setEvents(eventsRes.data);

      const registeredMap = {};
      bookingsRes.data.forEach(b => {
        if (b.eventId) registeredMap[b.eventId._id || b.eventId.id] = true;
      });
      setRegisteredEvents(registeredMap);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = async (id) => {
    if (!user) {
      alert('Please login to book an event');
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/book', {
        eventId: id
      }, { withCredentials: true });
      alert('Booking successful!');
      setRegisteredEvents(prev => ({ ...prev, [id]: true }));
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="All Events"
        subtitle="Explore every event happening on Eventify. From local meetups to global summits."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 animate-pulse">Loading all events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <Search className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
          <p className="text-slate-400">Be the first to create an amazing event!</p>
          <button onClick={() => navigate('/create-event')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg mt-6">Create Event</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard
              key={event._id}
              event={event}
              isRegistered={registeredEvents[event._id]}
              onRegister={handleRegisterClick}
              onClick={(ev) => navigate(`/event/${ev._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AllEvents;
