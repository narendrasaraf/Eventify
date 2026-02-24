import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, RotateCcw, Loader2, ArrowLeft } from 'lucide-react';
import EventDetail from './EventDetail';
import EventCard from '../components/EventCard';
import PageHeader from '../components/PageHeader';

function Webinars() {
  const [webinars, setWebinars] = useState([]);
  const [filteredWebinars, setFilteredWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredWebinars, setRegisteredWebinars] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'All Categories',
    date: 'All Dates',
    price: 'Price - Any'
  });

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('registeredWebinars')) || {};
    setRegisteredWebinars(saved);

    if (user && (user._id || user.id)) {
      fetchUserBookings();
    }
  }, []);

  const fetchUserBookings = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/my-bookings`, { withCredentials: true });
      const bookings = response.data;
      const registeredMap = { ...registeredWebinars };
      bookings.forEach(b => {
        if (b.eventId) registeredMap[b.eventId._id || b.eventId.id] = true;
      });
      setRegisteredWebinars(registeredMap);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      const predefinedWebinars = [
        {
          id: 'webinar_1',
          title: "Modern Web Development",
          date: "2025-05-15",
          organizer: "Tech Solutions Inc.",
          category: "Technology",
          price: 0,
          image: "https://img.freepik.com/free-vector/advertising-agency-webinar-template_23-2150034479.jpg"
        },
        {
          id: 'webinar_2',
          title: "Data Science for Beginners",
          date: "2025-05-20",
          organizer: "DataMinds Academy",
          category: "Education",
          price: 100,
          image: "https://img.freepik.com/free-vector/data-analysis-template-design_23-2150713832.jpg"
        },
        {
          id: 'webinar_3',
          title: "Digital Marketing Strategies",
          date: "2025-05-25",
          organizer: "Marketing Pro",
          category: "Business",
          price: 0,
          image: "https://img.freepik.com/free-vector/webinar-banner-invitation_52683-50986.jpg"
        }
      ];

      const storedWebinars = JSON.parse(localStorage.getItem('Webinar')) || [];
      const allWebinars = [...predefinedWebinars, ...storedWebinars];
      const uniqueWebinars = Array.from(new Map(allWebinars.map(w => [w.id || w._id, w])).values());

      setWebinars(uniqueWebinars);
      setFilteredWebinars(uniqueWebinars);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    let filtered = [...webinars];

    if (searchTerm) {
      filtered = filtered.filter(w =>
        (w.title || w.eventName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.organizer || w.organizerName).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.category !== 'All Categories') {
      filtered = filtered.filter(w => w.category === filters.category);
    }

    if (filters.date !== 'All Dates') {
      const today = new Date();
      filtered = filtered.filter(w => {
        const eventDate = new Date(w.date || w.startDate);
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
      filtered = filtered.filter(w => {
        if (filters.price === 'Free') return (w.price === 0 || w.ticketType === 'Free');
        if (filters.price === 'Paid') return (w.price > 0 || w.ticketType === 'Paid');
        return true;
      });
    }

    setFilteredWebinars(filtered);
  }, [filters, webinars, searchTerm]);

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
        setRegisteredWebinars(prev => ({ ...prev, [id]: true }));
        const updated = { ...JSON.parse(localStorage.getItem('registeredWebinars') || '{}'), [id]: true };
        localStorage.setItem('registeredWebinars', JSON.stringify(updated));
        alert("Registration Successful!");
      }
    } catch (error) {
      console.error('Registration failed:', error);
      const msg = error.response?.data?.error || "Registration failed. Please try again.";
      alert(msg);
    }
  };

  const handleDelete = (id) => {
    const updated = webinars.filter(w => (w.id || w._id) !== id);
    setWebinars(updated);
    localStorage.setItem('Webinar', JSON.stringify(updated.filter(w => w.createdByUser)));
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
          <ArrowLeft className="h-4 w-4" /> Back to Webinars
        </button>
        <EventDetail event={selectedEvent} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <PageHeader
          title="Webinars"
          subtitle="Join expert-led sessions from the comfort of your home. Learn, interact, and master new skills."
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center shadow-lg">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white"
            placeholder="Search webinars..."
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
              <option className="bg-slate-950">Education</option>
              <option className="bg-slate-950">Health</option>
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
          <p className="text-slate-400 animate-pulse">Loading webinars...</p>
        </div>
      ) : filteredWebinars.length === 0 ? (
        <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <Search className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No webinars found</h3>
          <p className="text-slate-400">Try adjusting your filters or search terms.</p>
          <button onClick={resetFilters} className="bg-slate-800 text-white px-6 py-2 rounded-lg mt-6">Clear All Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWebinars.map(webinar => (
            <EventCard
              key={webinar.id || webinar._id}
              event={webinar}
              isRegistered={registeredWebinars[webinar.id || webinar._id]}
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

export default Webinars;