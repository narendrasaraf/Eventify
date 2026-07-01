import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard,
    Ticket,
    Loader2,
    Mail,
    User as UserIcon,
    Shield,
    LogOut,
    Plus,
    Sparkles,
    Calendar,
    Clock,
    X,
    Check
} from 'lucide-react';
import EventCard from '../components/EventCard';

function Dashboard() {
    const [activeTab, setActiveTab] = useState('registered');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // AI Schedule Optimizer State
    const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [scheduleInput, setScheduleInput] = useState("");
    const [startTime, setStartTime] = useState("09:00 AM");
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedSchedule, setOptimizedSchedule] = useState(null);

    // AI Dashboard Insights State
    const [insightQuery, setInsightQuery] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [insightResult, setInsightResult] = useState(null);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [userRes, eventsRes] = await Promise.all([
                axios.get('http://localhost:5000/auth/me', { withCredentials: true }),
                activeTab === 'registered'
                    ? axios.get('http://localhost:5000/api/my-bookings', { withCredentials: true })
                    : axios.get('http://localhost:5000/api/events', { withCredentials: true })
            ]);

            setUser(userRes.data.user);

            const bookingsArray = Array.isArray(eventsRes.data)
                ? eventsRes.data
                : eventsRes.data.data?.bookings || [];

            const eventsArray = Array.isArray(eventsRes.data)
                ? eventsRes.data
                : eventsRes.data.data?.events || [];

            if (activeTab === 'registered') {
                setEvents(bookingsArray.map(b => b.eventId).filter(e => e !== null));
            } else {
                // filter for created by user
                setEvents(eventsArray.filter(e => e.organizerEmail === userRes.data.user.email));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleOptimize = async (e) => {
        if (e) e.preventDefault();
        if (!scheduleInput.trim() || isOptimizing) return;

        setIsOptimizing(true);
        setOptimizedSchedule(null);

        // Parse line-by-line topics
        const topics = scheduleInput
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        try {
            const response = await axios.post("http://localhost:5000/api/v1/intelligence/schedule-optimizer", {
                topics,
                constraints: {
                    startTime,
                    eventName: selectedEvent?.eventName
                }
            }, { withCredentials: true });

            if (response.data?.data?.schedule) {
                setOptimizedSchedule(response.data.data.schedule);
            }
        } catch (err) {
            alert("Failed to optimize schedule: " + (err.response?.data?.message || err.message));
        } finally {
            setIsOptimizing(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                <p className="text-slate-400 animate-pulse">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 relative">
            {/* Profile Overview */}
            <div className="card bg-slate-900/50 border-slate-800 p-8 rounded-[32px] overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-20 -mt-20" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 p-1">
                            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="h-10 w-10 text-indigo-400" />
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-6 w-6 rounded-full border-4 border-slate-900 flex items-center justify-center" title="Active">
                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Mail className="h-4 w-4" />
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                <Shield className="h-3.5 w-3.5" />
                                {user?.authProvider} account
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <Link to="/co-creator" className="btn-primary flex items-center justify-center gap-2 px-8">
                            <Plus className="h-4 w-4" /> Create New Event
                        </Link>
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium">
                            <LogOut className="h-4 w-4" /> Logout Session
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Operations Assistant */}
            <div className="card bg-slate-900/40 border-slate-800/80 p-8 rounded-[32px] space-y-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                    <h2 className="text-xl font-bold text-white">AI Operations Assistant</h2>
                </div>
                <p className="text-sm text-text-secondary">
                    Ask questions about attendee ticket sales, categories, venue configurations, or generate business recommendations.
                </p>

                <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!insightQuery.trim() || isAnalyzing) return;
                    setIsAnalyzing(true);
                    setInsightResult(null);
                    try {
                        const response = await axios.post("http://localhost:5000/api/v1/intelligence/dashboard-insights", {
                            query: insightQuery
                        }, { withCredentials: true });
                        if (response.data?.data?.insights) {
                            setInsightResult(response.data.data.insights);
                        }
                    } catch (err) {
                        alert("Failed to analyze metrics: " + (err.response?.data?.message || err.message));
                    } finally {
                        setIsAnalyzing(false);
                    }
                }} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="e.g. Which of my event categories has generated the most ticket sales?"
                        value={insightQuery}
                        onChange={(e) => setInsightQuery(e.target.value)}
                        className="flex-1 input-field py-3 text-sm"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isAnalyzing}
                        className="btn-primary flex items-center gap-2 px-6 py-3 font-bold shadow-lg shadow-indigo-600/20"
                    >
                        {isAnalyzing ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                        ) : (
                            <><Sparkles className="h-4 w-4 text-indigo-200" /> Ask AI</>
                        )}
                    </button>
                </form>

                {insightResult && (
                    <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 relative animate-in fade-in zoom-in-95 duration-300">
                        <button
                            onClick={() => { setInsightResult(null); setInsightQuery(""); }}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="prose prose-invert max-w-none">
                            {renderMarkdown(insightResult)}
                        </div>
                    </div>
                )}
            </div>

            {/* Event Management Section */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex gap-1 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-full md:w-fit">
                        {[
                            { id: 'registered', label: 'Registered Events', icon: Ticket },
                            { id: 'created', label: 'Organized Events', icon: LayoutDashboard }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                        <p className="text-slate-400 animate-pulse">Fetching events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center">
                        <div className="bg-slate-900 h-20 w-20 rounded-3xl flex items-center justify-center mb-6 border border-slate-800">
                            {activeTab === 'registered' ? <Ticket className="h-10 w-10 text-slate-700" /> : <LayoutDashboard className="h-10 w-10 text-slate-700" />}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {activeTab === 'registered' ? "No registrations yet" : "No events created"}
                        </h3>
                        <p className="text-slate-400 max-w-md mx-auto mb-8 font-medium">
                            {activeTab === 'registered'
                                ? "Start your journey by discovering amazing webinars, conferences, and meetups happening around you."
                                : "Ready to host? Create your first event and start building your community today."}
                        </p>
                        {activeTab === 'registered' ? (
                            <Link to="/discover" className="btn-primary px-8">Browse Events</Link>
                        ) : (
                            <Link to="/co-creator" className="btn-primary px-8">Get Started</Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                            <div key={event._id || event.id} className="relative group/card flex flex-col">
                                <EventCard
                                    event={event}
                                    isRegistered={activeTab === 'registered'}
                                    onClick={(ev) => navigate(`/event/${ev._id || ev.id}`)}
                                />
                                {activeTab === 'created' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedEvent(event);
                                            setOptimizedSchedule(null);
                                            setScheduleInput("");
                                            setIsOptimizerOpen(true);
                                        }}
                                        className="mt-3 py-2 px-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center gap-2 transition-all w-full"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" /> Optimize Schedule
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Schedule Optimizer Modal */}
            {isOptimizerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl card bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 rounded-[24px] max-h-[90vh] overflow-y-auto space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-indigo-400" />
                                <h3 className="text-xl font-bold text-white">AI Timetable Planner</h3>
                            </div>
                            <button
                                onClick={() => setIsOptimizerOpen(false)}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div>
                            <p className="text-sm text-text-secondary">
                                Generate a conflict-free session plan for <span className="text-indigo-400 font-bold">"{selectedEvent?.eventName}"</span>.
                            </p>
                        </div>

                        {!optimizedSchedule ? (
                            <form onSubmit={handleOptimize} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                        Session Topics & Speakers (one per line)
                                    </label>
                                    <textarea
                                        value={scheduleInput}
                                        onChange={(e) => setScheduleInput(e.target.value)}
                                        className="input-field w-full min-h-[150px] py-3 text-sm"
                                        placeholder="e.g.&#10;Keynote: State of Web 2026 by Jane Doe (45 mins)&#10;Panel: The Future of AI in Dev (60 mins)&#10;Break: Lunch and Networking (60 mins)&#10;Workshop: building with Gemini API (90 mins)"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                            Start Time
                                        </label>
                                        <input
                                            type="text"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="input-field w-full text-sm"
                                            placeholder="09:00 AM"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isOptimizing}
                                    className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-600/20"
                                >
                                    {isOptimizing ? (
                                        <><Loader2 className="h-5 w-5 animate-spin" /> Sequencing Agenda...</>
                                    ) : (
                                        <><Sparkles className="h-5 w-5 text-indigo-200" /> Generate Optimized Timeline</>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="space-y-4">
                                    {optimizedSchedule.tracks.map((track, tIdx) => (
                                        <div key={tIdx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                                            <h4 className="font-bold text-base text-indigo-400 flex items-center gap-2">
                                                <Calendar className="h-4.5 w-4.5" /> {track.trackName}
                                            </h4>
                                            
                                            <div className="space-y-3">
                                                {track.slots.map((slot, sIdx) => (
                                                    <div key={sIdx} className="flex gap-4 border-l-2 border-indigo-600/50 pl-4 py-1">
                                                        <div className="w-40 shrink-0 text-xs text-slate-400 flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5 text-indigo-400" />
                                                            {slot.time}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{slot.sessionTitle}</p>
                                                            {slot.speaker && (
                                                                <p className="text-xs text-text-secondary mt-0.5">by {slot.speaker}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setOptimizedSchedule(null)}
                                        className="btn-secondary flex-1 py-3 text-sm font-bold"
                                    >
                                        Re-draft Agenda
                                    </button>
                                    <button
                                        onClick={() => setIsOptimizerOpen(false)}
                                        className="btn-primary flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2"
                                    >
                                        <Check className="h-4 w-4" /> Save Schedule
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, index) => {
        // Bullet list
        if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
                <li key={index} className="text-slate-300 text-sm ml-4 list-disc mt-1">
                    {parseBoldText(line.substring(2))}
                </li>
            );
        }
        // Headings
        if (line.startsWith("### ")) {
            return <h4 key={index} className="text-base font-bold text-indigo-400 mt-4 mb-2">{line.substring(4)}</h4>;
        }
        if (line.startsWith("## ")) {
            return <h3 key={index} className="text-lg font-bold text-white mt-6 mb-3">{line.substring(3)}</h3>;
        }
        if (line.startsWith("# ")) {
            return <h2 key={index} className="text-xl font-black text-white mt-8 mb-4 border-b border-slate-800 pb-2">{line.substring(2)}</h2>;
        }
        // Plain text line
        return <p key={index} className="text-slate-400 text-sm leading-relaxed mt-2 min-h-[1em]">{parseBoldText(line)}</p>;
    });
};

const parseBoldText = (text) => {
    // fallback or standard regex split for bolding **word**
    const boldRegex = /\*\*(.*?)\*\*/g;
    const items = [];
    let lastIndex = 0;
    let match;
    while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            items.push(text.substring(lastIndex, match.index));
        }
        items.push(<strong key={match.index} className="text-white font-extrabold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < text.length) {
        items.push(text.substring(lastIndex));
    }
    return items.length > 0 ? items : text;
};

export default Dashboard;
