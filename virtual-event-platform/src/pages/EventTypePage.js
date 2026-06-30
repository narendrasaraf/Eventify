import React from 'react';
import { useLocation } from 'react-router-dom';

function EventTypePage() {
  const location = useLocation();
  const { state } = location;
  const events = state?.events || [];

  return (
    <div className="event-type-page">
      <h1>Events</h1>
      {events.length > 0 ? (
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              <strong>{event.name}</strong> - {event.description} (From: {event.startDate} To: {event.endDate})
            </li>
          ))}
        </ul>
      ) : (
        <p>No events available for this category.</p>
      )}
    </div>
  );
}

export default EventTypePage;