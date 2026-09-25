import React, { useState, useEffect, useRef } from 'react';
import { 
  Video as VideoIcon, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Download, 
  Trash2, 
  Star, 
  Search, 
  Upload, 
  X, 
  Edit2, 
  Clock 
} from 'lucide-react';
import { getFiles, deleteFile, toggleFavoriteFile, renameFile, subscribeToStore } from '../services/storage';
import { FileItem } from '../types';

interface VideoLibraryProps {
  onOpenUpload: () => void;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({ onOpenUpload }) => {
  const [videos, setVideos] = useState<FileItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeVideo, setActiveVideo] = useState<FileItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const refreshVideos = () => {
    const all = getFiles({ category: 'videos' });
    setVideos(all);
  };

  useEffect(() => {
    refreshVideos();
    const unsub = subscribeToStore(refreshVideos);
    return unsub;
  }, []);

  const filteredVideos = videos.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Video Player
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Video Media Library
          </h1>
          <p className="text-xs text-slate-400">
            Stream high-definition recordings, video assets, and demos
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos by title..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
          />
        </div>
        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Video Cards Grid */}
      {filteredVideos.length === 0 ? (
        <div className="rounded-3xl glass-panel bg-slate-900/30 border border-white/5 p-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
            <VideoIcon className="w-8 h-8" />
          </div>
          <p className="text-base font-bold text-white">No video files found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Upload your product demos, tutorials, and video clips to stream them instantly in the built-in 4K player.
          </p>
          <button
            onClick={onOpenUpload}
            className="mt-5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
          >
            Upload Your First Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => {
                setActiveVideo(vid);
                setIsPlaying(true);
              }}
              className="group relative rounded-3xl glass-panel-interactive border-white/5 overflow-hidden flex flex-col justify-between cursor-pointer"
            >
              {/* Thumbnail Stage */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                {vid.thumbnail ? (
                  <img
                    src={vid.thumbnail}
                    alt={vid.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <VideoIcon className="w-12 h-12 text-slate-700" />
                )}

                {/* Big Center Play Circle */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/90 border border-white/20 shadow-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-cyan-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatSeconds(vid.duration || 120)}</span>
                </div>

                {/* Favorite Star */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteFile(vid.id);
                  }}
                  className={`absolute top-2 left-2 p-1.5 rounded-lg backdrop-blur-md transition-all ${
                    vid.favorite
                      ? 'bg-amber-500/30 text-amber-300'
                      : 'bg-black/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${vid.favorite ? 'fill-amber-400' : ''}`} />
                </button>
              </div>

              {/* Info & Card Actions */}
              <div className="p-4">
                <p className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                  {vid.name}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>{(vid.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                  <span>{new Date(vid.created_at).toLocaleDateString()}</span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={vid.url}
                    download={vid.name}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => deleteFile(vid.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Move to Trash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Built-in Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in select-none">
          <div className="relative w-full max-w-4xl rounded-3xl glass-panel bg-[#0d1322] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            {/* Player Top Bar */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {activeVideo.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveVideo(null);
                  setIsPlaying(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video HTML5 Element */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                src={activeVideo.url}
                autoPlay
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
              />
            </div>

            {/* Custom Cyber Control Deck */}
            <div className="p-4 bg-slate-950/90 border-t border-white/10 space-y-3">
              {/* Scrubbable Seek Bar */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-slate-400 w-12 text-right">
                  {formatSeconds(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Seek video position"
                  className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[11px] font-mono text-slate-400 w-12">
                  {formatSeconds(duration)}
                </span>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      aria-label="Adjust volume"
                      className="w-16 sm:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavoriteFile(activeVideo.id)}
                    className={`p-2 rounded-xl border border-white/5 transition-colors ${
                      activeVideo.favorite ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${activeVideo.favorite ? 'fill-amber-400' : ''}`} />
                  </button>
                  <a
                    href={activeVideo.url}
                    download={activeVideo.name}
                    className="p-2 rounded-xl text-slate-400 hover:text-white border border-white/5"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl text-slate-400 hover:text-white border border-white/5"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
