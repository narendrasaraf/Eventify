import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaLanguage,
  FaMapMarkerAlt,
  FaCreditCard,
  FaThumbsUp,
} from "react-icons/fa";
import "./EventDetail.css";

function EventDetail({ event }) {
  const navigate = useNavigate();

  if (!event) return null;

  const handleJoinZoom = () => {
    // googleMapLink now stores the Meet URL for Online events
    if (event.googleMapLink && event.googleMapLink.startsWith('http')) {
      window.open(event.googleMapLink, '_blank');
    } else {
      alert("Meeting link is not available for this event.");
    }
  };

  return (
    <div className="event-detail-container">
      <h2 className="event-title">{event.title}</h2>
      <div className="event-main">
        <div className="event-left">
          <img src={event.image} alt={event.title} className="event-banner" />
          <div className="event-about">
            <h3>About The Event</h3>
            <p>~ {event.organizer}</p>
            <p>~ {event.date}</p>
            <p>~ Join us for a deep dive into {event.category} related topics.</p>
            <div className="interested">
              <FaThumbsUp /> 60 Are Interested{" "}
              <button className="btn-interest">I'm Interested</button>
            </div>
          </div>
        </div>
        <div className="event-info-card">
          <p>
            <FaCalendarAlt /> {event.date}
          </p>
          <p>
            <FaClock /> {event.time}
          </p>
          <p>
            <FaUsers /> Age Limit - 16+
          </p>
          <p>
            <FaLanguage /> Hinglish
          </p>
          <p>
            <FaCreditCard /> Mode - Online
          </p>
          <p>
            <FaMapMarkerAlt /> Location: Virtual
          </p>
          <hr />
          <div className="price-section">
            <strong>Available : Join Fast</strong>
            <br />
            {/* <button className="btn-book">JOIN</button> */}
            <button className="btn-book" onClick={handleJoinZoom}>
              JOIN GOOGLE MEET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
