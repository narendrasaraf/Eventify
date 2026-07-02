import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/v1/auth/login',
        { email, password },
        { withCredentials: true }
      );

      const user = res.data?.data?.user;
      if (user && (user.role === 'admin' || user.role === 'ADMIN')) {
        localStorage.setItem('user', JSON.stringify(user));
        toast.success('Welcome back, Administrator!');
        navigate('/admin/dashboard');
      } else {
        // Logout non-admin account immediately
        await axios.post('http://localhost:5000/api/v1/auth/logout', {}, { withCredentials: true });
        setError('Access denied. This login portal is restricted to Platform Administrators.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-[28px] shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 mb-4">
            <ShieldAlert className="h-8 w-8 text-indigo-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Admin Console</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">
            Authorized administrative access only
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-semibold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@admin.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-xs font-bold transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-55 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...
              </>
            ) : (
              'Authenticate Admin'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
