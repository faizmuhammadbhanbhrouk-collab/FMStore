import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  ExternalLink, 
  Plus, 
  Search, 
  Trash2, 
  Star, 
  Edit3, 
  RefreshCw, 
  Check, 
  ShieldAlert, 
  Sparkles,
  Timer
} from 'lucide-react';
import { 
  getVaultItems, 
  saveVaultItem, 
  deleteVaultItem, 
  toggleFavoriteVaultItem, 
  subscribeToStore 
} from '../services/storage';
import { 
  encryptVaultPassword, 
  decryptVaultPassword, 
  generateSecurePassword, 
  evaluatePasswordStrength 
} from '../services/crypto';
import { VaultItem, VaultCategory } from '../types';

const CATEGORIES: Array<{ id: VaultCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All Entries' },
  { id: 'work', label: 'Work & Code' },
  { id: 'email', label: 'Email Accounts' },
  { id: 'banking', label: 'Banking & Finance' },
  { id: 'social', label: 'Social Networks' },
  { id: 'shopping', label: 'E-Commerce' },
  { id: 'security', label: 'Keys & Crypto' },
];

export const PasswordVault: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState('master123'); // Default demo master pass
  const [masterInput, setMasterInput] = useState('');
  const [lockError, setLockError] = useState<string | null>(null);

  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<VaultCategory | 'all'>('all');

  // Revealed passwords map: { [itemId]: plainPassword }
  const [revealed, setRevealed] = useState<{ [id: string]: string }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [itemPassword, setItemPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [itemCategory, setItemCategory] = useState<VaultCategory>('social');
  const [showItemPassword, setShowItemPassword] = useState(false);

  // Auto-lock countdown
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  const refreshVault = () => {
    setVaultItems(getVaultItems());
  };

  useEffect(() => {
    refreshVault();
    const unsub = subscribeToStore(refreshVault);
    return unsub;
  }, []);

  // Timer countdown for auto-lock
  useEffect(() => {
    if (!isUnlocked) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsUnlocked(false);
          setRevealed({});
          return 900;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setLockError(null);
    if (!masterInput) return;
    // Accept demo master pass or any 6+ char master key
    if (masterInput.length < 4) {
      setLockError('Master passphrase too short.');
      return;
    }
    setMasterPassword(masterInput);
    setIsUnlocked(true);
    setMasterInput('');
    setTimeLeft(900);
  };

  const handleLockNow = () => {
    setIsUnlocked(false);
    setRevealed({});
    setTimeLeft(900);
  };

  const toggleReveal = async (item: VaultItem) => {
    if (revealed[item.id]) {
      const copy = { ...revealed };
      delete copy[item.id];
      setRevealed(copy);
    } else {
      try {
        const plain = await decryptVaultPassword(item.encrypted_password, masterPassword);
        setRevealed(prev => ({ ...prev, [item.id]: plain }));
        // Auto-hide after 20 seconds
        setTimeout(() => {
          setRevealed(prev => {
            const next = { ...prev };
            delete next[item.id];
            return next;
          });
        }, 20000);
      } catch {
        alert('Failed to decrypt. Master password mismatch.');
      }
    }
  };

  const copyPasswordToClipboard = async (item: VaultItem) => {
    try {
      let plain = revealed[item.id];
      if (!plain) {
        plain = await decryptVaultPassword(item.encrypted_password, masterPassword);
      }
      await navigator.clipboard.writeText(plain);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 3000);
    } catch {
      alert('Unable to copy password.');
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setWebsite('');
    setUsername('');
    setItemPassword(generateSecurePassword({ length: 16 }));
    setUrl('');
    setNotes('');
    setItemCategory('social');
    setModalOpen(true);
  };

  const handleOpenEdit = async (item: VaultItem) => {
    setEditingItem(item);
    setWebsite(item.website);
    setUsername(item.username);
    const plain = await decryptVaultPassword(item.encrypted_password, masterPassword);
    setItemPassword(plain);
    setUrl(item.url || '');
    setNotes(item.notes || '');
    setItemCategory(item.category);
    setModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!website || !username || !itemPassword) return;

    const encrypted = await encryptVaultPassword(itemPassword, masterPassword);

    saveVaultItem({
      id: editingItem?.id,
      website,
      username,
      encrypted_password: encrypted,
      url,
      notes,
      category: itemCategory,
    });

    setModalOpen(false);
  };

  const filteredItems = vaultItems.filter(v => {
    if (v.is_trash) return false;
    if (category !== 'all' && v.category !== category) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return v.website.toLowerCase().includes(q) || v.username.toLowerCase().includes(q) || v.notes?.toLowerCase().includes(q);
    }
    return true;
  });

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const strength = evaluatePasswordStrength(itemPassword);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              AES-256 GCM Zero-Knowledge
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Secure Password Vault
          </h1>
          <p className="text-xs text-slate-400">
            Hardware-grade cryptographic safe for enterprise passwords, credentials, and tokens
          </p>
        </div>

        {isUnlocked && (
          <div className="flex items-center gap-2">
            {/* Auto-lock countdown badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono text-cyan-400">
              <Timer className="w-3.5 h-3.5" />
              <span>Lock in {formatTimer(timeLeft)}</span>
            </div>

            <button
              onClick={handleLockNow}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Now</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Credential</span>
            </button>
          </div>
        )}
      </div>

      {/* Locked Vault Stage */}
      {!isUnlocked ? (
        <div className="rounded-3xl glass-panel bg-gradient-to-b from-[#0e1424] to-[#080b11] border border-violet-500/20 p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4 shadow-xl shadow-violet-950/50">
            <Lock className="w-10 h-10" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Vault is Encrypted & Locked
          </h2>
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-6">
            Enter your Master Passphrase to derive the AES-GCM 256-bit encryption key and decrypt stored credentials locally in browser memory.
          </p>

          <form onSubmit={handleUnlock} className="w-full max-w-sm space-y-3">
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={masterInput}
                onChange={(e) => setMasterInput(e.target.value)}
                placeholder="Enter Master Password (e.g. master123)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500 focus:border-violet-500"
              />
            </div>

            {lockError && (
              <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {lockError}
              </p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-violet-600/30 transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Password Vault</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-500 font-mono mt-4">
            Default Demo Master Key: <span className="text-cyan-400">master123</span>
          </p>
        </div>
      ) : (
        /* Unlocked Vault Grid */
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="p-3 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search websites or usernames..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors ${
                    category === cat.id
                      ? 'bg-violet-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-800/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredItems.length === 0 ? (
            <div className="rounded-3xl glass-panel bg-slate-900/30 border border-white/5 p-16 text-center flex flex-col items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-slate-600 mb-2" />
              <p className="text-base font-bold text-white">No vault items found</p>
              <p className="text-xs text-slate-400 mt-1">Save your first credential using the button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const isRevealed = Boolean(revealed[item.id]);
                const isCopied = copiedId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl glass-panel-interactive border-white/5 flex flex-col justify-between space-y-4"
                  >
                    {/* Top Row: Website & Fav */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold font-mono text-sm uppercase">
                          {item.website.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white truncate max-w-[170px]">
                            {item.website}
                          </h4>
                          <span className="text-[10px] text-cyan-400 font-mono capitalize">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavoriteVaultItem(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.favorite ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${item.favorite ? 'fill-amber-400' : ''}`} />
                        </button>
                        {item.url && (
                          <a
                            href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white"
                            title="Open Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Middle: Username & Password display */}
                    <div className="space-y-2 p-3 rounded-2xl bg-slate-950/50 border border-white/5">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">
                          Username / Email
                        </span>
                        <span className="text-xs text-slate-200 font-mono select-all">
                          {item.username}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">
                          Encrypted Password
                        </span>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span className="text-xs font-mono text-slate-200 tracking-wider">
                            {isRevealed ? revealed[item.id] : '••••••••••••••••'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleReveal(item)}
                              className="p-1 text-slate-400 hover:text-white"
                              title={isRevealed ? 'Hide' : 'Reveal for 20s'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => copyPasswordToClipboard(item)}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Copy password"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-1">
                        "{item.notes}"
                      </p>
                    )}

                    {/* Bottom Actions */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Updated {new Date(item.updated_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteVaultItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          title="Move to Trash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Credential Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel bg-[#0d1322] border border-white/10 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-4">
              {editingItem ? 'Edit Credential' : 'Save Encrypted Credential'}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Service / Website</label>
                  <input
                    type="text"
                    required
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. GitHub, Netflix"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as VaultCategory)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-slate-900"
                  >
                    <option value="social">Social</option>
                    <option value="email">Email</option>
                    <option value="banking">Banking</option>
                    <option value="work">Work</option>
                    <option value="shopping">Shopping</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Username / Email</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="faiz@fmstore.io"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setItemPassword(generateSecurePassword({ length: 18 }))}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Secure</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showItemPassword ? 'text' : 'password'}
                    required
                    value={itemPassword}
                    onChange={(e) => setItemPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl glass-input text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowItemPassword(!showItemPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showItemPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {itemPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-1 rounded-full transition-all duration-300"
                        style={{
                          width: `${(strength.score / 4) * 100}%`,
                          backgroundColor: strength.color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Login URL (Optional)</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Recovery Codes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Backup keys, PINs or security questions..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-600/30"
                >
                  Encrypt & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
