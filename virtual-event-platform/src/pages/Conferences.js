import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, RotateCcw, Loader2, ArrowLeft } from 'lucide-react';
import EventDetail from './EventDetail';
import EventCard from '../components/EventCard';
import PageHeader from '../components/PageHeader';

function Conferences() {
  const [conferences, setConferences] = useState([]);
  const [filteredConferences, setFilteredConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredConferences, setRegisteredConferences] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'All Categories',
    date: 'All Dates',
    price: 'Price - Any',
  });

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('registeredConferences')) || {};
    setRegisteredConferences(saved);

    if (user && (user._id || user.id)) {
      fetchUserBookings();
    }
  }, []);

  const fetchUserBookings = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/my-bookings`, { withCredentials: true });
      const bookings = response.data;
      const registeredMap = { ...registeredConferences };
      bookings.forEach(b => {
        if (b.eventId) registeredMap[b.eventId._id || b.eventId.id] = true;
      });
      setRegisteredConferences(registeredMap);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      const predefinedConferences = [
        {
          id: 'conf_1',
          title: "Annual Tech Summit 2025",
          date: "2025-06-10",
          location: "Hyderabad International Convention Center",
          organizer: "TechLeaders Association",
          category: "Technology",
          price: 0,
          image: "https://img.freepik.com/free-vector/technology-conference-bannertemplate_1361-2226.jpg"
        },
        {
          id: 'conf_2',
          title: "Healthcare Innovation Conference",
          date: "2025-06-18",
          location: "Taj Conference Center, Mumbai",
          organizer: "Health Innovations India",
          category: "Healthcare",
          price: 100,
          image: "https://img.freepik.com/free-psd/gradient-medical-care-facebook-template_23-2150514853.jpg"
        },
        {
          id: 'conf_3',
          title: "Financial Markets Summit",
          date: "2025-07-05",
          location: "The Grand Ballroom, New Delhi, India",
          organizer: "Financial Today Group",
          category: "Finance",
          price: 200,
          image: "https://img.freepik.com/free-vector/financial-business-world-successful-management-concept_1284-5601.jpg"
        }
      ];

      const storedConferences = JSON.parse(localStorage.getItem('Conference')) || [];
      const allConferences = [...predefinedConferences, ...storedConferences];
      const uniqueConferences = Array.from(new Map(allConferences.map(e => [e.id || e._id, e])).values());

      setConferences(uniqueConferences);
      setFilteredConferences(uniqueConferences);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    let filtered = [...conferences];

    if (searchTerm) {
      filtered = filtered.filter(c =>
        (c.title || c.eventName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.organizer || c.organizerName).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.category !== 'All Categories') {
      filtered = filtered.filter(c => c.category === filters.category);
    }

    if (filters.date !== 'All Dates') {
      const today = new Date();
      filtered = filtered.filter(c => {
        const eventDate = new Date(c.date || c.startDate);
        if (filters.date === 'Today') {
          return eventDate.toDateString() === today.toDateString();
        } else if (filters.date === 'Tomorrow') {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          return eventDate.toDateString() === tomorrow.toDateString();
        } else if (filters.date === 'This Month') {
          return eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear();
        }
        return true;
      });
    }

    if (filters.price !== 'Price - Any') {
      filtered = filtered.filter(c => {
        if (filters.price === 'Free') return (c.price === 0 || c.ticketType === 'Free');
        if (filters.price === 'Paid') return (c.price > 0 || c.ticketType === 'Paid');
        return true;
      });
    }

    setFilteredConferences(filtered);
  }, [filters, conferences, searchTerm]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterClick = async (id) => {
    if (!user) {
      alert("Please login to register for events.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/book', {
        eventId: id
      }, { withCredentials: true });

      if (response.status === 201) {
        setRegisteredConferences(prev => ({ ...prev, [id]: true }));
        const current = JSON.parse(localStorage.getItem('registeredConferences')) || {};
        localStorage.setItem('registeredConferences', JSON.stringify({ ...current, [id]: true }));
        alert("Registration Successful!");
      }
    } catch (error) {
      console.error('Registration failed:', error);
      const msg = error.response?.data?.error || "Registration failed. Please try again.";
      alert(msg);
    }
  };

  const handleDelete = (id) => {
    const updated = conferences.filter(c => (c.id || c._id) !== id);
    setConferences(updated);
    localStorage.setItem('Conference', JSON.stringify(updated));
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
          <ArrowLeft className="h-4 w-4" /> Back to Conferences
        </button>
        <EventDetail event={selectedEvent} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Conferences"
        subtitle="Explore upcoming conferences and high-profile professional summits from global leaders."
      />

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center shadow-lg">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white"
            placeholder="Search by title or organizer..."
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
              <option className="bg-slate-950">Technology</option>
              <option className="bg-slate-950">Business</option>
              <option className="bg-slate-950">Healthcare</option>
              <option className="bg-slate-950">Finance</option>
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

          <select
            className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-sm focus:outline-none cursor-pointer text-slate-400"
            name="price"
            value={filters.price}
            onChange={handleFilterChange}
          >
            <option className="bg-slate-950">Price - Any</option>
            <option className="bg-slate-950">Free</option>
            <option className="bg-slate-950">Paid</option>
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
          <p className="text-slate-400 animate-pulse">Loading conferences...</p>
        </div>
      ) : filteredConferences.length === 0 ? (
        <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <Search className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No conferences found</h3>
          <p className="text-slate-400">Try adjusting your filters or search terms.</p>
          <button onClick={resetFilters} className="bg-slate-800 text-white px-6 py-2 rounded-lg mt-6">Clear All Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConferences.map(conference => (
            <EventCard
              key={conference.id || conference._id}
              event={conference}
              isRegistered={registeredConferences[conference.id || conference._id]}
              onRegister={handleRegisterClick}
              onClick={setSelectedEvent}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Conferences;
