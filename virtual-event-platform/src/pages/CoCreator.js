import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Tag,
  CreditCard,
  CheckCircle,
  HelpCircle,
  Video
} from 'lucide-react';
import { toast } from 'react-toastify';

function CoCreator() {
  const [prompt, setPrompt] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [draftResult, setDraftResult] = useState(null);
  const navigate = useNavigate();

  const samplePrompts = [
    "A 2-day tech conference on Fullstack Development next Friday at Hyatt Regency Mumbai, entry ₹1499, capacity 100 people.",
    "A free online workshop on Introduction to Python Data Science using Google Meet on July 15th from 4 PM to 6 PM.",
    "A hybrid corporate panel discussion about AI Innovation next month, starting at 10 AM, ticket price ₹500."
  ];

  const handleDraftSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsDrafting(true);
    setDraftResult(null);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/v1/intelligence/draft-event',
        { prompt },
        { withCredentials: true }
      );
      if (res.data.status === 'success') {
        setDraftResult(res.data.data.eventDraft);
        toast.success('AI successfully drafted your event details!');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to parse event description');
    } finally {
      setIsDrafting(false);
    }
  };

  const handlePublish = async () => {
    if (!draftResult) return;

    setIsPublishing(true);
    try {
      const form = new FormData();
      Object.entries(draftResult).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.append(key, value);
        }
      });

      const res = await axios.post(
        'http://localhost:5000/api/events',
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      if (res.data.status === 'success') {
        toast.success('Your event has been successfully initialized and published!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to publish event');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="section-container max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="mb-8 text-left">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20 ai-spark-pulse">
            <Sparkles className="h-6 w-6 text-indigo-400" />
          </div>
          <span className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">AI workspace</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">AI Co-Creator Canvas</h1>
        <p className="text-slate-400 text-base mt-2 max-w-2xl">
          Describe your event idea in natural language and let Eventify AI build the configuration structure instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Pane: prompt Input & Controls */}
        <div className="glass-panel space-y-6">
          <form onSubmit={handleDraftSubmit} className="space-y-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="text-sm font-bold text-slate-300 ml-1">Event Concept Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A weekend React coding boot camp starting July 12th in Pune, registration fee 500 INR, limit 80 attendees..."
                className="w-full h-44 bg-slate-950/80 border border-slate-800 text-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all placeholder:text-slate-600 text-sm leading-relaxed"
                disabled={isDrafting}
              />
            </div>

            <button
              type="submit"
              disabled={isDrafting || !prompt.trim()}
              className="btn-accent w-full py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isDrafting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  <span>Drafting Event Details...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-white" />
                  <span>Draft Event Configuration</span>
                </>
              )}
            </button>
          </form>

          {/* Quick templates */}
          <div className="space-y-3 pt-4 border-t border-slate-800/60 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Try these prompt styles</h4>
            <div className="flex flex-col gap-2.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p)}
                  className="text-left text-xs bg-slate-950/40 hover:bg-slate-900/60 border border-slate-800/40 rounded-xl p-3 text-slate-400 hover:text-slate-200 transition-all leading-relaxed"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Live preview panel */}
        <div className="glass-panel min-h-[500px] flex flex-col justify-between border-dashed border-2 border-slate-800/80 bg-slate-900/10">
          {isDrafting ? (
            /* Loading Skeleton state */
            <div className="space-y-6 animate-pulse p-4">
              <div className="h-8 bg-slate-800 rounded-lg w-2/3" />
              <div className="space-y-3">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
              </div>
              <div className="h-32 bg-slate-800 rounded-2xl w-full" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-slate-800 rounded-xl w-full" />
                <div className="h-10 bg-slate-800 rounded-xl w-full" />
              </div>
            </div>
          ) : draftResult ? (
            /* Visual preview of drafted payload */
            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">AI Draft Proposal</h3>
                </div>
                <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
                  <span className="text-xs font-bold text-indigo-400">{draftResult.type || 'Event'}</span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                  {draftResult.eventName || 'Untitled Event'}
                </h2>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {draftResult.description || 'No description extracted.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/40 pt-4">
                <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/20">
                  <Calendar className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-xs">Start Date</span>
                    {draftResult.startDate ? new Date(draftResult.startDate).toLocaleString() : 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/20">
                  <Clock className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-xs">End Date</span>
                    {draftResult.endDate ? new Date(draftResult.endDate).toLocaleString() : 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/20">
                  <Globe className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-xs">Mode</span>
                    {draftResult.mode || 'N/A'}
                  </div>
                </div>

                {draftResult.mode === 'Online' || draftResult.mode === 'Hybrid' ? (
                  <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/20">
                    <Video className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <div>
                      <span className="text-slate-500 block text-xs">Platform</span>
                      {draftResult.meetingPlatform || 'Google Meet'}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/20">
                    <MapPin className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <div>
                      <span className="text-slate-500 block text-xs">Venue</span>
                      {draftResult.venueName || 'To Be Announced'}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/40 pt-4 text-sm bg-slate-950/20 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-indigo-400" />
                  <span className="font-semibold text-slate-300">{draftResult.ticketType || 'Free'}</span>
                </div>
                <span className="font-bold text-white text-lg">
                  {draftResult.ticketType === 'Paid' ? `₹${draftResult.ticketPrice}` : 'Free'}
                </span>
              </div>

              <div className="pt-6">
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                      <span>Creating Event...</span>
                    </>
                  ) : (
                    <span>Confirm & Launch Event</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Empty state guiding user to compile */
            <div className="flex flex-col items-center justify-center gap-4 text-center my-auto p-8">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/60 shadow-xl">
                <HelpCircle className="h-10 w-10 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Awaiting Event Parameters</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Your AI-constructed draft preview card will populate here in real-time as you describe your concept parameters in the input panel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoCreator;
