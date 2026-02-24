import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react';
import logo from '../logo.png';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const navLinks = [
    { name: 'Events', path: '/allevents' },
    { name: 'Webinars', path: '/webinars' },
    { name: 'Conferences', path: '/conferences' },
    { name: 'Meetups', path: '/meetups' },
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

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 sticky top-0 z-50 flex items-center">
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
        {/* Left Section: Logo + Project Name */}
        <Link to={user ? "/home" : "/"} className="flex items-center gap-3 group">
          <div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
            <img src={logo} alt="Eventify" className="h-6 w-6 object-contain" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
            Eventify
          </span>
        </Link>

        {/* Right Section: Navigation Links + Wallet Button */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-5">
            {user ? (
              <div className="flex items-center gap-5">
                <Link to="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="h-6 w-6 rounded-full" />
                  ) : (
                    <User className="h-4 w-4 text-indigo-400" />
                  )}
                  <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-indigo-600/20 active:scale-95">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-slate-950 border-b border-slate-800 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-semibold ${location.pathname === link.path ? 'text-indigo-400' : 'text-slate-300'
                  }`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <Link
                to="/myevents"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-300"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-4">
            {!user && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 text-slate-300 font-semibold"
              >
                Sign In
              </Link>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="w-full py-3.5 text-red-400 font-bold border border-red-500/10 rounded-xl bg-red-400/5 flex items-center justify-center gap-2"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            )}
            {!user && (
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;