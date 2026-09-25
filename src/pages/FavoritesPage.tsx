import React, { useState, useEffect } from 'react';
import { 
  Star, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  StickyNote, 
  Mail, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { 
  getFiles, 
  getNotes, 
  getMessages, 
  getVaultItems, 
  toggleFavoriteFile, 
  toggleFavoriteNote, 
  toggleFavoriteMessage, 
  toggleFavoriteVaultItem,
  subscribeToStore 
} from '../services/storage';
import { FileItem, NoteItem, MessageItem, VaultItem } from '../types';

interface FavoritesPageProps {
  onNavigate: (route: string, itemId?: string) => void;
  onPreviewFile?: (file: FileItem) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigate, onPreviewFile }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'files' | 'notes' | 'messages' | 'vault'>('all');
  const [favFiles, setFavFiles] = useState<FileItem[]>([]);
  const [favNotes, setFavNotes] = useState<NoteItem[]>([]);
  const [favMessages, setFavMessages] = useState<MessageItem[]>([]);
  const [favVault, setFavVault] = useState<VaultItem[]>([]);

  const refresh = () => {
    setFavFiles(getFiles({ favoritesOnly: true }));
    setFavNotes(getNotes({ favoritesOnly: true }));
    setFavMessages(getMessages({ favoritesOnly: true }));
    setFavVault(getVaultItems({ favoritesOnly: true }));
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(refresh);
    return unsub;
  }, []);

  const totalFavs = favFiles.length + favNotes.length + favMessages.length + favVault.length;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Starred Workspace
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Pinned & Favorite Items
          </h1>
          <p className="text-xs text-slate-400">
            Unified access to your most critical files, media, notes, and credentials
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/5 self-start sm:self-auto">
          {totalFavs} starred item{totalFavs !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 overflow-x-auto text-xs">
        {[
          { id: 'all', label: 'All Items', count: totalFavs },
          { id: 'files', label: 'Files & Media', count: favFiles.length },
          { id: 'notes', label: 'Notes', count: favNotes.length },
          { id: 'messages', label: 'Messages', count: favMessages.length },
          { id: 'vault', label: 'Vault', count: favVault.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-400 font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {totalFavs === 0 ? (
        <div className="rounded-3xl glass-panel bg-slate-900/30 border border-white/5 p-16 text-center flex flex-col items-center justify-center">
          <Star className="w-12 h-12 text-slate-600 mb-2" />
          <p className="text-base font-bold text-white">No favorites yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Click the star icon on any file, note, message, or vault item to pin it here for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Favorite Files Section */}
          {(activeTab === 'all' || activeTab === 'files') && favFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Files & Media ({favFiles.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => onPreviewFile ? onPreviewFile(file) : onNavigate('files')}
                    className="p-3.5 rounded-2xl glass-panel-interactive border-white/5 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 shrink-0">
                        {file.file_type === 'image' ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : file.file_type === 'video' ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {(file.file_size / (1024 * 1024)).toFixed(1)} MB • {file.file_type}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteFile(file.id);
                      }}
                      className="p-1.5 rounded-lg text-amber-400 hover:text-slate-400"
                    >
                      <Star className="w-4 h-4 fill-amber-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Notes Section */}
          {(activeTab === 'all' || activeTab === 'notes') && favNotes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-amber-400" /> Notes ({favNotes.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => onNavigate('notes', note.id)}
                    className="p-3.5 rounded-2xl glass-panel-interactive border-white/5 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="overflow-hidden pr-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {note.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {note.content}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteNote(note.id);
                      }}
                      className="p-1.5 rounded-lg text-amber-400 hover:text-slate-400 shrink-0"
                    >
                      <Star className="w-4 h-4 fill-amber-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Messages Section */}
          {(activeTab === 'all' || activeTab === 'messages') && favMessages.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> Messages ({favMessages.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => onNavigate('messages', msg.id)}
                    className="p-3.5 rounded-2xl glass-panel-interactive border-white/5 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="overflow-hidden pr-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {msg.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        From: {msg.sender}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMessage(msg.id);
                      }}
                      className="p-1.5 rounded-lg text-amber-400 hover:text-slate-400 shrink-0"
                    >
                      <Star className="w-4 h-4 fill-amber-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Vault Items Section */}
          {(activeTab === 'all' || activeTab === 'vault') && favVault.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" /> Password Vault ({favVault.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favVault.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate('vault', item.id)}
                    className="p-3.5 rounded-2xl glass-panel-interactive border-white/5 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="overflow-hidden pr-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                        {item.website}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {item.username} • {item.category}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteVaultItem(item.id);
                      }}
                      className="p-1.5 rounded-lg text-amber-400 hover:text-slate-400 shrink-0"
                    >
                      <Star className="w-4 h-4 fill-amber-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
