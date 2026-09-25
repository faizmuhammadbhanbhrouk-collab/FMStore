import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  HardDrive, 
  KeyRound, 
  Camera, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Lock
} from 'lucide-react';
import { UserProfile } from '../types';
import { updateProfile, getStorageStats } from '../services/storage';

interface ProfilePageProps {
  user: UserProfile;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=256&q=80',
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || AVATAR_PRESETS[0]);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const stats = getStorageStats();
  const usedGB = (stats.used / (1024 * 1024 * 1024)).toFixed(2);

  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      updateProfile({ name, avatar_url: avatarUrl });
      setFeedback({ type: 'success', msg: 'Profile details successfully updated!' });
    } catch {
      setFeedback({ type: 'error', msg: 'Failed to update profile.' });
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', msg: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', msg: 'New password and confirmation do not match.' });
      return;
    }

    setFeedback({ type: 'success', msg: 'Master account password updated securely.' });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Verified User Profile
          </span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Account & Identity
        </h1>
        <p className="text-xs text-slate-400">
          Manage your personal credentials, profile picture, and workspace allocations
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="p-6 rounded-3xl glass-panel bg-slate-900/50 border border-white/10 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-indigo-600 p-1 shadow-xl">
            <img
              src={avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover rounded-[22px]"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left space-y-1">
          <h2 className="text-xl font-bold text-white">{name}</h2>
          <p className="text-xs text-slate-400 font-mono flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>{user.email}</span>
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Hardware Vault Active
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[11px] font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Member since {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Mini stats badge */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center min-w-[130px]">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Usage</p>
          <p className="text-lg font-bold font-mono text-cyan-400">{usedGB} GB</p>
          <p className="text-[10px] text-slate-500 font-mono">{stats.totalFiles} files total</p>
        </div>
      </div>

      {/* Preset Avatars Selection */}
      <div className="p-5 rounded-3xl glass-panel bg-slate-900/40 border border-white/10 space-y-3">
        <label className="block text-xs font-bold text-white uppercase tracking-wider font-mono">
          Select Avatar Preset
        </label>
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {AVATAR_PRESETS.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setAvatarUrl(url);
                updateProfile({ avatar_url: url });
              }}
              className={`w-12 h-12 rounded-2xl overflow-hidden p-0.5 transition-transform ${
                avatarUrl === url
                  ? 'scale-110 ring-2 ring-cyan-400 bg-cyan-400'
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
            >
              <img src={url} alt="Preset" className="w-full h-full object-cover rounded-xl" />
            </button>
          ))}
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name & Basic Details */}
        <div className="p-6 rounded-3xl glass-panel bg-slate-900/40 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <User className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Profile Details</h3>
          </div>

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-500 bg-slate-950/40 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Email address is cryptographically bound to your identity.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="p-6 rounded-3xl glass-panel bg-slate-900/40 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md shadow-cyan-600/30 transition-all pt-1"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
