import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  Archive, 
  Star, 
  Trash2, 
  Search, 
  Plus, 
  User, 
  Clock, 
  CornerDownRight, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  getMessages, 
  saveMessage, 
  deleteMessage, 
  toggleFavoriteMessage, 
  subscribeToStore 
} from '../services/storage';
import { MessageItem } from '../types';

export const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [search, setSearch] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);

  // New message form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [newFolder, setNewFolder] = useState<'inbox' | 'sent' | 'archive'>('inbox');

  const refreshMessages = () => {
    const list = getMessages({ folder: activeFolder });
    setMessages(list);
    if (!selectedMessage && list.length > 0) {
      setSelectedMessage(list[0]);
    } else if (selectedMessage) {
      const match = list.find(m => m.id === selectedMessage.id);
      if (match) setSelectedMessage(match);
    }
  };

  useEffect(() => {
    refreshMessages();
    const unsub = subscribeToStore(refreshMessages);
    return unsub;
  }, [activeFolder]);

  const filtered = messages.filter(m => {
    if (m.is_trash) return false;
    if (activeFolder === 'starred' && !m.favorite) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) || m.sender.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created = saveMessage({
      title: newTitle.trim(),
      content: newContent.trim(),
      recipient: newRecipient.trim() || 'Personal Archive',
      folder: newFolder,
    });

    setNewTitle('');
    setNewContent('');
    setNewRecipient('');
    setComposeOpen(false);
    setSelectedMessage(created);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Personal Comms
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Messages & Memos
          </h1>
          <p className="text-xs text-slate-400">
            Secure internal communication logs, encrypted drafts, and personal correspondence
          </p>
        </div>

        <button
          onClick={() => setComposeOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-cyan-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Compose Memo</span>
        </button>
      </div>

      {/* Main Mailbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Folder Nav & Message List */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          {/* Folder Pills */}
          <div className="p-1 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 flex items-center justify-between gap-1 text-xs">
            {[
              { id: 'inbox', label: 'Inbox', icon: Inbox },
              { id: 'starred', label: 'Starred', icon: Star },
              { id: 'sent', label: 'Sent', icon: Send },
              { id: 'archive', label: 'Archive', icon: Archive },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFolder(f.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                    activeFolder === f.id
                      ? 'bg-indigo-600 text-white font-semibold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px] pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500 glass-panel rounded-2xl p-6">
                <Mail className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold text-slate-400">No messages in {activeFolder}</p>
              </div>
            ) : (
              filtered.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer relative ${
                    selectedMessage?.id === msg.id
                      ? 'bg-indigo-950/50 border border-indigo-500/40 shadow-lg'
                      : 'glass-panel bg-slate-900/40 border border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white truncate max-w-[180px]">
                      {msg.sender}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-300 truncate">
                    {msg.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {msg.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Message Reader Stage */}
        <div className="lg:col-span-7 rounded-3xl glass-panel bg-slate-900/50 border border-white/10 p-6 flex flex-col justify-between shadow-2xl">
          {selectedMessage ? (
            <div className="flex flex-col h-full space-y-4">
              {/* Header Action Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-cyan-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedMessage.sender}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      To: {selectedMessage.recipient || 'Personal Storage'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleFavoriteMessage(selectedMessage.id)}
                    className={`p-2 rounded-xl border border-white/5 transition-colors ${
                      selectedMessage.favorite ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${selectedMessage.favorite ? 'fill-amber-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Move to Trash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Subject & Timestamp */}
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {selectedMessage.title}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedMessage.folder}</span>
                </div>
              </div>

              {/* Message Content Body */}
              <div className="flex-1 p-5 rounded-2xl bg-slate-950/40 border border-white/5 overflow-y-auto text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedMessage.content}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <Mail className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm font-semibold text-slate-300">No message selected</p>
              <p className="text-xs text-slate-500 mt-1">Select a message from the list or compose a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Message Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel bg-[#0d1322] border border-white/10 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white mb-4">Compose Memo / Message</h3>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Subject title..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient</label>
                  <input
                    type="text"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    placeholder="Recipient or folder..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Folder</label>
                  <select
                    value={newFolder}
                    onChange={(e) => setNewFolder(e.target.value as 'inbox' | 'sent' | 'archive')}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-slate-900"
                  >
                    <option value="inbox">Inbox</option>
                    <option value="sent">Sent</option>
                    <option value="archive">Archive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Body</label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Type your secure message content..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setComposeOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 shadow-md shadow-cyan-600/30"
                >
                  Save & Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
