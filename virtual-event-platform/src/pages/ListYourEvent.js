import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Users,
  BarChart3,
  Megaphone,
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

function ListYourEvent() {
  const navigate = useNavigate();

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  const benefits = [
    {
      title: "Wide Reach",
      description: "Connect with thousands of potential attendees across India and beyond.",
      icon: Globe
    },
    {
      title: "Easy Management",
      description: "Manage registrations, payments, and communications in one centralized place.",
      icon: Users
    },
    {
      title: "Powerful Analytics",
      description: "Track registrations and gain deep insights about your audience growth.",
      icon: BarChart3
    },
    {
      title: "Promotional Tools",
      description: "Leverage our AI-powered marketing tools to promote your event effectively.",
      icon: Megaphone
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="section-container pt-12">
        <PageHeader
          title="Host with Eventify"
          subtitle="Reach thousands of potential attendees by listing your professional events on our premium platform."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-text-primary leading-tight">
              Why partner with <span className="text-primary italic">Eventify?</span>
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Eventify is India's leading platform for event discovery and professional networking.
              Whether you're organizing a technical webinar, a corporate conference, or a local tech meetup,
              we provide the infrastructure to help you scale your impact.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="p-6 rounded-2xl bg-surface/40 border border-slate-800 hover:border-primary/50 transition-all group">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-text-primary mb-2">{benefit.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{benefit.description}</p>
                  </div>
                );
              })}
            </div>

            <button
              className="btn-primary py-4 px-10 text-lg flex items-center gap-3 shadow-xl shadow-primary/20 group"
              onClick={handleCreateEvent}
            >
              Start Organizing <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-[3rem] blur-3xl -z-10" />
            <div className="card aspect-square bg-slate-900/50 border-slate-800 p-8 flex flex-col justify-center gap-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="h-40 w-40 text-primary" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                </div>
                <h4 className="text-2xl font-black text-white">Trusted by 500+ Organizers</h4>
                <p className="text-slate-400">Join the elite community of event organizers who trust Eventify for their most critical sessions.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <p className="text-2xl font-black text-primary">50k+</p>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Users</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <p className="text-2xl font-black text-primary">1.2M</p>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Registrations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-text-primary">Simple, Transparent Pricing</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Choose a plan that fits your event scale. No hidden fees, just pure impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="card p-8 bg-surface/40 border-slate-800 flex flex-col hover:-translate-y-2 transition-transform duration-500">
              <h3 className="text-xl font-bold text-text-primary mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">Free</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 text-primary" /> Standard listing</li>
                <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 text-primary" /> Up to 50 attendees</li>
                <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 text-primary" /> Basic analytics</li>
                <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 text-primary" /> Community support</li>
              </ul>
              <button className="btn-secondary w-full py-4 font-bold" onClick={handleCreateEvent}>Get Started</button>
            </div>

            {/* Pro Plan */}
            <div className="card p-8 bg-primary/5 border-primary shadow-2xl shadow-primary/10 flex flex-col relative overflow-hidden hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute top-0 right-0 py-1.5 px-6 bg-primary text-[10px] font-black uppercase tracking-widest text-white rounded-bl-xl">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Professional</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-base font-bold text-text-secondary">₹</span>
                <span className="text-4xl font-black text-white">999</span>
                <span className="text-sm text-text-secondary">/event</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm text-text-primary font-bold"><Zap className="h-4 w-4 text-primary fill-primary" /> Featured home listing</li>
                <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 text-primary" /> Up to 500 attendees</li>
                <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 text-primary" /> Custom forms</li>
                <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 text-primary" /> Priority email support</li>
              </ul>
              <button className="btn-primary w-full py-4 font-bold" onClick={handleCreateEvent}>Select Professional</button>
            </div>

            {/* Enterprise Plan */}
            <div className="card p-8 bg-surface/40 border-slate-800 flex flex-col hover:-translate-y-2 transition-transform duration-500">
              <h3 className="text-xl font-bold text-text-primary mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-base font-bold text-text-secondary">₹</span>
                <span className="text-4xl font-black text-white">2,499</span>
                <span className="text-sm text-text-secondary">/event</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 text-primary" /> Unlimited attendees</li>
                <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 text-primary" /> Advanced AI analytics</li>
                <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 text-primary" /> API & Webhook access</li>
                <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 text-primary" /> Dedicated manager</li>
              </ul>
              <button className="btn-secondary w-full py-4 font-bold" onClick={handleCreateEvent}>Contact Sales</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListYourEvent;