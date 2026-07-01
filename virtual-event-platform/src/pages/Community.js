import React, { useState } from 'react';
import { Users, Plus, CheckCircle, MessageSquare } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function Community() {
  const [joined, setJoined] = useState({});

  const communities = [
    {
      id: 'comm_1',
      name: 'TypeScript Builders',
      members: '12,492 members',
      desc: 'Share typed architectures, review code snippets, and coordinate virtual TS Conf workshops.',
      tags: ['TypeScript', 'Node.js', 'Frontend']
    },
    {
      id: 'comm_2',
      name: 'AI Operations & Agents',
      members: '8,244 members',
      desc: 'Focused on developer tooling, prompt registries, LangChain/Gemini frameworks, and agentic workflows.',
      tags: ['AI/ML', 'Gemini', 'Automation']
    },
    {
      id: 'comm_3',
      name: 'React Ecosystem Pune',
      members: '3,810 members',
      desc: 'Local network of React and React Native developers. Weekly hybrid coding stream sessions.',
      tags: ['React', 'Meetups', 'Local']
    },
    {
      id: 'comm_4',
      name: 'Cybersecurity Guard',
      members: '5,102 members',
      desc: 'Discussions on cloud network defense protocols, Linux servers pen-testing, and DEFCON events.',
      tags: ['Security', 'Linux', 'Workshops']
    }
  ];

  const handleJoin = (id) => {
    setJoined(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">

      <PageHeader
        title="Community Hub"
        subtitle="Connect with active developers, designers, and organizers. Join focused sub-groups and collaborate on projects."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
        {communities.map((comm) => (
          <div
            key={comm.id}
            className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-[28px] hover:border-indigo-500/35 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
                    <Users className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{comm.name}</h3>
                    <span className="text-xs font-semibold text-slate-500">{comm.members}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoin(comm.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    joined[comm.id]
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {joined[comm.id] ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" /> Joined Group
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" /> Join Group
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed font-medium mb-6 min-h-[50px]">
                {comm.desc}
              </p>
            </div>

            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                {comm.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-xs font-semibold text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="border-t border-slate-800 pt-4 flex items-center gap-2 text-xs font-bold text-indigo-400 cursor-pointer hover:text-indigo-300">
                <MessageSquare className="h-4 w-4" /> 18 Active Discussions Today
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Community;
