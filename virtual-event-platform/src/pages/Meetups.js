import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PagesStyles.css';
import EventDetail from './EventDetail';

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

    if (user && user._id) {
      fetchUserBookings(user._id);
    }
  }, []);

  const fetchUserBookings = async (userId) => {
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
          time: "18:00 - 20:00",
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
          time: "17:00 - 19:00",
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
          time: "19:00 - 21:00",
          location: "Business Hub, Viman Nagar",
          organizer: "Startup Catalysts",
          category: "Business",
          price: 50,
          image: "https://img.freepik.com/free-vector/flat-design-business-workshop-youtube-thumbnail-template_23-2149393100.jpg"
        },
        {
          id: 'meet_4',
          title: "Finance Management",
          date: "2025-05-02",
          time: "19:00 - 21:00",
          location: "Business Hub, Viman Nagar",
          organizer: "Startup Catalysts",
          category: "Business",
          price: 100,
          image: "https://img.freepik.com/free-psd/financial-management-concept_23-2151964759.jpg"
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
        } else if (filters.date === 'This Weekend') {
          const day = today.getDay();
          const weekendStart = new Date(today);
          weekendStart.setDate(today.getDate() + ((6 - day + 7) % 7));
          const weekendEnd = new Date(weekendStart);
          weekendEnd.setDate(weekendStart.getDate() + 1);
          return eventDate >= weekendStart && eventDate <= weekendEnd;
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

  const handleImageClick = (meetup) => {
    if (joinedEvents[meetup.id || meetup._id]) {
      setSelectedEvent(meetup);
    }
  };

  if (selectedEvent) {
    return (
      <div className="page-container">
        <button className="filter-button" onClick={() => setSelectedEvent(null)} style={{ marginBottom: '20px' }}>Back to Meetups</button>
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Meetups</h1>
        <p>Connect with like-minded people at local meetups</p>
      </div>

      <div className="filters">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input-field"
            placeholder="Search meetups..."
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
          <option>Books & Literature</option>
          <option>Business</option>
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
          <div className="loading">Loading meetups...</div>
        ) : filteredMeetups.length === 0 ? (
          <div className="no-results" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#aaa' }}>
            <h3>No meetups found matching your criteria.</h3>
          </div>
        ) : (
          filteredMeetups.map(meetup => {
            const meetId = meetup.id || meetup._id;
            return (
              <div className="event-card" key={meetId}>
                <div className="event-image">
                  <img
                    src={meetup.image || (meetup.posterPath ? `http://localhost:5000${meetup.posterPath}` : '/placeholder.jpg')}
                    alt={meetup.title || meetup.eventName}
                    onClick={() => handleImageClick(meetup)}
                    style={{ cursor: joinedEvents[meetId] ? 'pointer' : 'default' }}
                  />
                </div>
                <div className="event-details">
                  <h3>{meetup.title || meetup.eventName}</h3>
                  <div className="event-info">
                    <p><span>Date:</span> {new Date(meetup.date || meetup.startDate).toLocaleDateString()}</p>
                    <p><span>Time:</span> {meetup.time || (meetup.startDate ? new Date(meetup.startDate).toLocaleTimeString() : 'N/A')}</p>
                    <p><span>Location:</span> {meetup.location || meetup.venueName || 'Virtual'}</p>
                    <p><span>Organizer:</span> {meetup.organizer || meetup.organizerName}</p>
                    <p><span>Category:</span> {meetup.category}</p>
                    <p><span>Price:</span> {meetup.price === 0 || meetup.ticketType === 'Free' ? 'Free' : `${meetup.price || 'Paid'} ₹`}</p>
                  </div>
                  {joinedEvents[meetId] ? (
                    <div className="register-button done">Registered</div>
                  ) : (
                    <button
                      className="register-button"
                      onClick={() => handleJoin(meetId)}
                    >
                      Register Now
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

export default Meetups;
