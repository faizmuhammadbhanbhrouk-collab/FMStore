import React, { useState, useEffect } from 'react';
import { 
  StickyNote, 
  Plus, 
  Search, 
  Pin, 
  Star, 
  Trash2, 
  Tag, 
  Palette, 
  Check, 
  Clock, 
  Sparkles,
  Bold,
  Italic,
  Code,
  List,
  Quote,
  Eye,
  Edit3
} from 'lucide-react';
import { 
  getNotes, 
  saveNote, 
  deleteNote, 
  toggleFavoriteNote, 
  togglePinNote, 
  subscribeToStore 
} from '../services/storage';
import { NoteItem } from '../types';

const COLOR_PALETTE = [
  { name: 'Indigo Glow', hex: '#6366f1' },
  { name: 'Cyber Cyan', hex: '#06b6d4' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Electric Violet', hex: '#8b5cf6' },
  { name: 'Warm Amber', hex: '#f59e0b' },
  { name: 'Neon Rose', hex: '#f43f5e' },
  { name: 'Slate Dark', hex: '#1e293b' },
];

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [autosaveStatus, setAutosaveStatus] = useState<string>('All changes saved');
  const [previewMode, setPreviewMode] = useState(false);

  const refreshNotes = () => {
    const list = getNotes();
    setNotes(list);
    if (!selectedNote && list.length > 0) {
      setSelectedNote(list[0]);
    } else if (selectedNote) {
      const updatedCurrent = list.find(n => n.id === selectedNote.id);
      if (updatedCurrent) setSelectedNote(updatedCurrent);
    }
  };

  useEffect(() => {
    refreshNotes();
    const unsub = subscribeToStore(refreshNotes);
    return unsub;
  }, []);

  // Collect all unique tags
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));

  // Filter notes
  const filteredNotes = notes.filter(n => {
    if (n.is_trash) return false;
    if (selectedTag && !n.tags.includes(selectedTag)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const regularNotes = filteredNotes.filter(n => !n.pinned);

  const handleCreateNote = () => {
    const newNote = saveNote({
      title: 'Untitled Document',
      content: '',
      tags: selectedTag ? [selectedTag] : ['Notes'],
      color: '#6366f1',
      pinned: false,
      favorite: false,
    });
    setSelectedNote(newNote);
  };

  const handleUpdate = (field: keyof NoteItem, value: unknown) => {
    if (!selectedNote) return;
    setAutosaveStatus('Saving...');
    const updated = saveNote({
      ...selectedNote,
      [field]: value,
    });
    setSelectedNote(updated);
    setTimeout(() => {
      setAutosaveStatus('All changes saved');
    }, 400);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && selectedNote) {
      e.preventDefault();
      const tag = tagInput.trim();
      if (!selectedNote.tags.includes(tag)) {
        handleUpdate('tags', [...selectedNote.tags, tag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedNote) return;
    handleUpdate('tags', selectedNote.tags.filter(t => t !== tagToRemove));
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!selectedNote) return;
    const textarea = document.getElementById('note-editor-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedNote.content;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    handleUpdate('content', newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 50);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Encrypted Markdown
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Productivity & Personal Notes
          </h1>
          <p className="text-xs text-slate-400">
            Rich markdown documents, ideas, meeting memos, and code snippets
          </p>
        </div>

        <button
          onClick={handleCreateNote}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-amber-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Notes List Column */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          {/* Search & Tag Filter Bar */}
          <div className="p-3 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes or tags..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
              />
            </div>

            {/* Tag Pills */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-2.5 py-0.5 rounded-lg whitespace-nowrap transition-colors ${
                    selectedTag === null
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold'
                      : 'text-slate-400 hover:text-white bg-slate-800/40'
                  }`}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2.5 py-0.5 rounded-lg whitespace-nowrap transition-colors ${
                      selectedTag === tag
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold'
                        : 'text-slate-400 hover:text-white bg-slate-800/40'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes Cards Stream */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[580px] pr-1">
            {/* Pinned section */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1 pl-1">
                  <Pin className="w-3 h-3 text-cyan-400" /> Pinned Notes
                </span>
                {pinnedNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    style={{ borderLeftColor: note.color || '#6366f1' }}
                    className={`p-3.5 rounded-2xl border-l-4 transition-all cursor-pointer relative group ${
                      selectedNote?.id === note.id
                        ? 'bg-indigo-950/40 border border-indigo-500/40 shadow-md'
                        : 'glass-panel bg-slate-900/40 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white truncate flex-1">
                        {note.title || 'Untitled Note'}
                      </h4>
                      <Pin className="w-3.5 h-3.5 text-cyan-400 shrink-0 fill-cyan-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {note.content || 'Empty document...'}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                      <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                      <div className="flex gap-1">
                        {note.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="text-cyan-400">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Regular Notes */}
            <div className="space-y-1.5 pt-1">
              {pinnedNotes.length > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono pl-1">
                  Other Notes
                </span>
              )}
              {regularNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  style={{ borderLeftColor: note.color || '#6366f1' }}
                  className={`p-3.5 rounded-2xl border-l-4 transition-all cursor-pointer relative group ${
                    selectedNote?.id === note.id
                      ? 'bg-indigo-950/40 border border-indigo-500/40 shadow-md'
                      : 'glass-panel bg-slate-900/40 border border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate flex-1">
                      {note.title || 'Untitled Note'}
                    </h4>
                    {note.favorite && (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {note.content || 'Empty document...'}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                    <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-cyan-400">#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Note Editor Stage */}
        <div className="lg:col-span-8 rounded-3xl glass-panel bg-slate-900/50 border border-white/10 p-6 flex flex-col justify-between shadow-2xl">
          {selectedNote ? (
            <div className="flex flex-col h-full space-y-4">
              {/* Editor Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePinNote(selectedNote.id)}
                    className={`p-1.5 rounded-xl border border-white/5 transition-colors ${
                      selectedNote.pinned ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                    }`}
                    title={selectedNote.pinned ? 'Unpin' : 'Pin to top'}
                  >
                    <Pin className={`w-4 h-4 ${selectedNote.pinned ? 'fill-cyan-300' : ''}`} />
                  </button>
                  <button
                    onClick={() => toggleFavoriteNote(selectedNote.id)}
                    className={`p-1.5 rounded-xl border border-white/5 transition-colors ${
                      selectedNote.favorite ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                    }`}
                    title={selectedNote.favorite ? 'Unfavorite' : 'Favorite'}
                  >
                    <Star className={`w-4 h-4 ${selectedNote.favorite ? 'fill-amber-300' : ''}`} />
                  </button>

                  {/* Note Color Dropdown/Pills */}
                  <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-white/5">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => handleUpdate('color', c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={`w-3.5 h-3.5 rounded-full transition-transform ${
                          selectedNote.color === c.hex ? 'scale-125 ring-2 ring-white/60' : 'opacity-80 hover:opacity-100'
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Autosave feedback badge */}
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{autosaveStatus}</span>
                  </span>

                  {/* Markdown Preview Toggle */}
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                      previewMode
                        ? 'bg-indigo-600/30 text-cyan-300 border-indigo-500/40'
                        : 'border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{previewMode ? 'Edit' : 'Preview'}</span>
                  </button>

                  <button
                    onClick={() => deleteNote(selectedNote.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Move to Trash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title input */}
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => handleUpdate('title', e.target.value)}
                placeholder="Note Title..."
                className="w-full bg-transparent text-xl sm:text-2xl font-black text-white focus:outline-none placeholder-slate-600"
              />

              {/* Tags Section */}
              <div className="flex flex-wrap items-center gap-1.5 py-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {selectedNote.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-cyan-300 text-xs font-mono flex items-center gap-1 border border-indigo-500/30"
                  >
                    #{t}
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-300 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ tag (press Enter)"
                  className="bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none w-32"
                />
              </div>

              {/* Markdown Toolbar */}
              {!previewMode && (
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-white/5 overflow-x-auto">
                  <button
                    onClick={() => insertMarkdown('**', '**')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('*', '*')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('`', '`')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Inline Code"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('- ')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertMarkdown('> ')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Blockquote"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Editor Textarea / Markdown Preview */}
              <div className="flex-1 min-h-[300px] flex flex-col">
                {previewMode ? (
                  <div className="flex-1 p-4 rounded-2xl bg-slate-950/60 border border-white/5 overflow-y-auto text-sm text-slate-200 prose prose-invert max-w-none whitespace-pre-wrap font-sans">
                    {selectedNote.content || <span className="text-slate-500 italic">No content to preview</span>}
                  </div>
                ) : (
                  <textarea
                    id="note-editor-textarea"
                    value={selectedNote.content}
                    onChange={(e) => handleUpdate('content', e.target.value)}
                    placeholder="Start typing your thoughts, markdown notes, documentation, code, or checklists..."
                    className="flex-1 w-full bg-slate-950/40 p-4 rounded-2xl border border-white/5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 resize-none font-mono leading-relaxed"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <StickyNote className="w-12 h-12 mb-2 opacity-40" />
              <p className="text-sm font-semibold text-slate-300">No Note Selected</p>
              <p className="text-xs text-slate-500 mt-1">Select a note from the left or create a new one.</p>
              <button
                onClick={handleCreateNote}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30"
              >
                Create Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
