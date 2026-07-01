import React from 'react';
import { Calendar, Brain, Award } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function About() {
  const stats = [
    { label: 'Events Hosted', value: '15,000+' },
    { label: 'Active Communities', value: '800+' },
    { label: 'Tickets Issued', value: '120k+' },
    { label: 'AI Operations Run', value: '50k+' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-16">

      <PageHeader
        title="About Eventify"
        subtitle="We build tools that make organizing, attending, and evaluating virtual gatherings a seamless experience powered by modern AI agents."
        className="text-center max-w-3xl mx-auto"
      />

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto px-4 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-white leading-tight">An AI-First Platform for Modern Communities</h2>
          <p className="text-slate-400 text-base leading-relaxed font-medium">
            Eventify was founded with a single mission: to eliminate the friction in event management. 
            By integrating generative AI directly into the event design process, organizers can transition 
            from an idea to a fully scheduled, registered, and published event in a matter of seconds.
          </p>
          <p className="text-slate-400 text-base leading-relaxed font-medium">
            Whether you are coordinating professional webinars, hybrid conferences, or local developer meetups, 
            our platform optimizes schedules, tracks registrations, and generates real-time business insights 
            using the Gemini AI gateway.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl text-center group hover:border-indigo-500/20 transition-all duration-300">
              <div className="text-3xl font-black text-indigo-400 mb-2">{stat.value}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-slate-800">
        <h3 className="text-2xl font-bold text-center text-white mb-12">Core Design Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Autonomous Logistics",
              desc: "Describe your event in plain text and watch the AI Co-Creator compile, tag, price, and draft the agenda dynamically.",
              icon: Brain
            },
            {
              title: "Inclusive Spaces",
              desc: "From corporate panel discussions to coding hackathons — our features cater to diverse group sizes, formats, and languages.",
              icon: Calendar
            },
            {
              title: "Premium Interfaces",
              desc: "Enjoy clean, fast-loading interfaces that focus on information structure, high accessibility, and seamless responsiveness.",
              icon: Award
            }
          ].map((v, i) => (
            <div key={i} className="bg-slate-950/40 border border-slate-900 p-8 rounded-[24px] hover:border-indigo-500/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-all">
                <v.icon className="h-6 w-6 text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-3">{v.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default About;
