/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Zap, ArrowRight, CalendarDays, MonitorPlay, Users,
  Sparkles, Globe, BarChart2, CheckCircle, ChevronDown,
  MessageSquare, Star, Play, Brain, Target, TrendingUp,
  MapPin, Shield, Cpu, Layers, ChevronRight,
  Plus, Minus, Twitter, Linkedin, Github,
  Ticket,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
// TOPNAV
// ─────────────────────────────────────────────────────────
function TopNav({ user }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-canvas/90 backdrop-blur-xl border-b border-border' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-base text-text-1 tracking-tight">Eventify</span>
        </Link>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: '/conferences', label: 'Conferences' },
            { to: '/meetups', label: 'Meetups' },
            { to: '/discover', label: 'Events' },
            { to: '/pricing', label: 'Pricing' },
            { to: '/about', label: 'About' },
          ].map(n => (
            <Link key={n.to} to={n.to} className="nav-link px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <Link to="/dashboard" className="btn-primary btn-md">Dashboard <ArrowRight className="w-4 h-4" /></Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost btn-md hidden sm:inline-flex">Sign In</Link>
              <Link to="/signup" className="btn-primary btn-md">Get Started Free</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────
function Hero() {
  const words = ['Conferences', 'Meetups', 'Webinars', 'Workshops', 'Summits'];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden">
      {/* Dot-grid bg */}
      <div className="absolute inset-0 opacity-[0.035]" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-brand/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[300px] h-[300px] rounded-full bg-sky-500/6 blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-16 grid lg:grid-cols-[1fr_480px] gap-16 items-center">
        {/* Left — copy */}
        <div className="animate-fade-up">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/25 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse2" />
            <span className="text-xs font-semibold text-brand tracking-wide">AI-Powered Event Intelligence</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-[68px] font-extrabold text-text-1 leading-[1.04] tracking-tight mb-6">
            The intelligent<br />
            platform for
            <br />
            <span className="ai-glow-text relative" key={wordIdx} style={{ animation: 'fade-up 0.4s ease-out' }}>
              {words[wordIdx]}
            </span>
          </h1>

          <p className="text-lg text-text-2 leading-relaxed max-w-xl mb-10">
            Eventify combines AI co-creation, real-time analytics, and global discovery 
            in one platform — built for event professionals who demand more than a form.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Link to="/signup" className="btn-primary btn-lg shadow-2xl shadow-brand/25">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/discover" className="btn-secondary btn-lg group">
              <Play className="w-4 h-4 text-brand group-hover:scale-110 transition-transform" />
              Explore Events
            </Link>
          </div>
        </div>

        {/* Right — product preview card */}
        <div className="hidden lg:block animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <ProductPreviewCard />
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-text-3 animate-bounce">
        <span className="text-2xs uppercase tracking-widest">scroll</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// PRODUCT PREVIEW CARD (Hero right side)
// ─────────────────────────────────────────────────────────
function ProductPreviewCard() {
  const [tab, setTab] = useState('dashboard');
  return (
    <div className="relative">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-2xl bg-brand/8 blur-2xl scale-105" />
      <div className="relative glass-strong rounded-2xl overflow-hidden border border-brand/15">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-2/50">
          <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
          <div className="flex-1 mx-4 h-5 bg-surface-3 rounded-md text-2xs flex items-center px-2 text-text-3">
            eventify.ai/dashboard
          </div>
        </div>

        {/* Mini tabs */}
        <div className="flex border-b border-border bg-surface/80 text-xs">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'events',    label: 'Events' },
            { id: 'ai',        label: 'AI Copilot' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 font-medium transition-colors border-b-2 ${
                tab === t.id ? 'text-brand border-brand' : 'text-text-3 border-transparent hover:text-text-2'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5 space-y-4 text-xs min-h-[320px]">
          {tab === 'dashboard' && <DashPreview />}
          {tab === 'events' && <EventsPreview />}
          {tab === 'ai' && <AIPreview />}
        </div>
      </div>
    </div>
  );
}

function DashPreview() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-3 gap-3">
        {[['Events', '142', '+12%'], ['Attendees', '8.4k', '+23%'], ['Revenue', '₹2.1L', '+8%']].map(([l, v, t]) => (
          <div key={l} className="bg-surface-2 rounded-xl p-3 border border-border">
            <div className="text-text-3 mb-1">{l}</div>
            <div className="font-display text-base font-bold text-text-1">{v}</div>
            <div className="text-success">{t}</div>
          </div>
        ))}
      </div>
      <div className="bg-surface-2 rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-2 font-medium">Attendance trend</span>
          <span className="badge badge-success">Live</span>
        </div>
        <div className="flex items-end gap-1 h-16">
          {[40,55,38,70,82,60,88,95,72,100].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm transition-all" style={{
              height: `${h}%`,
              background: `rgba(99,102,241,${0.3 + h * 0.007})`,
            }} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {['Annual Tech Summit 2025', 'AI Builders Meetup', 'Design Systems Conf'].map((e, i) => (
          <div key={e} className="flex items-center justify-between bg-surface-2 rounded-lg px-3 py-2 border border-border">
            <span className="text-text-2 truncate">{e}</span>
            <span className={`badge ${i === 0 ? 'badge-success' : 'badge-brand'}`}>{i === 0 ? 'Live' : 'Soon'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsPreview() {
  return (
    <div className="space-y-3 animate-fade-in">
      {[
        { title: 'FullStack Summit 2025', cat: 'Conference', loc: 'Mumbai', date: 'Aug 10' },
        { title: 'JS Devs Meetup', cat: 'Meetup', loc: 'Pune', date: 'Aug 20' },
        { title: 'AI Workshop', cat: 'Workshop', loc: 'Virtual', date: 'Sep 5' },
        { title: 'Healthcare Innovation', cat: 'Conference', loc: 'Delhi', date: 'Sep 18' },
      ].map((e) => (
        <div key={e.title} className="flex items-center gap-3 bg-surface-2 rounded-xl p-3 border border-border group hover:border-brand/30 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <CalendarDays className="w-3.5 h-3.5 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-text-1 font-medium truncate">{e.title}</div>
            <div className="text-text-3 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3" />{e.loc} · {e.date}
            </div>
          </div>
          <span className="badge badge-neutral shrink-0">{e.cat}</span>
        </div>
      ))}
    </div>
  );
}

function AIPreview() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s < 3 ? s + 1 : s)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="bg-brand/5 border border-brand/20 rounded-xl p-3">
        <div className="text-text-3 mb-1.5 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-brand" />Your prompt</div>
        <div className="text-text-2 leading-relaxed">"2-day AI summit in Bangalore next month, ₹2499 entry, 200 seats"</div>
      </div>
      <div className="bg-surface-2 border border-border rounded-xl p-3 space-y-2">
        <div className="text-text-3 flex items-center gap-1.5 mb-2"><Cpu className="w-3 h-3 text-success" />AI Generated</div>
        {[
          ['Event', 'AI Summit Bangalore 2025'],
          ['Date', 'Aug 15–16, 2025'],
          ['Venue', 'ITC Gardenia, Bengaluru'],
          ['Price', '₹2,499 / attendee'],
        ].map(([k, v], i) => (
          <div key={k} className={`flex gap-2 transition-all duration-500 ${i <= step ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-text-3 w-14 shrink-0">{k}:</span>
            <span className="text-text-1 font-medium">{v}</span>
          </div>
        ))}
      </div>
      {step >= 3 && (
        <button className="w-full bg-brand text-white rounded-lg py-2 font-semibold text-xs animate-fade-up">
          Publish Event →
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LOGO STRIP
// ─────────────────────────────────────────────────────────
function LogoStrip() {
  const orgs = ['Google', 'Microsoft', 'Razorpay', 'Zomato', 'Freshworks', 'Meesho', 'CRED', 'InMobi'];
  return (
    <section className="py-14 border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-sm text-text-3 uppercase tracking-widest font-semibold">Trusted by teams at</p>
      </div>
      <div className="flex gap-12 items-center whitespace-nowrap" style={{
        animation: 'marquee 20s linear infinite',
      }}>
        {[...orgs, ...orgs].map((o, i) => (
          <span key={i} className="text-text-3 font-bold text-lg tracking-tight px-4 shrink-0">
            {o}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// STATS BAR
// ─────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { value: '12,000+', label: 'Events hosted', icon: CalendarDays },
    { value: '280k+',   label: 'Attendees worldwide', icon: Users },
    { value: '190+',    label: 'Countries & territories', icon: Globe },
    { value: '4.9/5',   label: 'Average platform rating', icon: Star },
    { value: '99.9%',   label: 'Platform uptime SLA', icon: Shield },
    { value: '60s',     label: 'Avg. AI event creation', icon: Sparkles },
  ];
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map(s => (
          <div key={s.label} className="text-center">
            <div className="font-display text-3xl font-extrabold text-text-1 mb-1">{s.value}</div>
            <div className="text-xs text-text-2 leading-snug">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// FEATURE — CONFERENCES (alternating left image)
// ─────────────────────────────────────────────────────────
function SectionLabel({ color, icon: Icon, label }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

function ConferencesSection() {
  const upcomingConf = [
    { name: 'Annual Tech Summit 2025', date: 'Aug 10–12', location: 'Hyderabad', price: 'Free', seats: '420 left' },
    { name: 'Healthcare Innovation Conf', date: 'Sep 18–20', location: 'Mumbai', price: '₹1,499', seats: '85 left' },
    { name: 'Financial Markets Summit', date: 'Oct 5–7', location: 'New Delhi', price: '₹2,499', seats: '60 left' },
    { name: 'AI & Future of Work', date: 'Nov 12', location: 'Chennai', price: 'Free', seats: '200 left' },
  ];
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — event list panel */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <MonitorPlay className="w-4 h-4 text-violet-400" />
              <span className="font-semibold text-text-1 text-sm">Upcoming Conferences</span>
            </div>
            <span className="badge badge-neutral">4 events</span>
          </div>
          <div className="divide-y divide-border">
            {upcomingConf.map((c, i) => (
              <div key={c.name} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <MonitorPlay className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-1 truncate">{c.name}</div>
                  <div className="text-xs text-text-2 flex items-center gap-2 mt-0.5">
                    <CalendarDays className="w-3 h-3" />{c.date}
                    <span className="text-text-3">·</span>
                    <MapPin className="w-3 h-3" />{c.location}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-text-1">{c.price}</div>
                  <div className="text-xs text-text-3">{c.seats}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 border-t border-border">
            <Link to="/conferences" className="btn-secondary btn-md w-full justify-center">
              Browse All Conferences <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right — copy */}
        <div>
          <SectionLabel color="bg-violet-500/10 text-violet-400 border-violet-500/20" icon={MonitorPlay} label="Conferences" />
          <h2 className="font-display text-4xl font-bold text-text-1 mb-5 leading-tight">
            Multi-track conferences,<br />
            <span className="text-text-2 font-medium">now AI-enhanced.</span>
          </h2>
          <p className="text-text-2 leading-relaxed mb-8">
            From intimate niche summits to 10,000-person global conferences — 
            Eventify surfaces the right events for your professional goals and recommends 
            sessions using AI that understands your interests.
          </p>
          <div className="space-y-4 mb-8">
            {[
              { icon: Brain, title: 'AI session recommendations', body: 'The platform learns your interests and highlights the sessions most relevant to you.' },
              { icon: Ticket, title: 'Instant registration', body: 'One-click registration with instant confirmation and e-ticket delivery.' },
              { icon: BarChart2, title: 'Organizer analytics', body: 'Real-time attendance tracking, session heatmaps, and post-event insights.' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <div className="font-semibold text-text-1 text-sm mb-0.5">{f.title}</div>
                  <div className="text-text-2 text-sm leading-relaxed">{f.body}</div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/conferences" className="btn-primary btn-md">
            Explore Conferences <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// FEATURE — MEETUPS (alternating right image)
// ─────────────────────────────────────────────────────────
function MeetupsSection() {
  const meetups = [
    { name: 'Pune JS Developers Meet', location: 'Koregaon Park', date: 'Aug 20', members: 240 },
    { name: 'Bangalore AI Builders', location: 'HSR Layout', date: 'Sep 10', members: 580 },
    { name: 'Women in Tech Connect', location: 'WeWork Galaxy', date: 'Sep 18', members: 320 },
    { name: 'Photography Walk HYD', location: 'Charminar', date: 'Oct 5', members: 90 },
  ];
  return (
    <section className="py-24 px-6 bg-surface/30">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — copy */}
        <div>
          <SectionLabel color="bg-sky-500/10 text-sky-400 border-sky-500/20" icon={Users} label="Meetups" />
          <h2 className="font-display text-4xl font-bold text-text-1 mb-5 leading-tight">
            Find your community.<br />
            <span className="text-text-2 font-medium">In your city.</span>
          </h2>
          <p className="text-text-2 leading-relaxed mb-8">
            Hyper-local gatherings across technology, art, entrepreneurship, and culture. 
            Eventify connects you with communities that share your passions — and helps 
            organizers grow their group effortlessly.
          </p>
          <div className="space-y-4 mb-8">
            {[
              { icon: Globe, title: 'Geo-intelligent discovery', body: 'Find meetups near you, or discover communities in any city around the world.' },
              { icon: Users, title: 'RSVP with one tap', body: 'Instantly join, get reminders, and add events to your calendar automatically.' },
              { icon: MessageSquare, title: 'Community forums', body: 'Join discussions, share resources, and connect with members before and after.' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <div className="font-semibold text-text-1 text-sm mb-0.5">{f.title}</div>
                  <div className="text-text-2 text-sm leading-relaxed">{f.body}</div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/meetups" className="btn-primary btn-md">
            Find Meetups Near You <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right — meetup cards grid */}
        <div className="grid grid-cols-2 gap-4">
          {meetups.map((m, i) => (
            <div key={m.name} className="card group hover:border-sky-500/30 transition-all" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-3">
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <div className="font-semibold text-text-1 text-sm mb-2 leading-snug group-hover:text-sky-400 transition-colors">{m.name}</div>
              <div className="text-xs text-text-3 flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" />{m.location}
              </div>
              <div className="text-xs text-text-3 flex items-center gap-1 mb-3">
                <CalendarDays className="w-3 h-3" />{m.date}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-2">{m.members} members</span>
                <span className="badge badge-neutral">Free</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// AI CAPABILITIES
// ─────────────────────────────────────────────────────────
function AISection() {
  const capabilities = [
    {
      icon: Sparkles,
      title: 'AI Co-Creator',
      body: 'Describe any event in one sentence. The AI parses your intent and generates a complete event structure — title, agenda, pricing, capacity, and venue suggestions.',
      tag: 'Most used',
    },
    {
      icon: Brain,
      title: 'Smart Scheduling',
      body: 'Paste your session topics. The AI analyzes durations, speaker transitions, and attendee fatigue patterns to produce an optimal, conflict-free schedule.',
      tag: 'Organizers',
    },
    {
      icon: BarChart2,
      title: 'Dashboard Insights',
      body: 'Ask your data in natural language. "Which session had the highest drop-off?" or "Compare this month vs last month." Instant answers without SQL.',
      tag: 'Analytics',
    },
    {
      icon: Target,
      title: 'Attendee Matching',
      body: 'AI scores events against your profile, past attendance, and stated goals — surfacing the 3 events most likely to advance your career or business.',
      tag: 'Discovery',
    },
    {
      icon: MessageSquare,
      title: 'Intelligent Recommendations',
      body: 'Collaborative filtering meets content-based filtering. The platform learns from 280k+ users to surface events you\'d never have found on your own.',
      tag: 'Personalization',
    },
    {
      icon: TrendingUp,
      title: 'Predictive Attendance',
      body: 'Forecast RSVP-to-attendance conversion ratios 14 days before your event — so you can adjust catering, seating, and resource allocation in advance.',
      tag: 'Forecasting',
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <SectionLabel color="bg-brand/10 text-brand border-brand/20" icon={Sparkles} label="AI Capabilities" />
          <h2 className="font-display text-4xl font-bold text-text-1 mb-5 leading-tight">
            Built for an AI-first world.<br />
            <span className="text-text-2 font-medium">Not bolted on later.</span>
          </h2>
          <p className="text-text-2 leading-relaxed">
            Every feature in Eventify has AI woven into its core. From creation to analytics, 
            the platform thinks alongside you — not after you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 grid-fade">
          {capabilities.map(c => (
            <div key={c.title} className="card group flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                  <c.icon className="w-5 h-5 text-brand" />
                </div>
                <span className="badge badge-brand text-2xs">{c.tag}</span>
              </div>
              <div>
                <h3 className="font-semibold text-text-1 mb-2 group-hover:text-brand transition-colors">{c.title}</h3>
                <p className="text-sm text-text-2 leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-brand/10 via-violet-500/5 to-transparent border border-brand/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-display text-xl font-bold text-text-1 mb-1">Try the AI Co-Creator right now</div>
            <div className="text-text-2 text-sm">Describe your event. Get a full draft in under 10 seconds.</div>
          </div>
          <Link to="/co-creator" className="btn-primary btn-lg shrink-0 ai-glow">
            <Sparkles className="w-5 h-5" /> Open AI Co-Creator
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// LIVE DASHBOARD PREVIEW
// ─────────────────────────────────────────────────────────
function DashboardPreview() {
  return (
    <section className="py-24 px-6 bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <div>
            <SectionLabel color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" icon={BarChart2} label="Analytics" />
            <h2 className="font-display text-4xl font-bold text-text-1 mb-5 leading-tight">
              Your entire event portfolio,<br />
              <span className="text-text-2 font-medium">in one intelligent dashboard.</span>
            </h2>
            <p className="text-text-2 leading-relaxed mb-8">
              Track registrations, revenue, attendance patterns, and community growth 
              across all your events — with AI-generated summaries that explain what 
              matters and why.
            </p>
            <div className="space-y-3 mb-8">
              {[
                'Real-time attendee count and check-in rate',
                'Revenue breakdown by ticket tier and event type',
                'Session engagement heatmaps',
                'Natural language analytics queries',
                'Exportable reports for stakeholders',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-text-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <Link to="/analytics" className="btn-primary btn-md">
              Explore Analytics <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mini dashboard */}
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl blur-2xl scale-105" />
            <div className="relative glass-strong rounded-2xl overflow-hidden">
              {/* Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-2/50">
                <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                <span className="ml-3 text-text-3 text-xs">Analytics — Eventify</span>
              </div>
              <div className="p-5 space-y-4">
                {/* Stat row */}
                <div className="grid grid-cols-3 gap-3">
                  {[['Total Revenue', '₹4.2L', '+18%', 'success'], ['Registrations', '1,842', '+34%', 'success'], ['Avg. Rating', '4.9/5', '+0.2', 'brand']].map(([l, v, t, c]) => (
                    <div key={l} className="bg-surface-2 rounded-xl p-3 border border-border">
                      <div className="text-2xs text-text-3 mb-1">{l}</div>
                      <div className="font-bold text-text-1 text-base">{v}</div>
                      <div className={`text-xs text-${c}`}>{t}</div>
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="bg-surface-2 rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-text-2">Weekly Registrations</span>
                    <span className="text-2xs text-text-3">Last 10 weeks</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-20">
                    {[30, 48, 35, 62, 75, 55, 82, 90, 68, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm" style={{
                        height: `${h}%`,
                        background: `hsl(${145 + h * 0.5}, 70%, ${35 + h * 0.1}%)`,
                        opacity: 0.7 + h * 0.003,
                      }} />
                    ))}
                  </div>
                </div>

                {/* AI insight */}
                <div className="bg-brand/5 border border-brand/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-3 h-3 text-brand" />
                    <span className="text-2xs font-semibold text-brand uppercase tracking-wider">AI Insight</span>
                  </div>
                  <p className="text-xs text-text-2 leading-relaxed">
                    Registrations peaked Tuesday–Thursday. Consider scheduling high-priority events 
                    mid-week for maximum sign-ups.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Priya Raghunathan',
    role: 'Head of Events, Freshworks',
    avatar: 'PR',
    body: 'Eventify cut our conference planning time by 60%. The AI Co-Creator generated a complete 3-day event brief from a single paragraph. I was genuinely shocked.',
    stars: 5,
  },
  {
    name: 'Arjun Mehta',
    role: 'Founder, Startup Catalysts',
    avatar: 'AM',
    body: 'We grew our meetup community from 80 to 580 members in 4 months. The discovery engine surfaces our events to exactly the right audience every single time.',
    stars: 5,
  },
  {
    name: 'Kavitha Shankar',
    role: 'CTO, HealthTech India',
    avatar: 'KS',
    body: 'The analytics alone are worth the subscription. Natural language queries on our own data — "which sponsor had the most engagement?" — answer in seconds.',
    stars: 5,
  },
  {
    name: 'Rohit Verma',
    role: 'Community Lead, Google Developer Groups',
    avatar: 'RV',
    body: 'I manage 14 regional tech meetups. Eventify is the only platform that scales with that complexity without making my life a spreadsheet nightmare.',
    stars: 5,
  },
  {
    name: 'Sneha Krishnan',
    role: 'Senior PM, Microsoft India',
    avatar: 'SK',
    body: 'The AI schedule optimizer rearranged 22 sessions across 4 tracks in under a minute. What would have taken us half a day was done before my coffee cooled.',
    stars: 5,
  },
  {
    name: 'Devraj Pillai',
    role: 'Founder, InnoHub Bengaluru',
    avatar: 'DP',
    body: 'Our last conference had 1,200 attendees. Real-time check-in data, heatmaps, and live Q&A — all in one dashboard. This is what enterprise software should feel like.',
    stars: 5,
  },
];

function Testimonials() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel color="bg-amber-500/10 text-amber-400 border-amber-500/20" icon={Star} label="Testimonials" />
          <h2 className="font-display text-4xl font-bold text-text-1 mb-4">Used by event professionals<br />who demand results</h2>
          <p className="text-text-2 text-lg">Real words from real organizers and attendees.</p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="card break-inside-avoid mb-5 flex flex-col gap-4">
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-text-2 leading-relaxed flex-1">"{t.body}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand font-bold text-xs shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-1">{t.name}</div>
                  <div className="text-xs text-text-3">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    sub: 'Forever — no credit card',
    features: ['5 events / month', '100 attendees per event', 'Basic analytics', 'Community access', 'Email support'],
    cta: 'Get Started Free',
    to: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹999',
    sub: 'per month, billed annually',
    features: ['Unlimited events', 'Unlimited attendees', 'AI Co-Creator & Copilot', 'Advanced analytics dashboard', 'Schedule optimizer', 'Custom branding', 'Priority support'],
    cta: 'Start Pro Trial',
    to: '/signup',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    sub: 'Volume pricing available',
    features: ['Everything in Pro', 'Dedicated success manager', 'SSO / SAML', 'SLA guarantee (99.9%)', 'White-label', 'REST API access', 'Custom integrations'],
    cta: 'Contact Sales',
    to: '/about',
    highlight: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-surface/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel color="bg-brand/10 text-brand border-brand/20" icon={Layers} label="Pricing" />
          <h2 className="font-display text-4xl font-bold text-text-1 mb-4">Simple, transparent pricing</h2>
          <p className="text-text-2 text-lg">Start free. Upgrade when you need more. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-start grid-fade">
          {PLANS.map(p => (
            <div key={p.name} className={`card flex flex-col relative ${p.highlight ? 'border-brand/40 bg-brand/5 ai-glow' : ''}`}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge badge-brand">{p.badge}</span>
                </div>
              )}
              <div className="mb-6">
                <div className="font-semibold text-text-2 mb-2 uppercase tracking-wider text-xs">{p.name}</div>
                <div className="font-display text-3xl font-extrabold text-text-1">{p.price}</div>
                <div className="text-xs text-text-3 mt-1">{p.sub}</div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-2">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-px" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={p.to} className={`btn-md w-full text-center ${p.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-text-3 mt-8">
          All plans include SSL, GDPR compliance, and 24/7 platform monitoring.
          <Link to="/pricing" className="text-brand hover:underline ml-1">Full comparison →</Link>
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'What makes Eventify different from Eventbrite or Luma?',
    a: 'Eventify is built AI-first — not AI-added. Every core workflow (creating, scheduling, discovering, and analyzing events) is powered by AI. We also support full-stack event management: from RSVP to real-time analytics to community features, all in one platform.',
  },
  {
    q: 'Can I use the AI Co-Creator on the free plan?',
    a: 'Yes — the AI Co-Creator is available on the free plan with a limit of 5 AI-generated event drafts per month. Pro and Enterprise plans include unlimited AI usage across all features.',
  },
  {
    q: 'How does registration and ticketing work?',
    a: 'Attendees register directly on Eventify. For paid events, we support Razorpay and Stripe payment gateways. Organizers receive payouts within 5 business days after the event concludes. A 2% platform fee applies to paid ticket sales.',
  },
  {
    q: 'Is my data secure?',
    a: 'Eventify is SOC 2 Type II certified and GDPR compliant. All data is encrypted at rest and in transit. We never sell user data or attendee information to third parties.',
  },
  {
    q: 'Can I white-label Eventify for my organization?',
    a: 'White-labeling is available on the Enterprise plan. This includes custom domain, logo, color scheme, and removal of all Eventify branding from the attendee-facing pages.',
  },
  {
    q: 'What happens after I exceed the Starter plan limits?',
    a: "You'll receive a notification before you hit the limit. You can upgrade to Pro at any point — your existing events, attendees, and data are preserved seamlessly.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel color="bg-surface-2 text-text-2 border-border" icon={MessageSquare} label="FAQ" />
          <h2 className="font-display text-4xl font-bold text-text-1 mb-4">Common questions</h2>
          <p className="text-text-2">Everything you need to know about Eventify.</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 text-left"
              >
                <span className="font-semibold text-text-1 text-sm leading-snug">{f.q}</span>
                <div className={`w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}>
                  {open === i ? <Minus className="w-3.5 h-3.5 text-brand" /> : <Plus className="w-3.5 h-3.5 text-text-3" />}
                </div>
              </button>
              {open === i && (
                <div className="mt-4 pt-4 border-t border-border text-sm text-text-2 leading-relaxed animate-fade-in">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// FINAL CTA BAND
// ─────────────────────────────────────────────────────────
function CTABand() {
  return (
    <section className="py-24 px-6 bg-surface/30">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/25 mb-8">
          <Zap className="w-3.5 h-3.5 text-brand" />
          <span className="text-xs font-semibold text-brand tracking-wide">Start in 60 seconds</span>
        </div>
        <h2 className="font-display text-5xl font-extrabold text-text-1 mb-5 leading-tight">
          The future of events<br />
          <span className="ai-glow-text">is already here.</span>
        </h2>
        <p className="text-text-2 text-lg max-w-xl mx-auto mb-10">
          Join 250,000+ event professionals building smarter events on Eventify.
          No setup. No credit card. Instant AI access.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/signup" className="btn-primary btn-lg shadow-2xl shadow-brand/25">
            Create your free account <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/conferences" className="btn-secondary btn-lg">
            Browse Events
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    {
      title: 'Product',
      links: [
        { to: '/discover',    label: 'All Events' },
        { to: '/conferences', label: 'Conferences' },
        { to: '/meetups',     label: 'Meetups' },
        { to: '/co-creator',  label: 'AI Co-Creator' },
        { to: '/analytics',   label: 'Analytics' },
        { to: '/pricing',     label: 'Pricing' },
      ],
    },
    {
      title: 'Company',
      links: [
        { to: '/about',   label: 'About Us' },
        { to: '/about',   label: 'Careers' },
        { to: '/about',   label: 'Press Kit' },
        { to: '/about',   label: 'Blog' },
        { to: '/about',   label: 'Contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { to: '/terms',   label: 'Terms of Service' },
        { to: '/privacy', label: 'Privacy Policy' },
        { to: '/privacy', label: 'Cookie Policy' },
        { to: '/privacy', label: 'GDPR' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-text-1">Eventify</span>
            </Link>
            <p className="text-sm text-text-2 leading-relaxed mb-5 max-w-xs">
              The AI-first event platform for professionals who build remarkable experiences.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Github, href: '#' },
              ].map(({ icon: Icon, href }) => (
                <a key={href} href={href} className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-text-3 hover:text-text-1 hover:border-border-strong transition-all">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {cols.map(col => (
            <div key={col.title}>
              <div className="text-xs font-bold uppercase tracking-widest text-text-3 mb-4">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-text-2 hover:text-text-1 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-3">
          <span>© 2025 Eventify, Inc. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse2" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────
// PAGE ROOT
// ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });

  useEffect(() => {
    axios.get('http://localhost:5000/auth/me', { withCredentials: true })
      .then(r => { const u = r.data.user || r.data.data?.user; if (u) setUser(u); })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-canvas text-text-1 overflow-x-hidden">
      <TopNav user={user} />
      <Hero />
      <ConferencesSection />
      <MeetupsSection />
      <AISection />
      <DashboardPreview />
      <FAQ />
      <CTABand />
    </div>
  );
}
