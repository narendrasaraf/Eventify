import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, Loader2, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/auth/me', { withCredentials: true })
      .then(r => {
        const u = r.data.user || r.data.data?.user;
        if ((r.data.success || r.data.status === 'success') && u) navigate('/dashboard');
      })
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/auth/signup', formData, { withCredentials: true });
      const u = res.data.user || res.data.data?.user;
      if (res.data.success || res.data.status === 'success') {
        if (u) localStorage.setItem('user', JSON.stringify(u));
        toast.success('Account created! Welcome to Eventify.');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-surface-2 border-r border-border p-12 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-violet-500/8 blur-[100px]" />

        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-text-1">Eventify</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-2xl font-display font-bold text-text-1 leading-tight mb-3">
            Get started with Eventify
          </h2>
          <p className="text-sm text-text-2 leading-relaxed">
            Create an account to host events, manage RSVPs, collaborate with AI, and grow your local communities.
          </p>
        </div>

        <p className="text-xs text-text-3 relative z-10">© 2025 Eventify. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-up">
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-text-1">Eventify</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-text-1 mb-2">Create your account</h1>
            <p className="text-text-2">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                <input
                  type="text" name="name" required
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="input pl-10"
                  placeholder="Aarav Sharma"
                />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                <input
                  type="email" name="email" required
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="input pl-10"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
                <input
                  type={showPwd ? 'text' : 'password'} name="password" required
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  className="input pl-10 pr-10"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Get Started Free <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="relative my-6 flex items-center gap-3">
            <div className="divider flex-1" />
            <span className="text-xs text-text-3 shrink-0">or</span>
            <div className="divider flex-1" />
          </div>

          <button
            onClick={() => { window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/google`; }}
            className="btn-secondary btn-lg w-full"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>


          <p className="text-center text-sm text-text-2 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}