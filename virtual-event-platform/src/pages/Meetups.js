import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, RotateCcw, Loader2, ArrowLeft } from 'lucide-react';
import EventDetail from './EventDetail';
import EventCard from '../components/EventCard';
import PageHeader from '../components/PageHeader';

function Meetups() {
  const [meetups, setMeetups] = useState([]);
  const [filteredMeetups, setFilteredMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [joinedEvents, setJoinedEvents] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'All Categories',
    date: 'All Dates',
    price: 'Price - Any',
  });

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const savedJoined = JSON.parse(localStorage.getItem('joinedMeetups')) || {};
    setJoinedEvents(savedJoined);

    if (user && (user._id || user.id)) {
      fetchUserBookings();
    }
  }, []);

  const fetchUserBookings = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/my-bookings`, { withCredentials: true });
      const bookings = response.data;
      const joinedMap = { ...joinedEvents };
      bookings.forEach(b => {
        if (b.eventId) joinedMap[b.eventId._id || b.eventId.id] = true;
      });
      setJoinedEvents(joinedMap);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      const dummyMeetups = [
        {
          id: 'meet_1',
          title: "Pune JavaScript Developers",
          date: "2025-04-20",
          location: "Workspaces Co., Koregaon Park",
          organizer: "Pune JS Community",
          category: "Technology",
          price: 0,
          image: "https://img.freepik.com/free-vector/gradient-halftone-technology-webinar_23-2149195110.jpg"
        },
        {
          id: 'meet_2',
          title: "Book Lovers Club Meetup",
          date: "2025-04-25",
          location: "Cafe Reading Room, Aundh",
          organizer: "Pune Readers Circle",
          category: "Books & Literature",
          price: 0,
          image: "https://img.freepik.com/free-vector/hand-drawn-book-club-youtube-thumbnail_23-2149702259.jpg"
        },
        {
          id: 'meet_3',
          title: "Entrepreneurship Networking",
          date: "2025-05-02",
          location: "Business Hub, Viman Nagar",
          organizer: "Startup Catalysts",
          category: "Business",
          price: 50,
          image: "https://img.freepik.com/free-vector/flat-design-business-workshop-youtube-thumbnail-template_23-2149393100.jpg"
        }
      ];
      setMeetups(dummyMeetups);
      setFilteredMeetups(dummyMeetups);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    let filtered = [...meetups];

    if (searchTerm) {
      filtered = filtered.filter(m =>
        (m.title || m.eventName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.organizer || m.organizerName).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.category !== 'All Categories') {
      filtered = filtered.filter(m => m.category === filters.category);
    }

    if (filters.date !== 'All Dates') {
      const today = new Date();
      filtered = filtered.filter(m => {
        const eventDate = new Date(m.date || m.startDate);
        if (filters.date === 'Today') {
          return eventDate.toDateString() === today.toDateString();
        } else if (filters.date === 'Tomorrow') {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          return eventDate.toDateString() === tomorrow.toDateString();
        } else if (filters.date === 'This Month') {
          return (
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear()
          );
        }
        return true;
      });
    }

    if (filters.price !== 'Price - Any') {
      filtered = filtered.filter(m => {
        if (filters.price === 'Free') return (m.price === 0 || m.ticketType === 'Free');
        if (filters.price === 'Paid') return (m.price > 0 || m.ticketType === 'Paid');
        return true;
      });
    }

    setFilteredMeetups(filtered);
  }, [filters, meetups, searchTerm]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleJoin = async (id) => {
    if (!user) {
      alert("Please login to register for events.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/book', {
        eventId: id
      }, { withCredentials: true });

      if (response.status === 201) {
        setJoinedEvents(prev => ({ ...prev, [id]: true }));
        const current = JSON.parse(localStorage.getItem('joinedMeetups')) || {};
        localStorage.setItem('joinedMeetups', JSON.stringify({ ...current, [id]: true }));
        alert("Registration Successful!");
      }
    } catch (error) {
      console.error('Registration failed:', error);
      const msg = error.response?.data?.error || "Registration failed. Please try again.";
      alert(msg);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      category: 'All Categories',
      date: 'All Dates',
      price: 'Price - Any'
    });
  };

  if (selectedEvent) {
    return (
      <div className="section-container">
        <button
          className="btn-secondary mb-8 inline-flex items-center gap-2"
          onClick={() => setSelectedEvent(null)}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Meetups
        </button>
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Meetups"
        subtitle="Connect with like-minded people in your city. Casual gatherings, networking, and fun."
      />

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center shadow-lg">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white"
            placeholder="Search meetups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-400">
            <Filter className="h-4 w-4 text-indigo-500" />
            <select
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option className="bg-slate-950">All Categories</option>
              <option className="bg-slate-950">Networking</option>
              <option className="bg-slate-950">Social</option>
              <option className="bg-slate-950">Hobbies</option>
              <option className="bg-slate-950">Tech</option>
            </select>
          </div>

          <select
            className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-sm focus:outline-none cursor-pointer text-slate-400"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
          >
            <option className="bg-slate-950">All Dates</option>
            <option className="bg-slate-950">Today</option>
            <option className="bg-slate-950">Tomorrow</option>
            <option className="bg-slate-950">This Month</option>
          </select>

          <button
            onClick={resetFilters}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
            title="Reset Filters"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 animate-pulse">Loading meetups...</p>
        </div>
      ) : filteredMeetups.length === 0 ? (
        <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <Search className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No meetups found</h3>
          <p className="text-slate-400">Try adjusting your filters or search terms.</p>
          <button onClick={resetFilters} className="bg-slate-800 text-white px-6 py-2 rounded-lg mt-6">Clear All Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetups.map(meetup => (
            <EventCard
              key={meetup.id || meetup._id}
              event={meetup}
              isRegistered={joinedEvents[meetup.id || meetup._id]}
              onRegister={handleJoin}
              onClick={setSelectedEvent}
            // onDelete={handleDelete} // This prop was not defined in the original code, removing it.
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Meetups;
