import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import logo from '../logo.png';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const guestLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/discover' },
    { name: 'Conferences', path: '/conferences' },
    { name: 'Meetups', path: '/meetups' },
    { name: 'Discover', path: '/discover' },
    { name: 'AI Assistant', path: '/co-creator' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' }
  ];

  const userLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Events', path: '/discover' },
    { name: 'Conferences', path: '/conferences' },
    { name: 'Meetups', path: '/meetups' },
    { name: 'Tickets', path: '/tickets' },
    { name: 'Community', path: '/community' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'AI Copilot', path: '/co-creator' },
    { name: 'Notifications', path: '/notifications' },
    { name: 'Profile', path: '/profile' }
  ];

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/auth/logout', { method: 'POST', credentials: 'include' });
      localStorage.removeItem('user');
      navigate('/login');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const activeLinks = user ? userLinks : guestLinks;

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 flex items-center">
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
        {/* Left Section: Logo + Project Name */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group shrink-0">
          <div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
            <img src={logo} alt="Eventify" className="h-5 w-5 object-contain" />
          </div>
          <span className="text-lg font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tighter">
            Eventify
          </span>
        </Link>

        {/* Middle Section: Links (Flexible & Compact) */}
        <nav className="hidden lg:flex items-center gap-1.5 mx-4 overflow-x-auto max-w-full no-scrollbar">
          {activeLinks.map((link, idx) => (
            <Link
              key={`${link.path}-${idx}`}
              to={link.path}
              className={`text-[11px] xl:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                location.pathname === link.path
                  ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Section: Profile & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 hover:border-slate-700 transition-all">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="h-5 w-5 rounded-full" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-indigo-400" />
                  )}
                  <span className="text-[10px] font-black text-slate-350 uppercase tracking-widest">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-450 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 hover:scale-105 active:scale-95">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800/80 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
          <nav className="flex flex-col gap-3">
            {activeLinks.map((link, idx) => (
              <Link
                key={`mob-${link.path}-${idx}`}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all ${
                  location.pathname === link.path ? 'bg-indigo-600/15 border border-indigo-500/25 text-indigo-400' : 'text-slate-350'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 text-slate-300 font-bold text-sm bg-slate-900 border border-slate-800 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center shadow-lg shadow-indigo-600/15"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full py-3 text-red-400 font-bold border border-red-500/10 rounded-xl bg-red-400/5 flex items-center justify-center gap-2 text-sm"
              >
                <LogOut className="h-4 w-4" /> Sign Out Session
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;