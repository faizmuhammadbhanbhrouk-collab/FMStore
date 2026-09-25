import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Palette, 
  Bell, 
  Database, 
  HardDrive, 
  Lock, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile } from '../types';
import { updateProfile, getStorageStats } from '../services/storage';
import { isSupabaseConfigured, updateSupabaseConfig } from '../services/supabase';

interface SettingsPageProps {
  user: UserProfile;
  themeMode?: 'light' | 'dark';
  onSetThemeMode?: (mode: 'light' | 'dark') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, themeMode = 'light', onSetThemeMode }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'appearance' | 'notifications' | 'supabase' | 'storage'>('security');

  // Security
  const [autoLockTimeout, setAutoLockTimeout] = useState(user.vault_lock_timeout || 15);
  const [twoFactor, setTwoFactor] = useState(Boolean(user.two_factor_enabled));

  // Appearance
  const [themeAccent, setThemeAccent] = useState<'cyan' | 'indigo' | 'violet' | 'emerald'>(user.theme_accent || 'indigo');

  // Notifications
  const [notifUpload, setNotifUpload] = useState(true);
  const [notifSecurity, setNotifSecurity] = useState(true);
  const [notifStorage, setNotifStorage] = useState(true);

  // Supabase Cloud Config
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('fm_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('fm_supabase_anon_key') || '');
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<string | null>(null);

  const stats = getStorageStats();
  const usedGB = (stats.used / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (stats.total / (1024 * 1024 * 1024)).toFixed(0);

  const handleSaveSecurity = () => {
    updateProfile({
      vault_lock_timeout: autoLockTimeout,
      two_factor_enabled: twoFactor,
    });
    setFeedback('Security preferences updated.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveAppearance = (accent: 'cyan' | 'indigo' | 'violet' | 'emerald') => {
    setThemeAccent(accent);
    updateProfile({ theme_accent: accent });
    setFeedback(`Theme accent changed to ${accent}.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
    setSupabaseStatus('Credentials saved! Refreshing connectivity...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleExportData = () => {
    const backup = {
      user,
      files: localStorage.getItem('fm_files_v1'),
      notes: localStorage.getItem('fm_notes_v1'),
      messages: localStorage.getItem('fm_messages_v1'),
      vault: localStorage.getItem('fm_vault_v1'),
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FM_Store_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            System Control
          </span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Preferences & System Settings
        </h1>
        <p className="text-xs text-slate-400">
          Configure hardware-grade encryption timeouts, UI themes, and cloud synchronization
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 overflow-x-auto text-xs">
        {[
          { id: 'security', label: 'Security & Vault', icon: ShieldCheck },
          { id: 'appearance', label: 'Appearance', icon: Palette },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'supabase', label: 'Supabase Sync', icon: Database },
          { id: 'storage', label: 'Data & Backup', icon: HardDrive },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Security & Vault */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel bg-slate-900/40 border border-white/10 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Password Vault Auto-Lock</h3>
              <p className="text-xs text-slate-400">
                To prevent unauthorized access, the vault locks automatically after a period of user inactivity.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { minutes: 1, label: '1 Minute' },
                { minutes: 5, label: '5 Minutes' },
                { minutes: 15, label: '15 Minutes (Default)' },
                { minutes: 30, label: '30 Minutes' },
              ].map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => setAutoLockTimeout(opt.minutes)}
                  className={`p-3 rounded-2xl border text-xs font-semibold transition-all ${
                    autoLockTimeout === opt.minutes
                      ? 'bg-indigo-600/30 text-cyan-300 border-indigo-500/50 shadow-md'
                      : 'bg-slate-900/50 text-slate-400 border-white/5 hover:border-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</h4>
                <p className="text-[11px] text-slate-400">
                  Require TOTP authentication code when logging in from new devices.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
              </label>
            </div>

            <button
              onClick={handleSaveSecurity}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              Save Security Rules
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Appearance */}
      {activeTab === 'appearance' && (
        <div className="p-6 rounded-3xl glass-panel bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Theme Mode</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your preferred visual presentation style.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                onSetThemeMode?.('light');
                updateProfile({ theme_mode: 'light' });
                setFeedback('Theme changed to Light Theme.');
                setTimeout(() => setFeedback(null), 3000);
              }}
              className={`p-5 rounded-2xl glass-panel-interactive flex items-center gap-4 text-left transition-all ${
                themeMode === 'light'
                  ? 'border-2 border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-md shadow-indigo-500/10'
                  : 'border border-slate-200/80 dark:border-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
                <Sun className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Light Theme</span>
                  {themeMode === 'light' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold">Active</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Clean, bright, high-contrast modern interface with soft glass accents
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onSetThemeMode?.('dark');
                updateProfile({ theme_mode: 'dark' });
                setFeedback('Theme changed to Dark Theme.');
                setTimeout(() => setFeedback(null), 3000);
              }}
              className={`p-5 rounded-2xl glass-panel-interactive flex items-center gap-4 text-left transition-all ${
                themeMode === 'dark'
                  ? 'border-2 border-indigo-500 bg-indigo-950/40 shadow-md shadow-indigo-500/10'
                  : 'border border-slate-200/80 dark:border-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-800 flex items-center justify-center text-white shadow-md">
                <Moon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Dark Theme</span>
                  {themeMode === 'dark' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold">Active</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sleek cyber-grade dark mode with vibrant glowing particle nodes
                </p>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200/80 dark:border-white/5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Cyber Accent Themes</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Personalize your FM_Store interface with futuristic glow colors.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'cyan', label: 'Cyber Cyan', border: 'border-cyan-500', color: 'from-cyan-500 to-blue-600' },
                { id: 'indigo', label: 'Neon Indigo', border: 'border-indigo-500', color: 'from-indigo-500 to-purple-600' },
                { id: 'violet', label: 'Electric Violet', border: 'border-violet-500', color: 'from-violet-500 to-fuchsia-600' },
                { id: 'emerald', label: 'Matrix Emerald', border: 'border-emerald-500', color: 'from-emerald-500 to-teal-600' },
              ].map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => handleSaveAppearance(theme.id as typeof themeAccent)}
                  className={`p-4 rounded-2xl glass-panel-interactive cursor-pointer flex flex-col items-center text-center space-y-2.5 ${
                    themeAccent === theme.id ? `border-2 ${theme.border} bg-slate-100 dark:bg-slate-800/80` : 'border border-slate-200/80 dark:border-white/5'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${theme.color} shadow-lg`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{theme.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-3xl glass-panel bg-slate-900/40 border border-white/10 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Notification Preferences</h3>
            <p className="text-xs text-slate-400">
              Control when system alerts and desktop notifications appear.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <p className="text-xs font-bold text-white">Upload Completion Alerts</p>
                <p className="text-[11px] text-slate-400">Receive toasts when files finish encrypting & uploading.</p>
              </div>
              <input
                type="checkbox"
                checked={notifUpload}
                onChange={(e) => setNotifUpload(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <p className="text-xs font-bold text-white">Security & Login Alerts</p>
                <p className="text-[11px] text-slate-400">Notify upon new device sessions or password modifications.</p>
              </div>
              <input
                type="checkbox"
                checked={notifSecurity}
                onChange={(e) => setNotifSecurity(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Storage Threshold Warnings</p>
                <p className="text-[11px] text-slate-400">Alert when remaining cloud storage drops below 15%.</p>
              </div>
              <input
                type="checkbox"
                checked={notifStorage}
                onChange={(e) => setNotifStorage(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Supabase Sync */}
      {activeTab === 'supabase' && (
        <div className="p-6 rounded-3xl glass-panel bg-slate-900/40 border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Supabase Cloud Sync</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect your personal Supabase project for live multi-device synchronization.
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1 ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isSupabaseConfigured ? 'Connected to Cloud' : 'Local-First Resilient Mode'}
            </span>
          </div>

          <form onSubmit={handleSaveSupabase} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white font-mono"
              />
            </div>

            {supabaseStatus && (
              <p className="text-xs text-emerald-400 font-medium">{supabaseStatus}</p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all"
              >
                Save & Connect Supabase
              </button>
              {isSupabaseConfigured && (
                <button
                  type="button"
                  onClick={() => {
                    updateSupabaseConfig('', '');
                    window.location.reload();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-all"
                >
                  Disconnect (Use Local)
                </button>
              )}
            </div>
          </form>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-300">⚡ Setup Guide:</p>
            <p>1. Open your Supabase Dashboard and run the generated <code className="text-cyan-400">supabase-schema.sql</code> script in the SQL Editor.</p>
            <p>2. Copy your Project URL & Anon Key from Project Settings &gt; API.</p>
          </div>
        </div>
      )}

      {/* Tab 5: Storage & Data Backup */}
      {activeTab === 'storage' && (
        <div className="p-6 rounded-3xl glass-panel bg-slate-900/40 border border-white/10 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Data Sovereignty & Export</h3>
            <p className="text-xs text-slate-400">
              Your data belongs entirely to you. Download a complete JSON snapshot anytime.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Full JSON Archive</p>
              <p className="text-[11px] text-slate-400">
                Includes all file records, notes, memos, and encrypted vault entries.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-cyan-600/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup</span>
            </button>
          </div>

          {/* Allocation card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-white">Cloud Allocation</span>
              <span className="font-mono text-cyan-400">{usedGB} GB of {totalGB} GB</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full"
                style={{ width: `${Math.min(100, Math.round((stats.used / stats.total) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
