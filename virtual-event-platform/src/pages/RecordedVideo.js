import React, { useState } from 'react';
import {
  Play,
  Clock,
  Calendar,
  User,
  Tag,
  X,
  Video,
  MonitorPlay,
  Share2
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

function RecordedVideos() {
  const [activeVideo, setActiveVideo] = useState(null);

  const videos = [
    {
      id: 1,
      title: "JavaScript Fundamentals Workshop",
      thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=800",
      videoPath: "/videos/video1.mp4",
      date: "Jan 10, 2025",
      duration: "1:45:30",
      organizer: "Pune JS Community",
      category: "Technology"
    },
    {
      id: 2,
      title: "Personal Finance Workshop",
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
      videoPath: "/videos/video2.mp4",
      date: "Jan 15, 2025",
      duration: "1:20:00",
      organizer: "Narendra Saraf",
      category: "Finance"
    },
    {
      id: 3,
      title: "Flask Project Building session",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
      videoPath: "/videos/video3.mp4",
      date: "Feb 22, 2025",
      duration: "0:10:15",
      organizer: "Ayush Dayal",
      category: "Web Development"
    },
    {
      id: 4,
      title: "App Tour & Onboarding",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
      videoPath: "/videos/video4.mp4",
      date: "Apr 28, 2025",
      duration: "1:30:45",
      organizer: "Pranav Attarde",
      category: "Guidance"
    }
  ];

  const playVideo = (id) => setActiveVideo(id);
  const closeVideo = () => setActiveVideo(null);

  const currentVideo = videos.find(video => video.id === activeVideo);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="section-container pt-12">
        <PageHeader
          title="Recorded Sessions"
          subtitle="Missed a live event? Catch up on all our past workshops and seminars right here."
        />

        {/* Video Player Modal */}
        {activeVideo && currentVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl animate-in fade-in duration-300" onClick={closeVideo} />
            <div className="relative w-full max-w-5xl bg-surface border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="font-bold text-text-primary px-2 truncate max-w-md">{currentVideo.title}</h3>
                <button
                  className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
                  onClick={closeVideo}
                >
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>
              <div className="aspect-video bg-black relative">
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  src={currentVideo.videoPath}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error("Video error:", e);
                  }}
                />
              </div>
              <div className="p-6 bg-slate-900/50 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Calendar className="h-4 w-4 text-primary" /> {currentVideo.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <User className="h-4 w-4 text-primary" /> {currentVideo.organizer}
                  </div>
                </div>
                <button className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 self-start sm:self-auto">
                  <Share2 className="h-4 w-4" /> Share Session
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map(video => (
            <div
              key={video.id}
              className="card group overflow-hidden bg-surface/50 border-slate-800 hover:border-primary/50 transition-all duration-300 flex flex-col"
            >
              <div
                className="relative aspect-video overflow-hidden cursor-pointer"
                onClick={() => playVideo(video.id)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-primary" /> {video.duration}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-xl shadow-primary/40">
                    <Play className="h-8 w-8 fill-current translate-x-1" />
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {video.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-text-primary mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => playVideo(video.id)}>
                  {video.title}
                </h3>

                <div className="mt-auto space-y-3 pt-4 border-t border-slate-800/50">
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <MonitorPlay className="h-4 w-4 text-primary" />
                    </div>
                    <span className="truncate">{video.organizer}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span>{video.date}</span>
                  </div>
                </div>

                <button
                  className="mt-6 w-full btn-secondary py-3 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 font-bold flex items-center justify-center gap-2"
                  onClick={() => playVideo(video.id)}
                >
                  Watch Now <Play className="h-4 w-4 group-hover:fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecordedVideos;
