import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PagesStyles.css';
import EventDetail from './EventDetail';

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

    if (user && user._id) {
      fetchUserBookings(user._id);
    }
  }, []);

  const fetchUserBookings = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/my-bookings/${userId}`);
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
          time: "9:00 AM - 5:00 PM",
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
          time: "10:00 AM - 4:00 PM",
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
          time: "11:00 AM - 6:00 PM",
          location: "The Grand Ballroom, New Delhi, India",
          organizer: "Financial Today Group",
          category: "Finance",
          price: 200,
          image: "https://img.freepik.com/free-vector/financial-business-world-successful-management-concept_1284-5601.jpg"
        },
        {
          id: 'conf_4',
          title: "Future Economics Conference",
          date: "2025-07-05",
          time: "2:00 PM - 8:00 PM",
          location: "The Grand Ballroom, New Delhi, India",
          organizer: "Financial Today Group",
          category: "Finance",
          price: 0,
          image: "https://img.freepik.com/premium-psd/elegant-black-gold-theme-digital-marketing-live-webinar-social-media-post-template_236275-328.jpg"
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
        userId: user._id,
        eventId: id
      });

      if (response.status === 201) {
        setRegisteredConferences(prev => ({ ...prev, [id]: true }));
        const current = JSON.parse(localStorage.getItem('registeredConferences')) || {};
        localStorage.setItem('registeredConferences', JSON.stringify({ ...current, [id]: true }));
        alert("Registration Successful!");
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert("Registration failed. Please try again.");
    }
  };

  const handleDelete = (id) => {
    const updated = conferences.filter(c => (c.id || c._id) !== id);
    setConferences(updated);
    localStorage.setItem('Conference', JSON.stringify(updated));
  };

  const handleImageClick = (conference) => {
    if (registeredConferences[conference.id || conference._id]) {
      setSelectedEvent(conference);
    }
  };

  if (selectedEvent) {
    return (
      <div className="page-container">
        <button className="filter-button" onClick={() => setSelectedEvent(null)} style={{ marginBottom: '20px' }}>Back to Conferences</button>
        <EventDetail event={selectedEvent} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Conferences</h1>
        <p>Explore upcoming conferences and events</p>
      </div>

      <div className="filters">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input-field"
            placeholder="Search conferences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
        >
          <option>All Categories</option>
          <option>Technology</option>
          <option>Business</option>
          <option>Education</option>
          <option>Finance</option>
          <option>Healthcare</option>
        </select>

        <select
          className="filter-select"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
        >
          <option>All Dates</option>
          <option>Today</option>
          <option>Tomorrow</option>
          <option>This Weekend</option>
          <option>This Month</option>
        </select>

        <select
          className="filter-select"
          name="price"
          value={filters.price}
          onChange={handleFilterChange}
        >
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
          <div className="loading">Loading conferences...</div>
        ) : filteredConferences.length === 0 ? (
          <div className="no-results" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#aaa' }}>
            <h3>No conferences found matching your criteria.</h3>
          </div>
        ) : (
          filteredConferences.map(conference => {
            const confId = conference.id || conference._id;
            return (
              <div className="event-card" key={confId}>
                <div className="event-image">
                  <img
                    src={conference.image || (conference.posterPath ? `http://localhost:5000${conference.posterPath}` : '/placeholder.jpg')}
                    alt={conference.title || conference.eventName}
                    onClick={() => handleImageClick(conference)}
                    style={{ cursor: registeredConferences[confId] ? 'pointer' : 'default' }}
                  />
                </div>
                <div className="event-details">
                  <h3>{conference.title || conference.eventName}</h3>
                  <div className="event-info">
                    <p><span>Date:</span> {new Date(conference.date || conference.startDate).toLocaleDateString()}</p>
                    <p><span>Time:</span> {conference.time || (conference.startDate ? new Date(conference.startDate).toLocaleTimeString() : 'N/A')}</p>
                    <p><span>Location:</span> {conference.location || conference.venueName || 'Virtual'}</p>
                    <p><span>Organizer:</span> {conference.organizer || conference.organizerName}</p>
                    <p><span>Category:</span> {conference.category}</p>
                    <p><span>Price:</span> {conference.price === 0 || conference.ticketType === 'Free' ? 'Free' : `${conference.price || 'Paid'} ₹`}</p>
                  </div>
                  {registeredConferences[confId] ? (
                    <div className="register-button done">Registered</div>
                  ) : (
                    <button className="register-button" onClick={() => handleRegisterClick(confId)}>
                      Register Now
                    </button>
                  )}
                  {conference.createdByUser && (
                    <button className="theme-delete-button" onClick={() => handleDelete(confId)} style={{ marginTop: '10px', background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,0,0,0.2)', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}>
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

export default Conferences;
