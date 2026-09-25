import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Grid, 
  List, 
  Search, 
  Upload, 
  Star, 
  Download, 
  Trash2, 
  Edit2, 
  Copy, 
  MoveRight, 
  ChevronRight, 
  Image, 
  Video, 
  FileText, 
  Music, 
  Archive, 
  HardDrive, 
  ArrowUpDown,
  MoreVertical,
  Filter,
  Check
} from 'lucide-react';
import { 
  getFiles, 
  getFolders, 
  createFolder, 
  deleteFile, 
  renameFile, 
  moveFile, 
  copyFile, 
  toggleFavoriteFile,
  subscribeToStore 
} from '../services/storage';
import { FileItem, FolderItem } from '../types';

interface FileManagerProps {
  onOpenUpload: (folderId?: string | null) => void;
  onPreviewFile: (file: FileItem) => void;
  filterCategory?: string;
}

export const FileManager: React.FC<FileManagerProps> = ({
  onOpenUpload,
  onPreviewFile,
  filterCategory = 'all',
}) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(filterCategory);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [moveTarget, setMoveTarget] = useState<FileItem | null>(null);
  const [moveDestination, setMoveDestination] = useState<string | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);

  const refreshData = () => {
    setFiles(getFiles());
    setFolders(getFolders());
  };

  useEffect(() => {
    refreshData();
    const unsub = subscribeToStore(refreshData);
    return unsub;
  }, []);

  useEffect(() => {
    setCategoryFilter(filterCategory);
  }, [filterCategory]);

  // Current folder info
  const currentFolder = folders.find(f => f.id === currentFolderId);

  // Filter & sort files
  const filteredFiles = files.filter(file => {
    // Trash
    if (file.is_trash) return false;

    // Folder
    if (categoryFilter === 'all' && currentFolderId !== null && file.folder_id !== currentFolderId) {
      return false;
    }

    // Category
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'images' && file.file_type !== 'image') return false;
      if (categoryFilter === 'videos' && file.file_type !== 'video') return false;
      if (categoryFilter === 'documents' && file.file_type !== 'document') return false;
      if (categoryFilter === 'audio' && file.file_type !== 'audio') return false;
      if (categoryFilter === 'archive' && file.file_type !== 'archive') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return file.name.toLowerCase().includes(q) || file.file_type.includes(q);
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    if (sortBy === 'size') {
      return sortOrder === 'asc' ? a.file_size - b.file_size : b.file_size - a.file_size;
    }
    // Date
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? da - db : db - da;
  });

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim(), currentFolderId);
    setNewFolderName('');
    setNewFolderOpen(false);
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameTarget && renameValue.trim()) {
      renameFile(renameTarget.id, renameValue.trim());
      setRenameTarget(null);
    }
  };

  const handleMove = () => {
    if (moveTarget) {
      moveFile(moveTarget.id, moveDestination);
      setMoveTarget(null);
    }
  };

  const getFileIcon = (type: FileItem['file_type']) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-cyan-400" />;
      case 'video': return <Video className="w-5 h-5 text-purple-400" />;
      case 'document': return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'audio': return <Music className="w-5 h-5 text-emerald-400" />;
      case 'archive': return <Archive className="w-5 h-5 text-amber-400" />;
      default: return <HardDrive className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <button
              onClick={() => setCurrentFolderId(null)}
              className="hover:text-cyan-300 transition-colors"
            >
              All Files
            </button>
            {currentFolder && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-white font-semibold">{currentFolder.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {currentFolder ? currentFolder.name : categoryFilter !== 'all' ? `${categoryFilter.toUpperCase()} Storage` : 'File Storage & Manager'}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* New Folder */}
          <button
            onClick={() => setNewFolderOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/40 text-xs font-semibold text-slate-200 transition-all shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-indigo-400" />
            <span>New Folder</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => onOpenUpload(currentFolderId)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Filter, Search & View Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl glass-panel bg-slate-900/40 border border-white/5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter files by name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Category Tabs */}
          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-white/5 text-xs">
            {['all', 'images', 'videos', 'documents'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Menu */}
          <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-xl border border-white/5 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
              aria-label="Sort files by"
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="date" className="bg-slate-900">Date</option>
              <option value="name" className="bg-slate-900">Name</option>
              <option value="size" className="bg-slate-900">Size</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-1 text-[11px] font-mono text-cyan-400 uppercase"
              title="Toggle sort direction"
            >
              {sortOrder}
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-white/5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Folders Section (Only on root or nested) */}
      {categoryFilter === 'all' && currentFolderId === null && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Folders ({folders.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {folders.map((folder) => {
              const fileCount = files.filter(f => !f.is_trash && f.folder_id === folder.id).length;
              return (
                <div
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="p-4 rounded-2xl glass-panel-interactive cursor-pointer flex items-center justify-between border-white/5 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div 
                      className="p-2.5 rounded-xl shrink-0" 
                      style={{ backgroundColor: `${folder.color || '#6366f1'}20`, color: folder.color || '#6366f1' }}
                    >
                      <Folder className="w-5 h-5 fill-current" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {folder.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {fileCount} item{fileCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Files Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Files ({filteredFiles.length})
          </h3>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="rounded-3xl glass-panel bg-slate-900/30 border border-white/5 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <Folder className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-white">No files in this folder</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Drag and drop files here, or click the upload button to store your first document or media file.
            </p>
            <button
              onClick={() => onOpenUpload(currentFolderId)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Upload Your First File
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group relative rounded-2xl glass-panel-interactive border-white/5 overflow-hidden flex flex-col justify-between cursor-pointer"
                onClick={() => onPreviewFile(file)}
              >
                {/* Thumbnail / Preview Area */}
                <div className="relative aspect-video w-full bg-slate-950/60 overflow-hidden flex items-center justify-center">
                  {file.thumbnail ? (
                    <img
                      src={file.thumbnail}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="p-4">{getFileIcon(file.file_type)}</div>
                  )}

                  {/* Favorite star pill */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteFile(file.id);
                    }}
                    className={`absolute top-2 left-2 p-1.5 rounded-lg backdrop-blur-md transition-all ${
                      file.favorite
                        ? 'bg-amber-500/30 text-amber-300'
                        : 'bg-black/40 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${file.favorite ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Info & Actions */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                    <span>{(file.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                    <span className="capitalize">{file.file_type}</span>
                  </div>

                  {/* Card Action Bar */}
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setRenameTarget(file);
                        setRenameValue(file.name);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyFile(file.id)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Duplicate / Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setMoveTarget(file);
                        setMoveDestination(file.folder_id || null);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Move to Folder"
                    >
                      <MoveRight className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={file.url}
                      download={file.name}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="rounded-2xl glass-panel bg-slate-900/40 border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                  <th className="p-3 pl-4">Name</th>
                  <th className="p-3 hidden sm:table-cell">Type</th>
                  <th className="p-3 hidden md:table-cell">Size</th>
                  <th className="p-3 hidden lg:table-cell">Uploaded Date</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    onClick={() => onPreviewFile(file)}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
                          {getFileIcon(file.file_type)}
                        </div>
                        <span className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate max-w-xs sm:max-w-md">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell capitalize font-mono text-slate-400">
                      {file.file_type}
                    </td>
                    <td className="p-3 font-mono text-slate-400 hidden md:table-cell">
                      {(file.file_size / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px] hidden lg:table-cell">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleFavoriteFile(file.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            file.favorite ? 'text-amber-400' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${file.favorite ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => {
                            setRenameTarget(file);
                            setRenameValue(file.name);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white"
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <a
                          href={file.url}
                          download={file.name}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-300"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
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
                placeholder="Folder name"
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

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl glass-panel bg-[#0d1322] border border-white/10 shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2">Rename File</h3>
            <form onSubmit={handleRename} className="space-y-4">
              <input
                type="text"
                autoFocus
                required
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRenameTarget(null)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move File Modal */}
      {moveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl glass-panel bg-[#0d1322] border border-white/10 shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Move "{moveTarget.name}"</h3>
            <p className="text-xs text-slate-400 mb-4">Select destination folder:</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto mb-4">
              <button
                type="button"
                onClick={() => setMoveDestination(null)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                  moveDestination === null
                    ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/40'
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Root (All Files)</span>
                {moveDestination === null && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setMoveDestination(f.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                    moveDestination === f.id
                      ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/40'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>📁 {f.name}</span>
                  {moveDestination === f.id && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMoveTarget(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMove}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Move Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
