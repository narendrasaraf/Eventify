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
    Plus
} from 'lucide-react';
import EventCard from '../components/EventCard';

function Dashboard() {
    const [activeTab, setActiveTab] = useState('registered');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
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

            if (activeTab === 'registered') {
                setEvents(eventsRes.data.map(b => b.eventId).filter(e => e !== null));
            } else {
                // filter for created by user
                setEvents(eventsRes.data.filter(e => e.organizerEmail === userRes.data.user.email));
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

    if (loading && !user) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                <p className="text-slate-400 animate-pulse">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
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
                        <Link to="/create-event" className="btn-primary flex items-center justify-center gap-2 px-8">
                            <Plus className="h-4 w-4" /> Create New Event
                        </Link>
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium">
                            <LogOut className="h-4 w-4" /> Logout Session
                        </button>
                    </div>
                </div>
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
                            <Link to="/allevents" className="btn-primary px-8">Browse Events</Link>
                        ) : (
                            <Link to="/create-event" className="btn-primary px-8">Get Started</Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                            <EventCard
                                key={event._id || event.id}
                                event={event}
                                isRegistered={activeTab === 'registered'}
                                onClick={(ev) => navigate(`/event/${ev._id || ev.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
