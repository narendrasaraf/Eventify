import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';

// Pages that don't use the sidebar shell
const BARE_PATHS = ['/', '/login', '/signup', '/terms', '/privacy', '/pricing', '/about'];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });


  const isBare = BARE_PATHS.includes(location.pathname);

  useEffect(() => {
    // Sync user session on navigation
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { setUser(null); }
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
    } catch (_) {}
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main content area — offset by sidebar width */}
      <main className="flex-1 min-h-screen lg:ml-56 transition-all duration-300 pt-14 lg:pt-0">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
