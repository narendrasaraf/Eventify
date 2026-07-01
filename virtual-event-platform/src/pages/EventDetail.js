import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  Globe,
  MapPin,
  CreditCard,
  ThumbsUp,
  Video,
  Share2,
  BadgeCheck,
  ShieldCheck,
  Loader2,
  Send,
  X,
  Sparkles
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

function EventDetail({ event: propEvent }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [event, setEvent] = useState(propEvent || null);
  const [loadingEvent, setLoadingEvent] = useState(!propEvent);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!propEvent && id) {
      const fetchEvent = async () => {
        setLoadingEvent(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/events/${id}`, { withCredentials: true });
          const eventData = res.data.event || res.data.data?.event;
          if (eventData) {
            setEvent(eventData);
          }
        } catch (err) {
          console.error("Failed to load event details:", err);
          toast.error("Failed to load event details.");
        } finally {
          setLoadingEvent(false);
        }
      };
      fetchEvent();
    }
  }, [id, propEvent]);

  // AI Chat Assistant State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "agent",
      text: `Hello! I am your AI Host for this event. Ask me anything about the schedule, timings, location, or ticketing details!`
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  if (loadingEvent) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 animate-pulse font-medium">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 max-w-lg mx-auto">
        <X className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Event Not Found</h3>
        <p className="text-slate-400">The event details page you requested does not exist or has been removed.</p>
        <button onClick={() => navigate('/discover')} className="btn-primary mt-6 mx-auto">Back to Discover Feed</button>
      </div>
    );
  }

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
          navigate('/tickets');
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

      // Dev Sandbox checkout bypass if it is mock order
      if (orderRes.data.id && orderRes.data.id.startsWith('order_mock_')) {
        setLoading(false);
        if (window.confirm(`[Eventify Checkout Sandbox]\n\nSimulating payment order: ${orderRes.data.id}\nAmount: ₹${event.ticketPrice}\n\nClick OK to simulate successful payment, or Cancel to simulate cancellation.`)) {
          const mockPaymentId = `pay_mock_${Date.now()}`;
          const mockSignature = `sig_mock_${Date.now()}`;
          const verifyRes = await axios.post('http://localhost:5000/api/payment/verify', {
            razorpay_order_id: orderRes.data.id,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature,
            eventId: event._id
          }, { withCredentials: true });

          if (verifyRes.status === 200) {
            toast.success("Sandbox: Payment Successful! Event Booked.");
            navigate('/tickets');
          }
        } else {
          toast.error("Sandbox: Payment cancelled by user.");
        }
        return;
      }

      const options = {
        key: orderRes.data.key || "rzp_test_placeholder",
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
              navigate('/tickets');
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
          color: "#4F46E5"
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error("Payment gateway not loaded.");
      }
    } catch (err) {
      toast.error("Failed to initiate payment. Please login.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userQuestion = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userQuestion }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      // API call to the support assistant endpoint
      const response = await axios.post("http://localhost:5000/api/v1/intelligence/support-agent", {
        eventId: event._id,
        question: userQuestion,
        history: chatMessages.slice(-6) // Send recent message history context
      });

      if (response.data && response.data.data) {
        setChatMessages((prev) => [...prev, { sender: "agent", text: response.data.data.answer }]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "Sorry, I am having trouble connecting to my knowledge base. Please try asking again shortly."
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const formattedDate = new Date(event.startDate || event.date).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = event.startDate
    ? new Date(event.startDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : event.time;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Image and Description */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative group rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-800">
            <img
              src={event.posterUrl ? (event.posterUrl.startsWith('/uploads') ? `http://localhost:5000${event.posterUrl}` : event.posterUrl) : event.image}
              alt={event.eventName}
              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-primary/20 text-indigo-400 border border-indigo-500/30">
                {event.category}
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-slate-900/60 text-white border border-slate-700">
                {event.mode}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-text-primary leading-tight">
              {event.eventName || event.title}
            </h1>

            <div className="flex flex-wrap gap-6 border-y border-slate-800 py-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold tracking-wider">Date</p>
                  <p className="text-sm font-semibold text-text-primary">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold tracking-wider">Time</p>
                  <p className="text-sm font-semibold text-text-primary">{formattedTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold tracking-wider">Attendance</p>
                  <p className="text-sm font-semibold text-text-primary">{event.attendeeLimit || 'Unlimited'} seats</p>
                </div>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-bold text-text-primary mb-4">About the Event</h3>
              <p className="text-text-secondary leading-relaxed text-lg italic">
                Hosted by <span className="text-primary font-bold">{event.organizerName || event.organizer}</span>
              </p>
              <p className="text-text-secondary leading-relaxed text-lg mt-4">
                {event.description || `Join us for a specialized session in ${event.category}. This event focuses on cutting-edge developments and practical applications. Don't miss this opportunity to connect with experts and peers in the field.`}
              </p>
            </div>

            <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} className="h-8 w-8 rounded-full border-2 border-background" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary">
                  <span className="text-text-primary font-bold">120+</span> people have already registered
                </p>
              </div>
              <button className="flex items-center gap-2 text-primary font-bold hover:scale-110 transition-transform">
                <ThumbsUp className="h-5 w-5" />
                Interested
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Action Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 card bg-surface p-8 border-slate-800 shadow-2xl shadow-indigo-500/10 space-y-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-text-secondary uppercase tracking-widest text-center">Registration Details</h4>
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between text-base">
                  <span className="text-text-secondary flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Entry Type
                  </span>
                  <span className="text-text-primary font-bold">{event.ticketType || 'Free'}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="text-text-secondary flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Language
                  </span>
                  <span className="text-text-primary font-bold">{event.language || 'English'}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="text-text-secondary flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Mode
                  </span>
                  <span className="text-text-primary font-bold">{event.mode}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="text-text-secondary flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Location
                  </span>
                  <span className="text-text-primary font-bold text-right truncate max-w-[120px]">
                    {event.mode === 'Online' ? 'Virtual' : event.venueName}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8 space-y-6">
              <div className="text-center">
                <p className="text-text-secondary text-sm mb-1 uppercase tracking-tighter">Ticket Price</p>
                <p className="text-4xl font-black text-text-primary">
                  {event.ticketType === 'Free' ? 'FREE' : `₹${event.ticketPrice}`}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  className="btn-primary w-full py-4 text-base font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    event.ticketType === 'Free' ? 'Join Now' : 'Pay & Book Ticket'
                  )}
                </button>

                {event.meetingLink && (
                  <button
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    onClick={handleJoinMeet}
                  >
                    <Video className="h-5 w-5" /> Launch Meeting
                  </button>
                )}

                <button className="w-full btn-secondary py-3 flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" /> Share Event
                </button>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-1 text-xs text-text-secondary">
                <BadgeCheck className="h-3 w-3 text-emerald-500" /> Secure Registration
              </div>
              <p className="text-[10px] text-slate-600">
                By joining, you agree to our Terms and Conditions regarding event attendance and cancellations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Chat Assistant Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen ? (
          <div className="w-[360px] sm:w-[400px] h-[500px] card bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-6 duration-300">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-primary leading-none">AI Host</h4>
                  <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Online
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-slate-950 text-text-secondary border border-slate-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 text-slate-500 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-2 text-xs flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" /> AI is thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
              <input
                type="text"
                placeholder="Ask about location, price, details..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 input-field py-2 text-sm"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="bg-primary hover:bg-primary-hover disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl p-2.5 transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : null}

        {/* Floating Action Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all group font-bold text-sm"
        >
          <Sparkles className="h-5 w-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
          <span>AI Host Q&A</span>
        </button>
      </div>
    </div>
  );
}

export default EventDetail;
