import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PagesStyles.css';
import EventDetail from './EventDetail';

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
    // Load local storage registered events for UI consistency
    const saved = JSON.parse(localStorage.getItem('registeredWebinars')) || {};
    setRegisteredWebinars(saved);

    // If user is logged in, we could also fetch their bookings from backend
    // to sync the "Registered" state.
    if (user && user._id) {
      fetchUserBookings(user._id);
    }
  }, []);

  const fetchUserBookings = async (userId) => {
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
          time: "10:00 AM - 12:00 PM",
          organizer: "Tech Solutions Inc.",
          category: "Technology",
          price: 0,
          image: "https://img.freepik.com/free-vector/advertising-agency-webinar-template_23-2150034479.jpg"
        },
        {
          id: 'webinar_2',
          title: "Data Science for Beginners",
          date: "2025-05-20",
          time: "2:00 PM - 4:00 PM",
          organizer: "DataMinds Academy",
          category: "Education",
          price: 100,
          image: "https://img.freepik.com/free-vector/data-analysis-template-design_23-2150713832.jpg"
        },
        {
          id: 'webinar_3',
          title: "Digital Marketing Strategies",
          date: "2025-05-25",
          time: "11:00 AM - 1:00 PM",
          organizer: "Marketing Pro",
          category: "Business",
          price: 0,
          image: "https://img.freepik.com/free-vector/webinar-banner-invitation_52683-50986.jpg"
        },
        {
          id: 'webinar_4',
          title: "Language Learnings",
          date: "2025-05-27",
          time: "11:00 AM - 1:00 PM",
          organizer: "Languages Pro",
          category: "Education",
          price: 0,
          image: "https://img.freepik.com/free-psd/flat-design-language-learning-facebook-template_23-2150550297.jpg"
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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(w =>
        w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.organizer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'All Categories') {
      filtered = filtered.filter(w => w.category === filters.category);
    }

    // Date filter
    if (filters.date !== 'All Dates') {
      const today = new Date();
      filtered = filtered.filter(w => {
        const eventDate = new Date(w.date);
        if (filters.date === 'Today') {
          return eventDate.toDateString() === today.toDateString();
        } else if (filters.date === 'Tomorrow') {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          return eventDate.toDateString() === tomorrow.toDateString();
        } else if (filters.date === 'This Weekend') {
          const day = today.getDay();
          const weekendStart = new Date(today);
          weekendStart.setDate(today.getDate() + (5 - day));
          const weekendEnd = new Date(weekendStart);
          weekendEnd.setDate(weekendStart.getDate() + 2);
          return eventDate >= weekendStart && eventDate <= weekendEnd;
        } else if (filters.date === 'This Month') {
          return eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear();
        }
        return true;
      });
    }

    // Price filter
    if (filters.price !== 'Price - Any') {
      filtered = filtered.filter(w => {
        if (filters.price === 'Free') return w.price === 0;
        if (filters.price === 'Paid') return w.price > 0;
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
        const updated = { ...registeredWebinars, [id]: true };
        setRegisteredWebinars(updated);
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

  const handleImageClick = (webinar) => {
    if (registeredWebinars[webinar.id || webinar._id]) {
      setSelectedEvent(webinar);
    }
  };

  if (selectedEvent) {
    return (
      <div className="page-container">
        <button className="filter-button" onClick={() => setSelectedEvent(null)} style={{ marginBottom: '20px' }}>Back to Webinars</button>
        <EventDetail event={selectedEvent} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Webinars</h1>
        <p>Find and join online webinars on various topics</p>
      </div>

      <div className="filters">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input-field"
            placeholder="Search webinars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="filter-select" name="category" value={filters.category} onChange={handleFilterChange}>
          <option>All Categories</option>
          <option>Technology</option>
          <option>Business</option>
          <option>Education</option>
          <option>Health</option>
        </select>

        <select className="filter-select" name="date" value={filters.date} onChange={handleFilterChange}>
          <option>All Dates</option>
          <option>Today</option>
          <option>Tomorrow</option>
          <option>This Weekend</option>
          <option>This Month</option>
        </select>

        <select className="filter-select" name="price" value={filters.price} onChange={handleFilterChange}>
          <option>Price - Any</option>
          <option>Free</option>
          <option>Paid</option>
        </select>

        <button className="filter-button" onClick={() => {
          setSearchTerm('');
          setFilters({
            category: 'All Categories',
            date: 'All Dates',
            price: 'Price - Any'
          });
        }}>Reset</button>
      </div>

      <div className="events-grid">
        {loading ? (
          <div className="loading">Loading webinars...</div>
        ) : filteredWebinars.length === 0 ? (
          <div className="no-results" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#aaa' }}>
            <h3>No webinars found matching your criteria.</h3>
          </div>
        ) : (
          filteredWebinars.map(webinar => {
            const webinarId = webinar.id || webinar._id;
            return (
              <div className="event-card" key={webinarId}>
                <div className="event-image">
                  <img
                    src={webinar.image || (webinar.posterPath ? `http://localhost:5000${webinar.posterPath}` : '/placeholder.jpg')}
                    alt={webinar.title || webinar.eventName}
                    onClick={() => handleImageClick(webinar)}
                    style={{ cursor: registeredWebinars[webinarId] ? 'pointer' : 'default' }}
                  />
                </div>
                <div className="event-details">
                  <h3>{webinar.title || webinar.eventName}</h3>
                  <div className="event-info">
                    <p><span>Date:</span> {new Date(webinar.date || webinar.startDate).toLocaleDateString()}</p>
                    <p><span>Time:</span> {webinar.time || (webinar.startDate ? new Date(webinar.startDate).toLocaleTimeString() : 'N/A')}</p>
                    <p><span>Organizer:</span> {webinar.organizer || webinar.organizerName}</p>
                    <p><span>Category:</span> {webinar.category}</p>
                    <p><span>Price:</span> {webinar.price === 0 || webinar.ticketType === 'Free' ? 'Free' : `${webinar.price || 'Paid'} ₹`}</p>
                  </div>
                  {registeredWebinars[webinarId] ? (
                    <div className="register-button done">Registered</div>
                  ) : (
                    <button className="register-button" onClick={() => handleRegisterClick(webinarId)}>
                      Register Now
                    </button>
                  )}
                  {webinar.createdByUser && (
                    <button className="theme-delete-button" onClick={() => handleDelete(webinarId)} style={{ marginTop: '10px', background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,0,0,0.2)', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Webinars;