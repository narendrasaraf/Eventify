import React from 'react';
import { Calendar, MapPin, Clock, ArrowRight, Trash2, Sparkles } from 'lucide-react';

const CATEGORY_COLORS = {
  Technology:    { bg: 'bg-brand/10',   text: 'text-brand',   border: 'border-brand/20' },
  Conference:    { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  Meetup:        { bg: 'bg-sky-500/10',  text: 'text-sky-400',  border: 'border-sky-500/20' },
  Workshop:      { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Webinar:       { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20' },
};

function getCategoryStyle(cat) {
  return CATEGORY_COLORS[cat] || { bg: 'bg-surface-3', text: 'text-text-2', border: 'border-border' };
}

export default function EventCard({ event, isRegistered, onRegister, onClick, onDelete, onOptimize }) {
  const eventId    = event.id || event._id;
  const title      = event.title || event.eventName || 'Untitled Event';
  const category   = event.category || 'Event';
  const date       = new Date(event.date || event.startDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const time       = event.time
    || (event.startDate ? new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '7:00 PM');
  const location   = event.location || event.venueName || (event.mode === 'online' ? 'Virtual / Online' : 'TBD');
  const description = event.description
    || `Join this ${category.toLowerCase()} and connect with professionals from across the industry.`;
  const catStyle   = getCategoryStyle(category);

  return (
    <div className="card-interactive group relative flex flex-col h-full animate-fade-up">
      {/* Delete button */}
      {onDelete && event.createdByUser && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(eventId); }}
          className="absolute top-4 right-4 btn-sm btn-danger opacity-0 group-hover:opacity-100 z-10 transition-opacity"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col" onClick={() => isRegistered && onClick && onClick(event)}>
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`badge ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
            {category}
          </span>
          {isRegistered && (
            <span className="badge badge-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse2" />
              Registered
            </span>
          )}
          {onOptimize && (
            <button
              onClick={(e) => { e.stopPropagation(); onOptimize(event); }}
              className="badge badge-brand cursor-pointer hover:bg-brand/20 flex items-center gap-1 border border-brand/30"
              title="AI Schedule Optimizer"
            >
              <Sparkles className="w-2.5 h-2.5 text-brand" /> Optimize
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-text-1 mb-3 line-clamp-2 leading-snug group-hover:text-brand transition-colors">
          {title}
        </h3>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-text-2">
            <Calendar className="w-3.5 h-3.5 text-brand shrink-0" />
            <span>{date}</span>
            <span className="text-text-3">·</span>
            <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-2">
            <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-text-2 leading-relaxed line-clamp-2 mb-6 flex-1">
          {description}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-auto">
        {isRegistered ? (
          <button
            className="btn-secondary btn-md w-full"
            onClick={(e) => { e.stopPropagation(); onClick && onClick(event); }}
          >
            View Access <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            className="btn-primary btn-md w-full"
            onClick={(e) => { e.stopPropagation(); onRegister && onRegister(eventId); }}
          >
            Register <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
