import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

import { toast } from "react-toastify";
import axios from "axios";

function EventDetail({ event }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const handleJoinMeet = () => {
    const link = event.meetingLink || event.googleMapLink;

    if (link && link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      toast.error("Meeting link is not available for this event.");
    }
  };

  const handlePayment = async () => {
    if (event.ticketType === 'Free' || !event.ticketPrice || event.ticketPrice === 0) {
      // Direct booking for free events
      try {
        const res = await axios.post('http://localhost:5000/api/book', { eventId: event._id }, { withCredentials: true });
        if (res.status === 201) {
          toast.success("Successfully registered for the event!");
          navigate('/dashboard');
        }
      } catch (err) {
        toast.error("Failed to register. Please login first.");
      }
      return;
    }

    // Paid event flow
    setLoading(true);
    try {
      const orderRes = await axios.post('http://localhost:5000/api/payment/create-order', {
        amount: event.ticketPrice
      }, { withCredentials: true });

      const options = {
        key: "rzp_test_placeholder", // Should be from env or backend
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "Eventify",
        description: `Payment for ${event.eventName}`,
        order_id: orderRes.data.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post('http://localhost:5000/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: event._id
            }, { withCredentials: true });

            if (verifyRes.status === 200) {
              toast.success("Payment Successful! Event Booked.");
              navigate('/dashboard');
            }
          } catch (err) {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com"
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Failed to initiate payment. Please login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-detail-container">
      <h2 className="event-title">{event.eventName || event.title}</h2>
      <div className="event-main">
        <div className="event-left">
          <img src={event.posterUrl || event.image} alt={event.eventName} className="event-banner" />
          <div className="event-about">
            <h3>About The Event</h3>
            <p>~ {event.organizerName || event.organizer}</p>
            <p>~ {event.startDate || event.date}</p>
            <p>~ Join us for a deep dive into {event.category} related topics.</p>
            <div className="interested">
              <FaThumbsUp /> 60 Are Interested{" "}
              <button className="btn-interest">I'm Interested</button>
            </div>
          </div>
        </div>
        <div className="event-info-card">
          <p>
            <FaCalendarAlt /> {event.startDate || event.date}
          </p>
          <p>
            <FaClock /> {event.startDate ? new Date(event.startDate).toLocaleTimeString() : event.time}
          </p>
          <p>
            <FaUsers /> Age Limit - 16+
          </p>
          <p>
            <FaLanguage /> {event.language || "English"}
          </p>
          <p>
            <FaCreditCard /> Mode - {event.mode}
          </p>
          {event.mode === 'Online' && (
            <p>
              <FaUsers /> Platform: {event.meetingPlatform || 'Google Meet'}
            </p>
          )}
          <p>
            <FaMapMarkerAlt /> Location: {event.mode === 'Online' ? 'Virtual' : event.venueName}
          </p>
          <hr />
          <div className="price-section">
            <strong>Ticket: {event.ticketType === 'Free' ? 'FREE' : `₹${event.ticketPrice}`}</strong>
            <br />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn-book" onClick={handlePayment} disabled={loading}>
                {loading ? "Processing..." : (event.ticketType === 'Free' ? t('book_now') : t('pay_and_book'))}
              </button>
              {event.meetingLink && (
                <button className="btn-book" onClick={handleJoinMeet} style={{ backgroundColor: '#2196F3' }}>
                  {t('launch_meeting')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
