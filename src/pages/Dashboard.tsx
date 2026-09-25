import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  Upload, 
  FolderPlus, 
  StickyNote, 
  ShieldCheck, 
  FileText, 
  Image, 
  Video, 
  ArrowUpRight, 
  Clock, 
  MoreVertical, 
  Star, 
  Download, 
  Trash2,
  FileCode,
  Sparkles
} from 'lucide-react';
import { 
  getStorageStats, 
  getFiles, 
  toggleFavoriteFile, 
  deleteFile, 
  createFolder,
  subscribeToStore 
} from '../services/storage';
import { FileItem, StorageStats } from '../types';

interface DashboardProps {
  onNavigate: (route: string) => void;
  onOpenUpload: () => void;
  onPreviewFile?: (file: FileItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenUpload,
  onPreviewFile,
}) => {
  const [stats, setStats] = useState<StorageStats>(getStorageStats());
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const refresh = () => {
    setStats(getStorageStats());
    const files = getFiles();
    setRecentFiles(files.slice(0, 6));
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(refresh);
    return unsub;
  }, []);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim());
    setNewFolderName('');
    setNewFolderOpen(false);
  };

  const usedGB = (stats.used / (1024 * 1024 * 1024)).toFixed(2);
  const availableGB = (stats.available / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (stats.total / (1024 * 1024 * 1024)).toFixed(0);
  const usedPercent = Math.min(100, Math.round((stats.used / stats.total) * 100));

  // Circular progress chart calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (usedPercent / 100) * circumference;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl glass-panel bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/40 border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> FM_Store Prime Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Command Central
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              All personal assets, zero-knowledge encrypted vaults, rich notes, and media streams are synchronized and safeguarded.
            </p>
          </div>

          {/* Quick Storage Badge */}
          <div className="flex items-center gap-4 bg-slate-900/80 p-3 px-5 rounded-2xl border border-white/5 shadow-inner">
            <div className="text-right">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Storage Usage</p>
              <p className="text-lg font-bold font-mono text-cyan-400">
                {usedGB} <span className="text-xs text-slate-400">/ {totalGB} GB</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics & Storage Circular Visualization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Circular Donut Chart Card */}
        <div className="lg:col-span-1 rounded-3xl glass-panel bg-slate-900/50 border border-white/10 p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" /> Storage Capacity
            </h3>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              {usedPercent}% Used
            </span>
          </div>

          {/* Donut SVG Ring */}
          <div className="relative flex items-center justify-center py-4">
            <svg className="w-44 h-44 transform -rotate-90">
              {/* Background Track */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="text-slate-800/80"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress Gradient Ring */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke="url(#gradient-chart)"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient-chart" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black font-mono text-white tracking-tight">
                {usedPercent}%
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                Utilized
              </span>
            </div>
          </div>

          {/* Breakdown Bars */}
          <div className="space-y-2.5 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-slate-300">Images</span>
              </div>
              <span className="font-mono text-slate-400">
                {(stats.imagesSize / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-300">Videos</span>
              </div>
              <span className="font-mono text-slate-400">
                {(stats.videosSize / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Documents</span>
              </div>
              <span className="font-mono text-slate-400">
                {(stats.docsSize / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Card: Total Files */}
          <div 
            onClick={() => onNavigate('files')}
            className="p-5 rounded-3xl glass-panel-interactive cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-extrabold text-white font-mono">{stats.totalFiles}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Total Files Stored</p>
            </div>
          </div>

          {/* Card: Images */}
          <div 
            onClick={() => onNavigate('images')}
            className="p-5 rounded-3xl glass-panel-interactive cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Image className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-extrabold text-white font-mono">{stats.totalImages}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Image Gallery</p>
            </div>
          </div>

          {/* Card: Videos */}
          <div 
            onClick={() => onNavigate('videos')}
            className="p-5 rounded-3xl glass-panel-interactive cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Video className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-extrabold text-white font-mono">{stats.totalVideos}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Video Library</p>
            </div>
          </div>

          {/* Card: Documents */}
          <div 
            onClick={() => onNavigate('documents')}
            className="p-5 rounded-3xl glass-panel-interactive cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileCode className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-extrabold text-white font-mono">{stats.totalDocs}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Documents & PDFs</p>
            </div>
          </div>

          {/* Card: Notes */}
          <div 
            onClick={() => onNavigate('notes')}
            className="p-5 rounded-3xl glass-panel-interactive cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <StickyNote className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-extrabold text-white font-mono">{stats.totalNotes}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Encrypted Notes</p>
            </div>
          </div>

          {/* Card: Vault */}
          <div 
            onClick={() => onNavigate('vault')}
            className="p-5 rounded-3xl glass-panel-interactive cursor-pointer flex flex-col justify-between border-indigo-500/30 bg-indigo-950/20"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-cyan-300 border border-indigo-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-extrabold text-white font-mono">256-Bit</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Password Vault</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2.5 p-3 rounded-2xl glass-panel-interactive border-cyan-500/20 hover:border-cyan-400 text-left"
          >
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Upload File</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2.5 p-3 rounded-2xl glass-panel-interactive border-indigo-500/20 hover:border-indigo-400 text-left"
          >
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
              <Image className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Add Image</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2.5 p-3 rounded-2xl glass-panel-interactive border-purple-500/20 hover:border-purple-400 text-left"
          >
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Add Video</span>
          </button>

          <button
            onClick={() => onNavigate('notes')}
            className="flex items-center gap-2.5 p-3 rounded-2xl glass-panel-interactive border-amber-500/20 hover:border-amber-400 text-left"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <StickyNote className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">New Note</span>
          </button>

          <button
            onClick={() => onNavigate('vault')}
            className="flex items-center gap-2.5 p-3 rounded-2xl glass-panel-interactive border-emerald-500/20 hover:border-emerald-400 text-left"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">Save Credential</span>
          </button>

          <button
            onClick={() => setNewFolderOpen(true)}
            className="flex items-center gap-2.5 p-3 rounded-2xl glass-panel-interactive border-white/10 hover:border-white/30 text-left"
          >
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300 shrink-0">
              <FolderPlus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white">New Folder</span>
          </button>
        </div>
      </div>

      {/* Recent Files Table / Cards */}
      <div className="rounded-3xl glass-panel bg-slate-900/40 border border-white/10 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Recent Files</h3>
          </div>
          <button
            onClick={() => onNavigate('files')}
            className="text-xs text-indigo-400 hover:text-cyan-300 transition-colors font-medium flex items-center gap-1"
          >
            <span>View all files</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentFiles.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm font-semibold text-slate-300">No files uploaded yet</p>
            <p className="text-xs text-slate-500 mt-1">Upload files using the button above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                  <th className="pb-3 pl-3">Item Name</th>
                  <th className="pb-3 hidden sm:table-cell">Type</th>
                  <th className="pb-3 hidden md:table-cell">Size</th>
                  <th className="pb-3 hidden lg:table-cell">Uploaded</th>
                  <th className="pb-3 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onPreviewFile && onPreviewFile(file)}
                  >
                    <td className="py-3.5 pl-3">
                      <div className="flex items-center gap-3">
                        {file.thumbnail ? (
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                            <img
                              src={file.thumbnail}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                            {file.file_type === 'video' ? (
                              <Video className="w-4 h-4" />
                            ) : file.file_type === 'document' ? (
                              <FileText className="w-4 h-4" />
                            ) : (
                              <HardDrive className="w-4 h-4" />
                            )}
                          </div>
                        )}
                        <span className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate max-w-xs sm:max-w-sm">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300 capitalize">
                        {file.file_type}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-slate-400 hidden md:table-cell">
                      {(file.file_size / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="py-3.5 text-slate-400 font-mono text-[11px] hidden lg:table-cell">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 pr-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleFavoriteFile(file.id)}
                          className={`p-1.5 rounded-lg hover:bg-slate-700/60 transition-colors ${
                            file.favorite ? 'text-amber-400' : 'text-slate-500 hover:text-white'
                          }`}
                          title={file.favorite ? 'Unstar' : 'Favorite'}
                        >
                          <Star className={`w-4 h-4 ${file.favorite ? 'fill-amber-400' : ''}`} />
                        </button>
                        <a
                          href={file.url}
                          download={file.name}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/60 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => deleteFile(file.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Move to Trash"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {newFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl glass-panel bg-[#0d1322] border border-white/10 shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2">Create New Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                autoFocus
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name (e.g. Design Assets)"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewFolderOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
