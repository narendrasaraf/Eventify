import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  Users, MessageSquare, BookOpen, FolderOpen, Calendar, 
  Trophy, Pin, Lock, Unlock, Heart, Send, Plus, 
  Trash2, Smile, ArrowLeft, Loader2, Link2, Download, Paperclip
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';

export default function ClubHome() {
  const { id: clubId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });

  const [club, setClub] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Discussions States
  const [posts, setPosts] = useState([]);
  const [postSort, setPostSort] = useState('newest'); // or popular
  const [postFilter, setPostFilter] = useState('all'); // or pinned
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  
  // Single Post Detail & Comments
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyParentId, setReplyParentId] = useState(null);

  // Chat States
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // userId -> name
  const socketRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Resources States
  const [resources, setResources] = useState([]);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDesc, setResourceDesc] = useState('');
  const [resourceType, setResourceType] = useState('PDF');
  const [resourceUrl, setResourceUrl] = useState('');

  // Events States
  const [events, setEvents] = useState([]);

  // Members & Leaderboard
  const [members, setMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // 1. Fetch Club Details
  const fetchClubDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/community/clubs/${clubId}`, { withCredentials: true });
      setClub(res.data?.data?.club || null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load club details.');
      navigate('/community');
    }
  };

  useEffect(() => {
    fetchClubDetails();
  }, [clubId]);

  // 2. Tab changes trigger fetches
  useEffect(() => {
    if (!club) return;

    if (activeTab === 'discussions') {
      fetchPosts();
    }
    if (activeTab === 'resources') {
      fetchResources();
    }
    if (activeTab === 'events') {
      fetchEvents();
    }
    if (activeTab === 'members') {
      fetchMembers();
    }
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab, club, postSort, postFilter]);

  // 3. Socket.IO Chat Setup
  useEffect(() => {
    if (activeTab !== 'chat' || !club?.isJoined) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to backend Socket.IO
    const socket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Join lounge room
    socket.emit('joinRoom', { clubId });

    // Fetch initial chat history
    axios.get(`http://localhost:5000/api/v1/community/clubs/${clubId}/chat/history`, { withCredentials: true })
      .then((res) => {
        setMessages(res.data?.data?.messages || []);
        scrollToBottom();
      })
      .catch((err) => console.error('Failed to load chat history:', err));

    // Listeners
    socket.on('messageReceived', (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    socket.on('activeUsers', (usersList) => {
      setOnlineUsers(usersList);
    });

    socket.on('userTyping', ({ userId, name, isTyping }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) {
          next[userId] = name;
        } else {
          delete next[userId];
        }
        return next;
      });
    });

    socket.on('messageReactionUpdated', ({ messageId, reactions }) => {
      setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
    });

    socket.on('messagePinned', ({ messageId, isPinned }) => {
      setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, isPinned } : m));
      toast.info(isPinned ? 'A message was pinned!' : 'A message was unpinned.');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', { clubId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [activeTab, clubId, club?.isJoined]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ─── HANDLERS ──────────────────────────────────────────────────────────────

  const handleJoinClub = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/v1/community/clubs/${clubId}/join`, {}, { withCredentials: true });
      if (res.data?.status === 'success') {
        toast.success('Joined club!');
        fetchClubDetails();
      }
    } catch (err) {
      toast.error('Failed to join club.');
    }
  };

  const handleLeaveClub = async () => {
    if (!window.confirm('Leave this club lounge?')) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/v1/community/clubs/${clubId}/leave`, {}, { withCredentials: true });
      if (res.data?.status === 'success') {
        toast.info('You left the club.');
        fetchClubDetails();
        setActiveTab('overview');
      }
    } catch (err) {
      toast.error('Leave club operation failed.');
    }
  };

  // ─── DISCUSSIONS ───────────────────────────────────────────────────────────
  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/v1/community/clubs/${clubId}/posts?sort=${postSort}&filter=${postFilter}`, 
        { withCredentials: true }
      );
      setPosts(res.data?.data?.posts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle) return;
    try {
      await axios.post(
        `http://localhost:5000/api/v1/community/clubs/${clubId}/posts`,
        { title: postTitle, description: postDesc },
        { withCredentials: true }
      );
      toast.success('Discussion posted!');
      setShowPostModal(false);
      setPostTitle('');
      setPostDesc('');
      fetchPosts();
    } catch (err) {
      toast.error('Failed to submit post.');
    }
  };

  const handleLikePost = async (pId, e) => {
    e.stopPropagation();
    try {
      const res = await axios.post(`http://localhost:5000/api/v1/community/posts/${pId}/like`, {}, { withCredentials: true });
      setPosts((prev) => prev.map(p => p._id === pId ? { ...p, likesCount: res.data.likesCount, isLiked: res.data.isLiked } : p));
      if (selectedPost && selectedPost._id === pId) {
        setSelectedPost(prev => ({ ...prev, likesCount: res.data.likesCount, isLiked: res.data.isLiked }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (pId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this forum post?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/community/posts/${pId}`, { withCredentials: true });
      toast.success('Post removed.');
      if (selectedPost?._id === pId) setSelectedPost(null);
      fetchPosts();
    } catch (err) {
      toast.error('Failed to remove post.');
    }
  };

  // Comments Retrieval
  const openPostComments = async (post) => {
    setSelectedPost(post);
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/community/posts/${post._id}/comments`, { withCredentials: true });
      setComments(res.data?.data?.comments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText) return;
    try {
      await axios.post(
        `http://localhost:5000/api/v1/community/posts/${selectedPost._id}/comments`,
        { content: newCommentText, parentId: replyParentId },
        { withCredentials: true }
      );
      setNewCommentText('');
      setReplyParentId(null);
      // Reload comments
      openPostComments(selectedPost);
      // Reload list counts
      fetchPosts();
    } catch (err) {
      toast.error('Failed to post reply.');
    }
  };

  const handleDeleteComment = async (cId) => {
    if (!window.confirm('Remove comment reply?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/community/comments/${cId}`, { withCredentials: true });
      openPostComments(selectedPost);
      fetchPosts();
    } catch (err) {
      toast.error('Failed to remove comment.');
    }
  };

  // ─── CHAT ACTIONS ──────────────────────────────────────────────────────────
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit('sendMessage', {
      clubId,
      content: chatInput,
      messageType: 'text',
    });
    setChatInput('');
    socketRef.current.emit('typing', { clubId, isTyping: false });
  };

  const handleTyping = (e) => {
    setChatInput(e.target.value);
    if (!socketRef.current) return;
    const isTyping = e.target.value.length > 0;
    socketRef.current.emit('typing', { clubId, isTyping });
  };

  const handleAddEmojiReaction = (msgId, emoji) => {
    if (!socketRef.current) return;
    socketRef.current.emit('addReaction', { clubId, messageId: msgId, emoji });
  };

  const handlePinChatMessage = (msgId, currentlyPinned) => {
    if (!socketRef.current) return;
    socketRef.current.emit('pinMessage', { clubId, messageId: msgId, isPinned: !currentlyPinned });
  };

  // ─── RESOURCES ─────────────────────────────────────────────────────────────
  const fetchResources = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/community/clubs/${clubId}/resources`, { withCredentials: true });
      setResources(res.data?.data?.resources || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!resourceTitle || !resourceUrl) return;
    try {
      await axios.post(
        `http://localhost:5000/api/v1/community/clubs/${clubId}/resources`,
        { title: resourceTitle, description: resourceDesc, fileType: resourceType, fileUrl: resourceUrl },
        { withCredentials: true }
      );
      toast.success('Resource file shared!');
      setShowResourceModal(false);
      setResourceTitle('');
      setResourceDesc('');
      setResourceUrl('');
      fetchResources();
    } catch (err) {
      toast.error('Failed to share resource.');
    }
  };

  const handleDeleteResource = async (rId) => {
    if (!window.confirm('Delete this shared file resource?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/community/resources/${rId}`, { withCredentials: true });
      toast.success('Resource deleted.');
      fetchResources();
    } catch (err) {
      toast.error('Failed to remove resource.');
    }
  };

  // ─── EVENTS INTEGRATION ───────────────────────────────────────────────────
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/community/clubs/${clubId}/events`, { withCredentials: true });
      setEvents(res.data?.data?.events || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ─── MEMBERS & LEADERBOARD ────────────────────────────────────────────────
  const fetchMembers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/community/clubs/${clubId}/members`, { withCredentials: true });
      setMembers(res.data?.data?.members || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/community/clubs/${clubId}/leaderboard`, { withCredentials: true });
      setLeaderboard(res.data?.data?.leaderboard || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (!club) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mr-2" />
        Loading club environment...
      </div>
    );
  }

  const isAdmin = user && (user.role === 'admin' || user.role === 'ADMIN');
  const isClubMod = club.role === 'moderator' || club.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8 font-sans">
      {/* Header card with Back action */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/community')} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to Community Hub
        </button>
      </div>

      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-[32px] overflow-hidden">
        {/* Banner */}
        <div className="h-44 bg-slate-950 relative">
          {club.banner && (
            <img src={club.banner} alt={club.name} className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          
          {/* Logo overlay */}
          <div className="absolute bottom-6 left-6 flex items-end gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-[20px] bg-slate-900 border border-slate-800 overflow-hidden shrink-0 shadow-xl">
              {club.logo && <img src={club.logo} alt="Logo" className="w-full h-full object-cover" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{club.name}</h2>
              <p className="text-xs text-indigo-400 mt-1 font-bold uppercase tracking-wider">{club.category} Group</p>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex gap-2">
            <span className="bg-slate-900/90 border border-slate-850 px-3.5 py-2 rounded-xl text-xs text-slate-300 font-bold flex items-center gap-1">
              <Users className="h-4 w-4 text-slate-500" /> {club.totalMembers} Members
            </span>

            {club.isJoined ? (
              <button
                onClick={handleLeaveClub}
                className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
              >
                Leave Club
              </button>
            ) : (
              <button
                onClick={handleJoinClub}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-lg shadow-indigo-600/30"
              >
                Join Club
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Club Rules & Overview', icon: BookOpen },
          { id: 'discussions', label: 'Discussions', icon: MessageSquare },
          { id: 'chat', label: 'Lounge Chat', icon: Send },
          { id: 'resources', label: 'Library Resources', icon: FolderOpen },
          { id: 'events', label: 'Related Events', icon: Calendar },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              if (t.id !== 'overview' && t.id !== 'events' && !club.isJoined) {
                toast.warning('Please join the club to unlock discussions, chat lounge, resource library, and leaderboards!');
                return;
              }
              setActiveTab(t.id);
            }}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              !club.isJoined && t.id !== 'overview' && t.id !== 'events' ? 'opacity-40 cursor-not-allowed' : ''
            } ${
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

      {/* ─── TAB 1: OVERVIEW ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-[28px] space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">About Club</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{club.description}</p>
            </div>

            <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-[28px] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lounge Code of Conduct</h3>
              <ul className="space-y-3">
                {club.rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-400 font-medium leading-normal">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">{idx + 1}</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-[28px] text-center space-y-4">
              <Users className="h-8 w-8 mx-auto text-indigo-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Lounge Membership</h4>
              <p className="text-xs text-slate-500 leading-normal font-semibold">Join this lounge to post topics, enter real-time developer stream chat rooms, and exchange attachments.</p>
              {!club.isJoined && (
                <button
                  onClick={handleJoinClub}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-xs font-bold transition-all duration-200"
                >
                  Join Official Lounge
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: DISCUSSIONS ──────────────────────────────────────────────── */}
      {activeTab === 'discussions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center gap-2">
              <div className="flex gap-1.5 text-xs">
                <button onClick={() => setPostSort('newest')} className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${postSort === 'newest' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'}`}>Newest</button>
                <button onClick={() => setPostSort('popular')} className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${postSort === 'popular' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'}`}>Popular</button>
                <button onClick={() => setPostFilter(postFilter === 'pinned' ? 'all' : 'pinned')} className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${postFilter === 'pinned' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'}`}>Pinned Only</button>
              </div>
              <button
                onClick={() => setShowPostModal(true)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all duration-200"
              >
                <Plus className="h-4 w-4" /> Start Discussion
              </button>
            </div>

            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => openPostComments(post)}
                  className="bg-slate-900/20 hover:bg-slate-900/30 border border-slate-800/80 p-5 rounded-[24px] cursor-pointer transition-all duration-200 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {post.isPinned && (
                          <span className="flex items-center gap-0.5 text-[9px] font-black uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                            Pinned
                          </span>
                        )}
                        {post.isLocked && (
                          <span className="flex items-center gap-0.5 text-[9px] font-black uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                            Locked
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-white hover:text-indigo-400 transition-colors leading-snug">{post.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500">By {post.author?.name} | {new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>

                    {(isAdmin || isClubMod || post.author?._id === user?.id) && (
                      <button
                        onClick={(e) => handleDeletePost(post._id, e)}
                        className="p-1 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/25 transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-3">
                    {post.description}
                  </p>

                  <div className="border-t border-slate-850/60 pt-3 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <button
                      onClick={(e) => handleLikePost(post._id, e)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        post.isLiked ? 'text-rose-400 font-bold' : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      <Heart className="h-4 w-4" /> {post.likesCount} Likes
                    </button>

                    <span className="flex items-center gap-1 text-indigo-400">
                      <MessageSquare className="h-4 w-4" /> {post.commentsCount} Comments
                    </span>
                  </div>
                </div>
              ))}

              {posts.length === 0 && (
                <div className="bg-slate-900/15 border border-slate-850 rounded-2xl p-12 text-center text-slate-500">
                  <MessageSquare className="h-10 w-10 mx-auto text-slate-600 mb-3" />
                  <p className="text-xs font-semibold">No discussions posted here yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Side Drawer: Comments section */}
          <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-[28px] h-[550px] flex flex-col justify-between">
            {selectedPost ? (
              <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                  <div className="space-y-1 pb-3 border-b border-slate-850/60">
                    <h4 className="text-xs font-bold text-white leading-snug">{selectedPost.title}</h4>
                    <p className="text-[10px] text-slate-500">Replies Tree</p>
                  </div>

                  {/* Render Nested Comments */}
                  <div className="space-y-3.5">
                    {comments.map((comment) => (
                      <div key={comment._id} className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/80 space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-indigo-400">{comment.author?.name}</span>
                          {(isAdmin || isClubMod || comment.author?._id === user?.id) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-rose-400 hover:text-rose-300"
                              title="Delete reply"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{comment.content}</p>
                      </div>
                    ))}

                    {comments.length === 0 && (
                      <p className="text-[11px] text-slate-600 text-center py-6 font-semibold">No replies yet. Be the first to add!</p>
                    )}
                  </div>
                </div>

                {!selectedPost.isLocked ? (
                  <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-850 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a reply..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500/50"
                    />
                    <button type="submit" className="w-8.5 h-8.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center shrink-0">
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                ) : (
                  <p className="text-[10px] text-slate-500 text-center pt-4 font-semibold italic">Discussion is locked.</p>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center space-y-2">
                <MessageSquare className="h-10 w-10 text-slate-700" />
                <p className="text-xs font-semibold">Select a discussion post on the left to read replies tree.</p>
              </div>
            )}
          </div>

          {/* Add Post Modal */}
          {showPostModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-[28px] space-y-6 text-xs">
                <h4 className="text-base font-bold text-white">Start a Discussion</h4>

                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Post Title</label>
                    <input
                      type="text"
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="Share a code framework, question, or updates..."
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Message</label>
                    <textarea
                      value={postDesc}
                      onChange={(e) => setPostDesc(e.target.value)}
                      rows="5"
                      placeholder="Write your discussion topic details here..."
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-850/80 text-slate-350 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                    >
                      Publish Topic
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: CHAT LOUNGE ──────────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[550px] overflow-hidden">
          {/* Main Messages Room */}
          <div className="lg:col-span-3 bg-slate-900/20 border border-slate-800 rounded-[28px] p-5 flex flex-col justify-between h-full overflow-hidden">
            
            {/* Messages body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg._id} className={`flex items-start gap-3 ${msg.sender?._id === user?.id ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 shrink-0 uppercase">
                    {msg.sender?.name ? msg.sender.name[0] : 'U'}
                  </div>

                  <div className={`space-y-1 max-w-[70%] ${msg.sender?._id === user?.id ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 flex-wrap justify-start">
                      <span className="text-[10px] font-bold text-indigo-400">{msg.sender?.name || 'Member'}</span>
                      {msg.isPinned && (
                        <span className="text-[8px] font-black uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1 py-0.5 rounded flex items-center gap-0.5">
                          <Pin className="h-2 w-2" /> Pinned
                        </span>
                      )}
                      <span className="text-[8px] text-slate-500 font-semibold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className={`rounded-2xl px-4 py-2.5 text-xs font-semibold text-left inline-block leading-relaxed relative group ${
                      msg.sender?._id === user?.id 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-950/80 border border-slate-850 text-slate-200 rounded-tl-none'
                    }`}>
                      <p>{msg.content}</p>

                      {/* Reactions display */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {msg.reactions.map((r, rIdx) => (
                            <span key={rIdx} className="bg-slate-900/60 border border-slate-850 px-1.5 py-0.5 rounded-lg text-[9px]">
                              {r.emoji}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Reaction drawer popover on hover */}
                      <div className="absolute -top-8 right-0 bg-slate-900 border border-slate-800 rounded-lg p-1 hidden group-hover:flex gap-1.5 z-10 shadow-lg">
                        {['👍', '❤️', '🔥', '👏', '😂'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleAddEmojiReaction(msg._id, emoji)}
                            className="hover:scale-125 transition-transform p-0.5"
                          >
                            {emoji}
                          </button>
                        ))}
                        {(isAdmin || isClubMod) && (
                          <button
                            onClick={() => handlePinChatMessage(msg._id, msg.isPinned)}
                            className="p-0.5 hover:text-cyan-400"
                            title="Pin message"
                          >
                            <Pin className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicators */}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 italic font-semibold">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  <span>{Object.values(typingUsers).join(', ')} is typing...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendChatMessage} className="pt-4 border-t border-slate-850 flex gap-2">
              <input
                type="text"
                placeholder="Type your message to lounge..."
                value={chatInput}
                onChange={handleTyping}
                className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500/50"
              />
              <button type="submit" className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Active Members Sidebar Panel */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-[28px] p-5 space-y-4 overflow-y-auto custom-scrollbar">
            <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Online Lounge ({onlineUsers.length})</h4>
            <div className="space-y-3">
              {onlineUsers.map(usr => (
                <div key={usr._id} className="flex items-center gap-2.5 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-white">{usr.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: RESOURCES ────────────────────────────────────────────────── */}
      {activeTab === 'resources' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Resource Library</h4>
            <button
              onClick={() => setShowResourceModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all duration-200"
            >
              <Plus className="h-4 w-4" /> Share Document / Link
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <div 
                key={res._id}
                className="bg-slate-900/20 border border-slate-850 p-5 rounded-[24px] flex flex-col justify-between space-y-4 hover:border-indigo-500/20 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold mb-3">
                    <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/15">
                      {res.fileType}
                    </span>
                    {(isAdmin || isClubMod || res.uploadedBy?._id === user?.id) && (
                      <button
                        onClick={() => handleDeleteResource(res._id)}
                        className="text-rose-400 hover:text-rose-350"
                        title="Delete resource"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <h5 className="text-xs font-bold text-white leading-snug line-clamp-2">{res.title}</h5>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{res.description}</p>
                </div>

                <div className="border-t border-slate-850/60 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span className="text-[9px] text-slate-500">By {res.uploadedBy?.name}</span>
                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-400 hover:underline hover:text-indigo-300"
                  >
                    <Download className="h-3.5 w-3.5" /> Access File
                  </a>
                </div>
              </div>
            ))}

            {resources.length === 0 && (
              <div className="col-span-full bg-slate-900/15 border border-slate-850 rounded-2xl p-12 text-center text-slate-500">
                <FolderOpen className="h-10 w-10 mx-auto text-slate-600 mb-3" />
                <p className="text-xs font-semibold">No documents uploaded to this club yet.</p>
              </div>
            )}
          </div>

          {/* Add Resource Modal */}
          {showResourceModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-[28px] space-y-6 text-xs">
                <h4 className="text-base font-bold text-white">Share Library Resource</h4>

                <form onSubmit={handleCreateResource} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold uppercase tracking-wider">Document Title</label>
                      <input
                        type="text"
                        required
                        value={resourceTitle}
                        onChange={(e) => setResourceTitle(e.target.value)}
                        placeholder="React Architecture PDF..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold uppercase tracking-wider">File Type</label>
                      <select
                        value={resourceType}
                        onChange={(e) => setResourceType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50"
                      >
                        {['PDF', 'PPT', 'ZIP', 'GitHub', 'YouTube', 'GoogleDrive', 'Other'].map(type => (
                          <option key={type} value={type} className="bg-slate-900">{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">File Link / URL</label>
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                      <input
                        type="url"
                        required
                        value={resourceUrl}
                        onChange={(e) => setResourceUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-11 pr-4 py-2.5 text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Description</label>
                    <textarea
                      value={resourceDesc}
                      onChange={(e) => setResourceDesc(e.target.value)}
                      rows="3"
                      placeholder="Brief details about what files/links contain..."
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setShowResourceModal(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-855 text-slate-350 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                    >
                      Upload File
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 5: EVENTS ──────────────────────────────────────────────────── */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Upcoming Club Bootcamps & Workshops</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <div 
                key={evt._id}
                onClick={() => navigate(`/event/${evt._id}`)}
                className="bg-slate-900/20 hover:bg-slate-900/30 border border-slate-800 p-5 rounded-[24px] cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div>
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                    {evt.category}
                  </span>
                  <h5 className="text-xs font-bold text-white mt-2 leading-snug line-clamp-2">{evt.eventName}</h5>
                  <p className="text-[11px] text-slate-500 mt-1">{new Date(evt.eventDate).toLocaleDateString()}</p>
                </div>
                <div className="border-t border-slate-850/60 pt-3 flex items-center justify-between text-[10px] text-indigo-400 font-bold">
                  <span>Price: {evt.ticketPrice > 0 ? `$${evt.ticketPrice}` : 'FREE'}</span>
                  <span>View Details & Book →</span>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="col-span-full bg-slate-900/15 border border-slate-850 rounded-2xl p-12 text-center text-slate-500">
                <Calendar className="h-10 w-10 mx-auto text-slate-600 mb-3" />
                <p className="text-xs font-semibold">No matching events organized for this club category yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 6: MEMBERS ──────────────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <div className="bg-slate-900/20 border border-slate-800 rounded-[28px] p-6 space-y-6 animate-fade-in">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Lounge Directory</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map(mem => (
              <div key={mem._id} className="bg-slate-950/40 border border-slate-900/80 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center font-bold text-indigo-400 uppercase">
                  {mem.userId?.name ? mem.userId.name[0] : 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{mem.userId?.name || 'Member'}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{mem.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 7: LEADERBOARD ──────────────────────────────────────────────── */}
      {activeTab === 'leaderboard' && (
        <div className="max-w-xl bg-slate-900/20 border border-slate-800 rounded-[28px] p-6 space-y-6 animate-fade-in">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Activity Leaderboard</h4>
            <p className="text-slate-500 text-xs mt-1">Ranking members by their interaction activity scores (10 pts per post, 5 pts per reply).</p>
          </div>

          <div className="space-y-3">
            {leaderboard.map((row, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                    idx === 0 ? 'bg-amber-500 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-white font-bold">{row.user?.name}</p>
                    <p className="text-[10px] text-slate-500">{row.postsCount} Posts | {row.commentsCount} Comments</p>
                  </div>
                </div>

                <span className="text-indigo-400 font-black uppercase text-[10px] bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                  {row.score} PTS
                </span>
              </div>
            ))}

            {leaderboard.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No leaderboard scores calculated yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
