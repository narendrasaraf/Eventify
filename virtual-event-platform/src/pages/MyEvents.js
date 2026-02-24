import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PagesStyles.css';
import Webhook from './Webhook';

function MyEvents() {
  const [activeTab, setActiveTab] = useState('registered');
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWebhook, setShowWebhook] = useState(false);
  const [webhookEventName, setWebhookEventName] = useState('');

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
          setAllEvents(data);
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

  const now = new Date();

  const registeredEvents = activeTab === 'registered' ? allEvents : [];

  const createdEvents = allEvents.filter(event => event.createdByUser);

  const getImageUrl = (event) => {
    if (event.posterUrl) return event.posterUrl;
    if (event.posterPath) {
      return `http://localhost:5000${event.posterPath.startsWith('/') ? '' : '/'}${event.posterPath}`;
    }
    if (event.image) {
      return event.image.startsWith('http') ? event.image : `http://localhost:5000${event.image.startsWith('/') ? '' : '/'}${event.image}`;
    }
    return 'https://via.placeholder.com/300x200?text=No+Poster';
  };

  const renderRegisteredEvents = () => (
    <div className="events-grid">
      {registeredEvents.map(event => (
        <div className="event-card" key={event._id}>
          <div className="event-image">
            <img src={getImageUrl(event)} alt={event.eventName} />
          </div>
          <div className="event-details">
            <h3>{event.eventName}</h3>
            <div className="event-info">
              <p><span>Date:</span> {event.startDate}</p>
              <p><span>Time:</span> {event.startDate}</p>
              <p><span>Organizer:</span> {event.organizerName}</p>
              <p><span>Category:</span> {event.category}</p>
              <p>
                <span>Status:</span>
                <span className="status-badge">Upcoming</span>
              </p>
            </div>
            <div className="event-actions">

              <button
                className="register-button"
                onClick={() => {
                  setWebhookEventName(event.eventName);
                  setShowWebhook(true);
                }}
              >
                Send Message to community
              </button>
            </div>

            {showWebhook && webhookEventName === event.eventName && (
              <div className="mt-4">
                <Webhook />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCreatedEvents = () => (
    <div className="events-grid">
      {createdEvents.map(event => (
        <div className="event-card" key={event._id}>
          <div className="event-image">
            <img src={getImageUrl(event)} alt={event.eventName} />
          </div>
          <div className="event-details">
            <h3>{event.eventName}</h3>
            <div className="event-info">
              <p><span>Date:</span> {event.startDate}</p>
              <p><span>Time:</span> TBD</p>
              <p><span>Status:</span> <span className="status-badge">Active</span></p>
              <p><span>Registrations:</span> N/A</p>
            </div>
            <div className="event-actions">
              <button className="register-button">Manage Event</button>
              <button className="register-button">View Registrations</button>
            </div>
          </div>
        </div>
      ))}
      <div className="create-new">
        <Link to="/create-event" className="register-button">
          Create New Event
        </Link>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Events</h1>
        <p>Manage your events and registrations</p>
      </div>

      <div className="tabs">
        <div
          className={`tab ${activeTab === 'registered' ? 'active' : ''}`}
          onClick={() => setActiveTab('registered')}
        >
          Registered Events
        </div>
        <div
          className={`tab ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          Create Events
        </div>
      </div>

      <div className="tab-content">
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : (
          <>
            {activeTab === 'registered' && registeredEvents.length > 0 && renderRegisteredEvents()}
            {activeTab === 'created' && createdEvents.length > 0 && renderCreatedEvents()}
            {((activeTab === 'registered' && registeredEvents.length === 0) ||
              (activeTab === 'created' && createdEvents.length === 0)) && (
                <div className="no-events">
                  <p>Create an Event. ~ Webinar/Conference/Meetups.</p>
                  {activeTab === 'created' && (
                    <Link to="/create-event" className="register-button">
                      Create Event
                    </Link>
                  )}
                  {activeTab === 'registered' && (
                    <Link to="/" className="register-button">
                      Browse Events
                    </Link>
                  )}
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyEvents;
