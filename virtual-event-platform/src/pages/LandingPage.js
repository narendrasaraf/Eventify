import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Video, BarChart3, ChevronRight, Sparkles } from 'lucide-react';
import logo from '../logo.png';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Background Glows shifted to absolute so they don't break flex spacing */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="text-center pt-20 pb-20">
        <div className="flex flex-col items-center mb-12">
          <div className="bg-indigo-600/10 p-4 rounded-[2rem] border border-indigo-500/20 mb-6 animate-fade-in shadow-2xl shadow-indigo-600/10">
            <img src={logo} alt="Eventify" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent leading-[0.9]">
            Eventify
          </h1>
        </div>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          The ultimate platform to streamline your virtual and physical events.
          Host expert webinars, global conferences, and local meetups in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.location.href = 'http://localhost:5000/auth/google'}
            className="bg-white hover:bg-slate-100 text-slate-900 flex items-center gap-3 text-lg font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-white/10 active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/pjax/google.png" alt="Google" className="h-6 w-6" />
            Sign in with Google
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 text-lg font-black px-10 py-4 rounded-2xl transition-all active:scale-95"
          >
            Login
          </button>
        </div>
        <p className="mt-6 text-slate-500 font-medium">
          New here? <Link to="/signup" className="text-indigo-400 hover:underline">Create an account</Link>
        </p>

        {/* Abstract UI Preview */}
        <div className="mt-20 relative max-w-5xl mx-auto px-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-3 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
            <img
              src="https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=2070&auto=format&fit=crop"
              alt="Dashboard Preview"
              className="rounded-2xl object-cover w-full h-[300px] md:h-[600px] grayscale-[20%] hover:grayscale-0 transition-all duration-700"
            />
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 h-32 w-32 bg-indigo-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-12 -left-12 h-32 w-32 bg-purple-500/20 blur-3xl rounded-full" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-white tracking-tight">Built for modern organizers</h2>
          <p className="text-slate-400 font-medium">Everything you need to host successful events worldwide.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Seamless Ticketing",
              desc: "Create and manage tickets effortlessly with our robust booking system. Instant confirmations and Web3 verification.",
              icon: ShieldCheck,
              color: "text-indigo-400"
            },
            {
              title: "Virtual & Live",
              desc: "Support for both in-person conferences and integrated virtual events. Hybrid events made simple for everyone.",
              icon: Video,
              color: "text-purple-400"
            },
            {
              title: "Real-time Analytics",
              desc: "Track registrations, attendance, and engagement with our comprehensive dashboard. Data-driven decisions.",
              icon: BarChart3,
              color: "text-blue-400"
            }
          ].map((f, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-indigo-500/30 hover:bg-slate-900 transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center mb-8 border border-slate-800 group-hover:scale-110 transition-transform`}>
                <f.icon className={`h-7 w-7 ${f.color}`} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-slate-900/30 rounded-[40px] border border-slate-800/50 px-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-white/90">Trusted by leaders across industries</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Technology', 'Education', 'Healthcare', 'Finance',
              'Entertainment', 'Non-Profit', 'Corporate', 'Web3'
            ].map((industry) => (
              <span
                key={industry}
                className="px-8 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-bold text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-default"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-20">
        <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-indigo-600/20 via-slate-900 to-purple-600/20 border border-slate-800 p-12 md:p-24 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tighter leading-none">Ready to launch <br /> your event?</h2>
          <p className="text-slate-400 mb-12 max-w-xl mx-auto text-lg font-medium">
            Join thousands of organizers who use Eventify to power their community gatherings and tech summits.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-indigo-600/30 active:scale-95"
          >
            Create Your Event
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-black text-white tracking-tighter">Eventify</div>
          <p className="text-slate-500 text-sm font-medium">© 2026 Eventify Inc. All rights reserved.</p>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Contact'].map(item => (
              <span key={item} className="text-sm font-bold text-slate-500 hover:text-white cursor-pointer transition-colors uppercase tracking-widest">{item}</span>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}

export default LandingPage;
