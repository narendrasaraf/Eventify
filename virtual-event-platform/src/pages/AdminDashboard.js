import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, BarChart2, ShieldAlert, BookOpen, MessageSquare, 
  Trash2, Pin, Lock, Unlock, ShieldAlert as BlockIcon, 
  Send, Plus, Edit3, DollarSign, Calendar, Eye, Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';

export default function AdminDashboard() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [clubsList, setClubsList] = useState([]);
  
  // Forms & Modal states
  const [showClubModal, setShowClubModal] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [clubName, setClubName] = useState('');
  const [clubCategory, setClubCategory] = useState('');
  const [clubDesc, setClubDesc] = useState('');
  const [clubBanner, setClubBanner] = useState('');
  const [clubLogo, setClubLogo] = useState('');
  const [clubRules, setClubRules] = useState('');

  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceBody, setAnnounceBody] = useState('');

  const [searchUserQuery, setSearchUserQuery] = useState('');

  // 1. Authenticate check
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN')) {
      toast.error('Restricted access. Please authenticate as Administrator.');
      navigate('/admin/login');
    }
  }, [user, navigate]);

  // 2. Fetch data based on tab
  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/community/admin/analytics', { withCredentials: true });
      setAnalytics(res.data?.data?.analytics || null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics.');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/community/admin/users', { withCredentials: true });
      setUsersList(res.data?.data?.users || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve user accounts.');
    }
  };

  const fetchClubs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/community/clubs', { withCredentials: true });
      setClubsList(res.data?.data?.clubs || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load club listings.');
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'ADMIN')) {
      if (activeTab === 'analytics') fetchAnalytics();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'clubs') fetchClubs();
    }
  }, [activeTab, user]);

  if (!user || (user.role !== 'admin' && user.role !== 'ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-rose-400 font-bold font-sans">
        Access Denied. Redirecting...
      </div>
    );
  }

  // ─── ADMIN ACTIONS ──────────────────────────────────────────────────────────

  // User Actions
  const handleBlockUser = async (uId) => {
    const reason = prompt('Please specify block reason (optional):') || 'Violation of platform guidelines.';
    try {
      await axios.post(`http://localhost:5000/api/v1/community/admin/users/${uId}/block`, { reason }, { withCredentials: true });
      toast.warning('User has been blocked.');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Block operation failed.');
    }
  };

  const handleUnblockUser = async (uId) => {
    try {
      await axios.post(`http://localhost:5000/api/v1/community/admin/users/${uId}/unblock`, {}, { withCredentials: true });
      toast.success('User account unblocked.');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Unblock operation failed.');
    }
  };

  const handleDeleteUser = async (uId) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/community/admin/users/${uId}`, { withCredentials: true });
      toast.success('User account deleted.');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Delete operation failed.');
    }
  };

  // Club Actions
  const handleSaveClub = async (e) => {
    e.preventDefault();
    const payload = {
      name: clubName,
      category: clubCategory,
      description: clubDesc,
      banner: clubBanner,
      logo: clubLogo,
      rules: clubRules.split('\n').filter(r => r.trim().length > 0),
    };

    try {
      if (editingClub) {
        await axios.put(`http://localhost:5000/api/v1/community/clubs/${editingClub._id}`, payload, { withCredentials: true });
        toast.success('Club configurations updated.');
      } else {
        await axios.post('http://localhost:5000/api/v1/community/clubs', payload, { withCredentials: true });
        toast.success('New platform club created.');
      }
      setShowClubModal(false);
      fetchClubs();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Save operation failed.');
    }
  };

  const handleOpenEditClub = (club) => {
    setEditingClub(club);
    setClubName(club.name);
    setClubCategory(club.category);
    setClubDesc(club.description);
    setClubBanner(club.banner);
    setClubLogo(club.logo);
    setClubRules(club.rules.join('\n'));
    setShowClubModal(true);
  };

  const handleOpenCreateClub = () => {
    setEditingClub(null);
    setClubName('');
    setClubCategory('Tech');
    setClubDesc('');
    setClubBanner('');
    setClubLogo('');
    setClubRules('Be respectful.\nNo spam posting.');
    setShowClubModal(true);
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Deleting a club will permanently clear all its posts, chat messages, resources, and members. Proceed?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/community/clubs/${clubId}`, { withCredentials: true });
      toast.success('Club permanently deleted.');
      fetchClubs();
    } catch (err) {
      console.error(err);
      toast.error('Delete club failed.');
    }
  };

  // Moderation Post actions
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post and its comments?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/community/posts/${postId}`, { withCredentials: true });
      toast.success('Post removed.');
      fetchAnalytics(); // refresh lists
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove post.');
    }
  };

  const handleTogglePinPost = async (postId, currentlyPinned) => {
    try {
      await axios.post(`http://localhost:5000/api/v1/community/posts/${postId}/pin`, { isPinned: !currentlyPinned }, { withCredentials: true });
      toast.success(currentlyPinned ? 'Post unpinned.' : 'Post pinned.');
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      toast.error('Pin operation failed.');
    }
  };

  const handleToggleLockPost = async (postId, currentlyLocked) => {
    try {
      await axios.post(`http://localhost:5000/api/v1/community/posts/${postId}/lock`, { isLocked: !currentlyLocked }, { withCredentials: true });
      toast.success(currentlyLocked ? 'Discussion unlocked.' : 'Discussion locked.');
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      toast.error('Lock operation failed.');
    }
  };

  // Announcements
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle || !announceBody) return;
    try {
      await axios.post('http://localhost:5000/api/v1/community/admin/announcements', {
        title: announceTitle,
        body: announceBody,
      }, { withCredentials: true });
      toast.success('Platform announcement published.');
      setAnnounceTitle('');
      setAnnounceBody('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to publish announcement.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8 font-sans">
      <PageHeader 
        title="Admin Console" 
        subtitle="Manage user accounts, seed/edit clubs, moderate discussion forums, and track platform statistics."
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'analytics', label: 'Dashboard & Analytics', icon: BarChart2 },
          { id: 'users', label: 'User Operations', icon: Users },
          { id: 'clubs', label: 'Clubs Configuration', icon: BookOpen },
          { id: 'announcements', label: 'Announcements', icon: Send },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === t.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35' 
                : 'bg-slate-900/40 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: ANALYTICS ─────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8 animate-fade-in">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Members</span>
                <h3 className="text-2xl font-black text-white mt-1">{analytics.totalUsers}</h3>
                <div className="flex gap-2.5 text-[10px] text-slate-400 font-semibold mt-1">
                  <span className="text-emerald-400">{analytics.activeUsers} Active</span>
                  <span className="text-rose-400">{analytics.blockedUsers} Blocked</span>
                </div>
              </div>
              <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-indigo-400">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Active Clubs</span>
                <h3 className="text-2xl font-black text-white mt-1">{analytics.totalClubs}</h3>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">15 Pre-Created</span>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Forum Discussions</span>
                <h3 className="text-2xl font-black text-white mt-1">{analytics.totalDiscussions}</h3>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">{analytics.totalMessages} Chat Messages</span>
              </div>
              <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20 text-cyan-400">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Bookings & Revenue</span>
                <h3 className="text-2xl font-black text-indigo-400 mt-1">${analytics.totalRevenue.toFixed(2)}</h3>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">{analytics.totalBookings} Total Registrations</span>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-400">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Dual Column Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Registrations */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4.5 w-4.5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Recent Registrations</h4>
              </div>
              <div className="space-y-3.5">
                {analytics.recentRegistrations.map((b) => (
                  <div key={b._id} className="bg-slate-950/80 border border-slate-800/60 p-4 rounded-xl flex items-center justify-between text-xs font-semibold">
                    <div>
                      <p className="text-white font-bold">{b.userId?.name || 'Guest'}</p>
                      <p className="text-slate-500 text-[10px]">{b.userId?.email || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-400 font-bold">{b.eventId?.eventName || 'Virtual Event'}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase mt-1 ${
                        b.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Moderation shortcut: Recent discussions */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="h-4.5 w-4.5 text-rose-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Recent Discussions & Forum Control</h4>
              </div>
              <div className="space-y-4">
                {analytics.recentDiscussions.map((p) => (
                  <div key={p._id} className="bg-slate-950/80 border border-slate-800/60 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold px-2 py-0.5 rounded uppercase">{p.clubId?.name}</span>
                        <h5 className="text-xs font-bold text-white mt-1.5 leading-tight">{p.title}</h5>
                        <p className="text-[10px] text-slate-500 mt-1">Author: {p.author?.name} | {new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleTogglePinPost(p._id, p.isPinned)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            p.isPinned 
                              ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title={p.isPinned ? "Unpin Post" : "Pin Post"}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleLockPost(p._id, p.isLocked)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            p.isLocked 
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title={p.isLocked ? "Unlock Discussion" : "Lock Discussion"}
                        >
                          {p.isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeletePost(p._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: USERS ────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fade-in">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">User Directory</h4>
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs px-4 py-2 rounded-xl outline-none focus:border-indigo-500/50 w-full sm:max-w-xs transition-colors"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList
                  .filter(u => 
                    u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                    u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
                  )
                  .map((usr) => (
                    <tr key={usr._id} className="border-b border-slate-900 hover:bg-slate-900/20 font-semibold">
                      <td className="p-4 text-white font-bold">{usr.name}</td>
                      <td className="p-4 text-slate-400">{usr.email}</td>
                      <td className="p-4">
                        <span className="uppercase text-[10px] font-black px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-400">
                          {usr.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {usr.blocked || usr.status === 'blocked' ? (
                          <span className="px-2.5 py-0.5 rounded text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold uppercase">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {usr.blocked || usr.status === 'blocked' ? (
                          <button
                            onClick={() => handleUnblockUser(usr._id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[10px] uppercase font-bold"
                          >
                            <Unlock className="h-3 w-3" /> Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockUser(usr._id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 transition-all text-[10px] uppercase font-bold"
                            disabled={usr.role === 'admin' || usr.role === 'ADMIN'}
                          >
                            <BlockIcon className="h-3 w-3" /> Block
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(usr._id)}
                          className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/20 transition-colors"
                          disabled={usr.role === 'admin' || usr.role === 'ADMIN'}
                          title="Delete User"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: CLUBS ────────────────────────────────────────────────────── */}
      {activeTab === 'clubs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Official Clubs</h4>
            <button
              onClick={handleOpenCreateClub}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all duration-200"
            >
              <Plus className="h-4 w-4" /> Create Club
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubsList.map((club) => (
              <div 
                key={club._id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-[24px] overflow-hidden flex flex-col justify-between"
              >
                {/* Banner image */}
                <div className="h-28 bg-slate-950 relative">
                  {club.banner && (
                    <img src={club.banner} alt={club.name} className="w-full h-full object-cover opacity-75" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  
                  {/* Logo overlay */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                      {club.logo && <img src={club.logo} alt="Logo" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white leading-tight">{club.name}</h5>
                      <span className="text-[9px] font-black uppercase text-indigo-400">{club.category}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-400 font-medium leading-relaxed min-h-[50px] line-clamp-3">
                    {club.description}
                  </p>

                  <div className="flex gap-2 justify-end pt-3 border-t border-slate-800/60">
                    <button
                      onClick={() => handleOpenEditClub(club)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-[10px] uppercase font-bold"
                    >
                      <Edit3 className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club._id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors text-[10px] uppercase font-bold"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Club Form Modal */}
          {showClubModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-xl bg-slate-900 border border-slate-800 p-8 rounded-[28px] relative space-y-6">
                <h4 className="text-base font-bold text-white">
                  {editingClub ? 'Edit Club Configuration' : 'Create New Official Club'}
                </h4>

                <form onSubmit={handleSaveClub} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold uppercase tracking-wider">Club Name</label>
                      <input
                        type="text"
                        required
                        value={clubName}
                        onChange={(e) => setClubName(e.target.value)}
                        placeholder="Artificial Intelligence & Machine Learning"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold uppercase tracking-wider">Category</label>
                      <input
                        type="text"
                        required
                        value={clubCategory}
                        onChange={(e) => setClubCategory(e.target.value)}
                        placeholder="Tech / Development / Design"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Description</label>
                    <textarea
                      required
                      value={clubDesc}
                      onChange={(e) => setClubDesc(e.target.value)}
                      rows="3"
                      placeholder="Specify a details introduction for this club..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold uppercase tracking-wider">Logo URL</label>
                      <input
                        type="text"
                        value={clubLogo}
                        onChange={(e) => setClubLogo(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold uppercase tracking-wider">Banner URL</label>
                      <input
                        type="text"
                        value={clubBanner}
                        onChange={(e) => setClubBanner(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Rules (One rule per line)</label>
                    <textarea
                      value={clubRules}
                      onChange={(e) => setClubRules(e.target.value)}
                      rows="3"
                      placeholder="Rule 1&#10;Rule 2"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setShowClubModal(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                    >
                      Save Club
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: ANNOUNCEMENTS ────────────────────────────────────────────── */}
      {activeTab === 'announcements' && (
        <div className="max-w-2xl bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fade-in">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Create Platform Announcement</h4>
            <p className="text-slate-500 text-xs mt-1">This will send an immediate system-wide notification to all active users on Eventify.</p>
          </div>

          <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider">Announcement Title</label>
              <input
                type="text"
                required
                value={announceTitle}
                onChange={(e) => setAnnounceTitle(e.target.value)}
                placeholder="Platform Maintenance / Version Update..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider">Message Body</label>
              <textarea
                required
                value={announceBody}
                onChange={(e) => setAnnounceBody(e.target.value)}
                rows="5"
                placeholder="Write your platform-wide announcement message details here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50 resize-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all duration-200 w-full"
            >
              <Send className="h-3.5 w-3.5" /> Publish & Notify All Users
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
