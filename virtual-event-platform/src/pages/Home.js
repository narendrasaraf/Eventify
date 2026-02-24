import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Tag, Users, ArrowRight, Loader2 } from 'lucide-react';
import EventDetail from './EventDetail';

function Home() {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setConferences([
        {
          id: 1,
          title: "Annual Tech Summit 2025",
          date: "June 10-12, 2025",
          location: "Hyderabad International Convention Center",
          organizer: "TechLeaders Association",
          category: "Technology",
          image: "https://img.freepik.com/free-vector/technology-conference-bannertemplate_1361-2226.jpg"
        },
        {
          id: 2,
          title: "Healthcare Innovation Conference",
          date: "June 18-20, 2025",
          location: "Taj Conference Center, Mumbai",
          organizer: "Health Innovations India",
          category: "Healthcare",
          image: "https://img.freepik.com/free-psd/gradient-medical-care-facebook-template_23-2150514853.jpg"
        },
        {
          id: 3,
          title: "Financial Markets Summit",
          date: "July 5-7, 2025",
          location: "The Grand Ballroom, New Delhi, India",
          organizer: "Financial Today Group",
          category: "Finance",
          image: "https://img.freepik.com/free-vector/financial-business-world-successful-management-concept_1284-5601.jpg"
        },
        {
          id: 4,
          title: "Future Economics Conference",
          date: "July 5-7, 2025",
          location: "The Grand Ballroom, New Delhi, India",
          organizer: "Financial Today Group",
          category: "Finance",
          image: "https://img.freepik.com/premium-psd/elegant-black-gold-theme-digital-marketing-live-webinar-social-media-post-template_236275-328.jpg"
        },
        {
          id: 5,
          title: "Pune JavaScript Developers",
          date: "April 20, 2025",
          location: "Workspaces Co., Koregaon Park",
          organizer: "Pune JS Community",
          category: "Technology",
          image: "https://img.freepik.com/free-vector/gradient-halftone-technology-webinar_23-2149195110.jpg"
        },
        {
          id: 6,
          title: "Book Lovers Club Meetup",
          date: "April 25, 2025",
          location: "Cafe Reading Room, Aundh",
          organizer: "Pune Readers Circle",
          category: "Books & Literature",
          image: "https://img.freepik.com/free-vector/hand-drawn-book-club-youtube-thumbnail_23-2149702259.jpg"
        },
        {
          id: 7,
          title: "Entrepreneurship Networking",
          date: "May 2, 2025",
          location: "Business Hub, Viman Nagar",
          organizer: "Startup Catalysts",
          category: "Business",
          image: "https://img.freepik.com/free-vector/flat-design-business-workshop-youtube-thumbnail-template_23-2149393100.jpg"
        },
        {
          id: 8,
          title: "Finance Management",
          date: "May 2, 2025",
          location: "Business Hub, Viman Nagar",
          organizer: "Startup Catalysts",
          category: "Business",
          image: "https://img.freepik.com/free-psd/financial-management-concept_23-2151964759.jpg"
        },
        {
          id: 9,
          title: "Modern Web Development",
          date: "May 15, 2025",
          location: "Online Event", // Added location
          organizer: "Tech Solutions Inc.",
          category: "Technology",
          image: "https://img.freepik.com/free-vector/advertising-agency-webinar-template_23-2150034479.jpg"
        },
        {
          id: 10,
          title: "Data Science for Beginners",
          date: "May 20, 2025",
          location: "DataMinds HQ, Bangalore", // Added location
          organizer: "DataMinds Academy",
          category: "Education",
          image: "https://img.freepik.com/free-vector/data-analysis-template-design_23-2150713832.jpg"
        },
        {
          id: 11,
          title: "Digital Marketing Strategies",
          date: "May 25, 2025",
          location: "Marketing Hub, Chennai", // Added location
          organizer: "Marketing Pro",
          category: "Business",
          image: "https://img.freepik.com/free-vector/webinar-banner-invitation_52683-50986.jpg"
        },
        {
          id: 12,
          title: "Language Learnings",
          date: "May 27, 2025",
          location: "Languages Pro Institute, Delhi", // Added location
          organizer: "Languages Pro",
          category: "Education",
          image: "https://img.freepik.com/free-psd/flat-design-language-learning-facebook-template_23-2150550297.jpg"
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleRegister = (id) => {
    if (!registeredEvents.includes(id)) {
      setRegisteredEvents(prev => [...prev, id]);
    }
  };

  if (selectedEvent) {
    return (
      <div className="section-container">
        <button
          onClick={() => setSelectedEvent(null)}
          className="btn-secondary mb-8 inline-flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4 rotate-180" /> Back to Discover
        </button>
        <EventDetail event={selectedEvent} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="section-container pt-12">
        <div className="mb-12 border-l-4 border-primary pl-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl">
            Discover Events
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl leading-relaxed">
            Explore the latest technological summits, industry conferences, and local meetups.
            Connect with experts and grow your network.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-text-secondary font-medium animate-pulse">Fetching events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {conferences.map(event => (
              <div
                key={event.id}
                className="card flex flex-col group overflow-hidden p-0 bg-surface/50 hover:bg-surface border-slate-800"
              >
                <div
                  className="relative h-48 w-full overflow-hidden cursor-pointer"
                  onClick={() => registeredEvents.includes(event.id) && setSelectedEvent(event)}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-primary/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                      {event.category}
                    </span>
                  </div>
                  {!registeredEvents.includes(event.id) && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <p className="text-white font-semibold text-sm">Register to see details</p>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-4 line-clamp-1 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-3 text-text-secondary text-sm">
                      <Calendar className="h-4 w-4 text-accent" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-secondary text-sm">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-secondary text-sm">
                      <Users className="h-4 w-4 text-accent" />
                      <span className="line-clamp-1">{event.organizer}</span>
                    </div>
                  </div>

                  {registeredEvents.includes(event.id) ? (
                    <div className="w-full py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-center text-sm font-bold flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Registered
                    </div>
                  ) : (
                    <button
                      className="btn-primary w-full group/btn flex items-center justify-center gap-2"
                      onClick={() => handleRegister(event.id)}
                    >
                      Register Now
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
