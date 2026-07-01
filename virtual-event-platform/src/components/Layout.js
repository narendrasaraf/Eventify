import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import { MessageSquare, Send, X, Loader2, Sparkles } from 'lucide-react';

// Pages that don't use the sidebar shell
const BARE_PATHS = ['/', '/login', '/signup', '/terms', '/privacy', '/pricing', '/about'];

const renderMessageText = (text) => {
  if (!text) return '';
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={matchIndex}
        href={linkUrl}
        className="text-indigo-400 hover:text-indigo-300 underline font-semibold transition-colors"
      >
        {linkText}
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      text: 'Hi there! 👋 I am your Eventify Guide. Ask me anything about navigating the platform, creating events (manually or via AI Co-Creator), virtual workspaces, or booking tickets!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await axios.post(
        'http://localhost:5000/api/v1/intelligence/platform-guide',
        { question: userMessage.text, history: historyPayload },
        { withCredentials: true }
      );

      if (res.data?.data?.answer) {
        setMessages(prev => [...prev, { sender: 'agent', text: res.data.data.answer }]);
      } else {
        setMessages(prev => [...prev, { sender: 'agent', text: 'Sorry, I could not retrieve an answer.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'agent', text: 'Error connecting to assistant server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Bubble Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-200"
          title="Platform Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] h-[480px] bg-slate-950 border border-slate-800 rounded-2xl flex flex-col shadow-2xl animate-fade-up overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/15 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Guide Assistant</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-950/40">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 rounded-tl-none'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {renderMessageText(m.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-3.5 py-2.5 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider animate-pulse">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-8.5 h-8.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

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
    return (
      <>
        {children}
        <GlobalChatbot />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main content area — offset by sidebar width */}
      <main className="flex-1 min-h-screen lg:ml-56 transition-all duration-300 pt-14 lg:pt-0">
        <div className="min-h-screen">{children}</div>
      </main>
      <GlobalChatbot />
    </div>
  );
}
