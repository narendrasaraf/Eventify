import React from 'react';
import { Calendar, MapPin, Clock, ArrowRight, Trash2 } from 'lucide-react';

const EventCard = ({
    event,
    isRegistered,
    onRegister,
    onClick,
    onDelete
}) => {
    const eventId = event.id || event._id;
    const title = event.title || event.eventName;
    const date = new Date(event.date || event.startDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const time = event.time || (event.startDate ? new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '7:00 PM');
    const location = event.location || event.venueName || (event.mode === 'online' ? 'Virtual' : 'Global');
    const description = event.description || `Join this amazing ${event.category || 'event'} to learn and connect with professionals.`;

    return (
        <div
            className="card transition-all duration-300 group relative flex flex-col h-full cursor-pointer"
            onClick={() => isRegistered && onClick && onClick(event)}
        >
            {/* Action buttons (Delete) if applicable */}
            {onDelete && event.createdByUser && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(eventId); }}
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all z-10"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}

            <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                        {event.category || 'Event'}
                    </span>
                    {isRegistered && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Registered
                        </span>
                    )}
                </div>

                <h3 className="text-2xl font-bold text-slate-100 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
                    {title}
                </h3>

                <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        <span>{date}</span>
                        <span className="text-slate-600">•</span>
                        <Clock className="h-4 w-4 text-indigo-500" />
                        <span>{time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <MapPin className="h-4 w-4 text-indigo-500" />
                        <span className="truncate">{location}</span>
                    </div>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {description}
                </p>
            </div>

            <div className="mt-auto">
                {isRegistered ? (
                    <button
                        className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm flex items-center justify-center gap-2"
                        onClick={(e) => { e.stopPropagation(); onClick && onClick(event); }}
                    >
                        View Event Access <ArrowRight className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm flex items-center justify-center gap-2 group/btn"
                        onClick={(e) => { e.stopPropagation(); onRegister && onRegister(eventId); }}
                    >
                        Register Now
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default EventCard;
