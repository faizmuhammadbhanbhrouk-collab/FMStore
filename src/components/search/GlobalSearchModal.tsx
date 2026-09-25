import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  FileText, 
  Image, 
  Video, 
  StickyNote, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  CornerDownLeft 
} from 'lucide-react';
import { getFiles, getNotes, getMessages, getVaultItems } from '../../services/storage';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'files' | 'media' | 'notes' | 'vault' | 'messages'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fm_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global keydown handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('fm_recent_searches', JSON.stringify(updated));
  };

  // Perform multi-entity search
  const q = query.toLowerCase().trim();

  const files = getFiles();
  const notes = getNotes();
  const messages = getMessages();
  const vault = getVaultItems();

  const matchingFiles = q
    ? files.filter(f => f.name.toLowerCase().includes(q) || f.file_type.toLowerCase().includes(q))
    : [];

  const matchingNotes = q
    ? notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q)))
    : [];

  const matchingMessages = q
    ? messages.filter(m => m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q))
    : [];

  const matchingVault = q
    ? vault.filter(v => v.website.toLowerCase().includes(q) || v.username.toLowerCase().includes(q) || v.category.toLowerCase().includes(q))
    : [];

  const handleSelectResult = (route: string, id?: string) => {
    if (query) saveRecentSearch(query);
    onNavigate(route, id);
    onClose();
  };

  const totalResults = matchingFiles.length + matchingNotes.length + matchingMessages.length + matchingVault.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fade-in">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="w-full max-w-2xl rounded-2xl glass-panel bg-[#0d1322] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-indigo-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across files, media, notes, credentials..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 overflow-x-auto text-xs font-medium">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'files', label: 'Files & Docs' },
            { id: 'media', label: 'Images & Videos' },
            { id: 'notes', label: 'Notes' },
            { id: 'vault', label: 'Password Vault' },
            { id: 'messages', label: 'Messages' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-indigo-600/40 text-cyan-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Results / Suggestion Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query ? (
            /* Empty Query State: Recent Searches & Suggestions */
            <div className="space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Recent Searches
                    </span>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem('fm_recent_searches');
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-400 lowercase font-normal"
                    >
                      clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuery(s)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 text-xs text-slate-300 hover:text-white transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  Quick Navigation
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'All Files', route: 'files', icon: FileText, color: 'text-cyan-400' },
                    { label: 'Gallery', route: 'images', icon: Image, color: 'text-indigo-400' },
                    { label: 'Notes', route: 'notes', icon: StickyNote, color: 'text-emerald-400' },
                    { label: 'Vault', route: 'vault', icon: ShieldCheck, color: 'text-violet-400' },
                  ].map((quick) => {
                    const Icon = quick.icon;
                    return (
                      <button
                        key={quick.route}
                        onClick={() => handleSelectResult(quick.route)}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/40 text-left transition-all"
                      >
                        <Icon className={`w-4 h-4 ${quick.color}`} />
                        <span className="text-xs text-slate-300 font-medium">{quick.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : totalResults === 0 ? (
            /* No Results Found */
            <div className="text-center py-10">
              <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No matching items found</p>
              <p className="text-xs text-slate-500 mt-1">Try searching with a different term or keyword</p>
            </div>
          ) : (
            /* Results listing */
            <div className="space-y-4">
              {/* Files */}
              {(activeFilter === 'all' || activeFilter === 'files' || activeFilter === 'media') &&
                matchingFiles.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                      Files ({matchingFiles.length})
                    </h4>
                    <div className="space-y-1">
                      {matchingFiles.map((file) => (
                        <button
                          key={file.id}
                          onClick={() =>
                            handleSelectResult(
                              file.file_type === 'image'
                                ? 'images'
                                : file.file_type === 'video'
                                ? 'videos'
                                : 'files',
                              file.id
                            )
                          }
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-white/5 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                              {file.file_type === 'image' ? (
                                <Image className="w-4 h-4" />
                              ) : file.file_type === 'video' ? (
                                <Video className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {(file.file_size / (1024 * 1024)).toFixed(2)} MB • {file.file_type}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Notes */}
              {(activeFilter === 'all' || activeFilter === 'notes') && matchingNotes.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                    Notes ({matchingNotes.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingNotes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => handleSelectResult('notes', note.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-white/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <StickyNote className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 transition-colors">
                              {note.title}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate max-w-sm">
                              {note.content.substring(0, 60)}...
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vault Items */}
              {(activeFilter === 'all' || activeFilter === 'vault') && matchingVault.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                    Password Vault ({matchingVault.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingVault.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectResult('vault', item.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-white/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-200 group-hover:text-violet-300 transition-colors">
                              {item.website}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {item.username} • {item.category}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {(activeFilter === 'all' || activeFilter === 'messages') && matchingMessages.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                    Messages ({matchingMessages.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingMessages.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => handleSelectResult('messages', msg.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-white/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                              {msg.title}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate max-w-sm">
                              {msg.content.substring(0, 60)}...
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-white/5 bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate using live search</span>
          <div className="flex items-center gap-1">
            <span>Press</span>
            <CornerDownLeft className="w-3 h-3 text-slate-400" />
            <span>to open</span>
          </div>
        </div>
      </div>
    </div>
  );
};
