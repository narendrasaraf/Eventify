import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, Search, BookOpen, MessageSquare, Plus, CheckCircle, 
  ArrowRight, FolderOpen, Heart, Calendar, ShieldAlert
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';

export default function Community() {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse active tab from URL query params (e.g. ?tab=discover)
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'discover';

  const [clubs, setClubs] = useState([]);
  const [globalPosts, setGlobalPosts] = useState([]);
  const [globalResources, setGlobalResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch Clubs on Mount / Tab shift
  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/v1/community/clubs', { withCredentials: true });
      setClubs(res.data?.data?.clubs || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load clubs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalFeeds = async () => {
    try {
      if (activeTab === 'discussions') {
        const res = await axios.get('http://localhost:5000/api/v1/community/discussions', { withCredentials: true });
        setGlobalPosts(res.data?.data?.posts || []);
      }
      if (activeTab === 'resources') {
        const res = await axios.get('http://localhost:5000/api/v1/community/resources', { withCredentials: true });
        setGlobalResources(res.data?.data?.resources || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    fetchGlobalFeeds();
  }, [activeTab]);

  // 2. Join/Leave Action
  const handleJoinLeave = async (club) => {
    try {
      const endpoint = club.isJoined 
        ? `http://localhost:5000/api/v1/community/clubs/${club._id}/leave`
        : `http://localhost:5000/api/v1/community/clubs/${club._id}/join`;

      const res = await axios.post(endpoint, {}, { withCredentials: true });
      
      if (res.data?.status === 'success') {
        toast.success(club.isJoined ? `Left ${club.name}` : `Joined ${club.name}!`);
        // Update local state
        setClubs(prev => prev.map(c => 
          c._id === club._id 
            ? { ...c, isJoined: !c.isJoined, totalMembers: res.data.totalMembers }
            : c
        ));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  // Filtered lists
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          club.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'my-clubs') {
      return matchesSearch && club.isJoined;
    }
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8 font-sans">
      <PageHeader
        title="Community Hub"
        subtitle="Connect with builders, review typed architectures, share developer resources, and join real-time lounge channels."
      />

      {/* Tabs sub-nav header */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'discover', label: 'Discover Clubs', query: 'discover' },
          { id: 'my-clubs', label: 'My Clubs', query: 'my-clubs' },
          { id: 'discussions', label: 'Recent Discussions', query: 'discussions' },
          { id: 'resources', label: 'Shared Resources', query: 'resources' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => navigate(`/community?tab=${t.query}`)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === t.query
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35'
                : 'bg-slate-900/40 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Input for Clubs */}
      {(activeTab === 'discover' || activeTab === 'my-clubs') && (
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search clubs by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-850 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      )}

      {/* ─── CLUBS GRID ──────────────────────────────────────────────────────── */}
      {(activeTab === 'discover' || activeTab === 'my-clubs') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club._id}
              className="bg-slate-900/20 backdrop-blur-xl border border-slate-800/80 rounded-[28px] overflow-hidden flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300 group"
            >
              {/* Banner Area */}
              <div className="h-32 bg-slate-950 relative overflow-hidden">
                {club.banner ? (
                  <img src={club.banner} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-indigo-950/80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                
                {/* Category Overlay */}
                <span className="absolute top-4 right-4 bg-slate-950/80 border border-slate-800 text-[10px] font-black uppercase text-indigo-400 px-2.5 py-0.5 rounded-lg">
                  {club.category}
                </span>
              </div>

              {/* Club Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                      {club.logo ? (
                        <img src={club.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-indigo-400 font-bold bg-indigo-500/10">C</div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">
                        {club.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-500">
                        <Users className="h-3.5 w-3.5" />
                        <span>{club.totalMembers} Members</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-3">
                    {club.description}
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="border-t border-slate-800/80 pt-4 flex gap-2">
                  <button
                    onClick={() => handleJoinLeave(club)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                      club.isJoined
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    }`}
                  >
                    {club.isJoined ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" /> Member
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" /> Join Club
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(`/community/club/${club._id}`)}
                    className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    Enter <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredClubs.length === 0 && !loading && (
            <div className="col-span-full bg-slate-900/15 border border-slate-850 rounded-2xl p-12 text-center text-slate-500">
              <Users className="h-10 w-10 mx-auto text-slate-600 mb-3" />
              <p className="text-xs font-semibold">No clubs found matching your request.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: RECENT DISCUSSIONS ────────────────────────────────────────── */}
      {activeTab === 'discussions' && (
        <div className="max-w-4xl space-y-4 animate-fade-in">
          {globalPosts.map((post) => (
            <div
              key={post._id}
              onClick={() => navigate(`/community/club/${post.clubId?._id}?tab=discussions`)}
              className="bg-slate-900/20 hover:bg-slate-900/30 border border-slate-800/80 p-6 rounded-[24px] cursor-pointer transition-all duration-200 space-y-4"
            >
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                  {post.clubId?.name}
                </span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white hover:text-indigo-400 transition-colors leading-tight">
                  {post.title}
                </h4>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-medium">
                  {post.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-850/50 text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold uppercase">
                    {post.author?.name ? post.author.name[0] : 'U'}
                  </div>
                  <span>{post.author?.name || 'Developer'}</span>
                </span>

                <div className="flex gap-4">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Heart className="h-4 w-4" /> {post.likesCount}
                  </span>
                  <span className="flex items-center gap-1 text-indigo-400">
                    <MessageSquare className="h-4 w-4" /> {post.commentsCount} Comments
                  </span>
                </div>
              </div>
            </div>
          ))}

          {globalPosts.length === 0 && (
            <div className="bg-slate-900/15 border border-slate-850 rounded-2xl p-12 text-center text-slate-500">
              <MessageSquare className="h-10 w-10 mx-auto text-slate-600 mb-3" />
              <p className="text-xs font-semibold">No discussions posted yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: SHARED RESOURCES ──────────────────────────────────────────── */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {globalResources.map((res) => (
            <div
              key={res._id}
              onClick={() => navigate(`/community/club/${res.clubId?._id}?tab=resources`)}
              className="bg-slate-900/20 hover:bg-slate-900/30 border border-slate-800/80 p-5 rounded-[24px] cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase font-bold mb-3">
                  <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/15">
                    {res.clubId?.name}
                  </span>
                  <span className="bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {res.fileType}
                  </span>
                </div>

                <h5 className="text-xs font-bold text-white leading-snug line-clamp-2">{res.title}</h5>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{res.description}</p>
              </div>

              <div className="border-t border-slate-850/60 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-slate-500" />
                  <span>By {res.uploadedBy?.name || 'Member'}</span>
                </span>
                <span className="text-indigo-400">View Library</span>
              </div>
            </div>
          ))}

          {globalResources.length === 0 && (
            <div className="col-span-full bg-slate-900/15 border border-slate-850 rounded-2xl p-12 text-center text-slate-500">
              <FolderOpen className="h-10 w-10 mx-auto text-slate-600 mb-3" />
              <p className="text-xs font-semibold">No resource files uploaded yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
