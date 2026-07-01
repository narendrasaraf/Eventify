import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles, Loader2, Calendar, MapPin,
  Globe, Tag, CreditCard, CheckCircle, Video,
  Zap, RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';

const SAMPLE_PROMPTS = [
  'A 2-day tech conference on Fullstack Development next Friday at Hyatt Regency Mumbai, entry ₹1499, capacity 100 people.',
  'A free online workshop on Introduction to Python Data Science using Google Meet on July 15th from 4 PM to 6 PM.',
  'A hybrid corporate panel discussion about AI Innovation next month, starting at 10 AM, ticket price ₹500.',
];

// ── DRAFT FIELD ───────────────────────────────────────────
function DraftField({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 bg-surface-2 rounded-xl p-3 border border-border">
      <Icon className="w-4 h-4 text-brand shrink-0 mt-0.5" />
      <div>
        <div className="text-xs text-text-3 mb-0.5">{label}</div>
        <div className="text-sm text-text-1 font-medium">{value}</div>
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────
export default function CoCreator() {
  const [prompt, setPrompt] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [draft, setDraft] = useState(null);
  const navigate = useNavigate();

  const handleDraft = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || drafting) return;
    setDrafting(true);
    setDraft(null);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/v1/intelligence/draft-event',
        { prompt },
        { withCredentials: true }
      );
      if (res.data.status === 'success') {
        setDraft(res.data.data.eventDraft);
        toast.success('AI drafted your event!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to parse event description');
    } finally {
      setDrafting(false);
    }
  };

  const handlePublish = async () => {
    if (!draft || publishing) return;
    setPublishing(true);
    try {
      const form = new FormData();
      Object.entries(draft).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, v);
      });
      const res = await axios.post('http://localhost:5000/api/events', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      if (res.data.status === 'success') {
        toast.success('Event published successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish event');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="page-wrap space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand" />
          </div>
          <span className="badge badge-brand">AI Workspace</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-text-1">AI Co-Creator</h1>
        <p className="text-text-2 mt-1.5 max-w-xl">
          Describe your event in plain English. The AI will draft a complete event configuration — instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left — Input */}
        <div className="card space-y-5">
          <form onSubmit={handleDraft} className="space-y-4">
            <div>
              <label className="label">Event Description</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                disabled={drafting}
                rows={6}
                placeholder="e.g. A 2-day fullstack conference at Hyatt Mumbai next Friday, ₹1499 entry, 100 attendees..."
                className="input font-sans leading-relaxed resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={drafting || !prompt.trim()}
              className="btn-primary btn-lg w-full"
            >
              {drafting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Drafting with AI...</>
                : <><Sparkles className="w-4 h-4" /> Generate Event Draft</>
              }
            </button>
          </form>

          {/* Sample prompts */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="text-xs font-semibold text-text-3 uppercase tracking-wider">Try an example</div>
            <div className="space-y-2">
              {SAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  className="w-full text-left text-xs text-text-2 hover:text-text-1 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl p-3 leading-relaxed transition-all"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Draft Preview */}
        <div className="card min-h-[420px] flex flex-col">
          {drafting ? (
            <div className="flex-1 space-y-4 animate-pulse">
              <div className="skeleton h-6 w-2/3 rounded-lg" />
              <div className="skeleton h-4 w-1/2 rounded-lg" />
              <div className="skeleton h-4 w-3/4 rounded-lg" />
              <div className="skeleton h-24 rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
              </div>
            </div>
          ) : draft ? (
            <div className="flex-1 flex flex-col space-y-5">
              {/* Draft header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-xs font-semibold text-success">AI Draft Ready</span>
                    {draft.type && <span className="badge badge-brand">{draft.type}</span>}
                  </div>
                  <h2 className="font-display text-xl font-bold text-text-1 leading-tight">
                    {draft.eventName || 'Untitled Event'}
                  </h2>
                  {draft.description && (
                    <p className="text-sm text-text-2 mt-2 leading-relaxed line-clamp-3">{draft.description}</p>
                  )}
                </div>
                <button
                  onClick={() => { setDraft(null); setPrompt(''); }}
                  className="btn-ghost btn-sm shrink-0"
                  title="Start over"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Draft fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                <DraftField icon={Calendar} label="Start Date"
                  value={draft.startDate ? new Date(draft.startDate).toLocaleString() : null} />
                <DraftField icon={Calendar} label="End Date"
                  value={draft.endDate ? new Date(draft.endDate).toLocaleString() : null} />
                <DraftField icon={Globe} label="Mode" value={draft.mode} />
                {(draft.mode === 'Online' || draft.mode === 'Hybrid')
                  ? <DraftField icon={Video} label="Platform" value={draft.meetingPlatform || 'Google Meet'} />
                  : <DraftField icon={MapPin} label="Venue" value={draft.venueName} />
                }
                <DraftField icon={Tag} label="Category" value={draft.category} />
                <DraftField icon={CreditCard} label="Ticket"
                  value={draft.ticketType === 'Paid' ? `₹${draft.ticketPrice}` : draft.ticketType || 'Free'} />
              </div>

              {/* Publish */}
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="btn-primary btn-lg w-full mt-auto"
              >
                {publishing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                  : <><Zap className="w-4 h-4" /> Confirm & Publish Event</>
                }
              </button>
            </div>
          ) : (
            <div className="empty-state flex-1">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-brand/60" />
              </div>
              <div>
                <div className="font-semibold text-text-1 mb-1">Waiting for your idea</div>
                <div className="text-sm text-text-2 max-w-xs">
                  Write a description on the left and hit Generate. Your event draft will appear here.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
