import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AllEvents() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/events')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched events:', data); // Debug log
        setEvents(data);
      })
      .catch(err => console.error('Error fetching events:', err));
  }, []);

  const handleBook = async (eventId) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Please login to book an event');
      navigate('/login');
      return;
    }
    const user = JSON.parse(storedUser);

    try {
      await axios.post('http://localhost:5000/api/book', {
        eventId: eventId
      }, { withCredentials: true });
      alert('Booking successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>All Events</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {events.length === 0 && <p>No events available.</p>}
        {events.map(event => (
          <div key={event._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', width: '300px' }}>
            <h3>{event.eventName}</h3>
            <p>{event.description}</p>
            {event.posterPath && (
              <img
                src={`http://localhost:5000${event.posterPath}`}
                alt="Poster"
                style={{ width: '100%', height: 'auto' }}
              />
            )}
            <p><strong>Date:</strong> {event.startDate}</p>
            <p><strong>Venue:</strong> {event.venueName || 'Online'}</p>
            <button
              onClick={() => handleBook(event._id)}
              style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllEvents;
