import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Upload, 
  Settings, 
  LogOut, 
  User, 
  ShieldCheck, 
  Menu, 
  Lock,
  Sun,
  Moon
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { UserProfile, NotificationItem } from '../../types';
import { getNotifications, signOut } from '../../services/storage';

interface NavbarProps {
  user: UserProfile;
  activeRoute: string;
  themeMode?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onNavigate: (route: string) => void;
  onOpenUpload: () => void;
  onOpenSearch: () => void;
  onToggleMobileSidebar: () => void;
  onOpenNotifications: () => void;
  onLockVault?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeRoute: _activeRoute,
  themeMode = 'light',
  onToggleTheme,
  onNavigate,
  onOpenUpload,
  onOpenSearch,
  onToggleMobileSidebar,
  onOpenNotifications,
  onLockVault,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setNotifications(getNotifications());
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass-panel border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#080b11]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center hover:opacity-90 transition-opacity"
        >
          <Logo size="md" showText={true} />
        </button>
      </div>

      {/* Center: Global Search trigger button */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl glass-input bg-slate-100/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs hover:border-indigo-500/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors" />
            <span>Search files, notes, credentials & messages...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500 dark:text-slate-400 shadow-xs">
            <span>Ctrl</span><span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 md:hidden transition-colors"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Quick Upload Button */}
        <button
          type="button"
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* Theme Toggle Button (Light / Dark) */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 hover:border-indigo-400/50 transition-all duration-200 shadow-xs group"
            title={themeMode === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            aria-label="Toggle Theme"
          >
            {themeMode === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform" />
            )}
          </button>
        )}

        {/* Notifications Icon with Badge */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 dark:bg-cyan-500 text-[10px] font-bold text-white dark:text-slate-950 ring-2 ring-white dark:ring-[#080b11]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-slate-200/80 dark:border-white/10 hover:border-indigo-500/40 bg-slate-100/70 dark:bg-slate-900/60 transition-all duration-200 shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <span className="text-white text-xs font-bold font-mono">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
              {user.name}
            </span>
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setProfileDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel bg-white/95 dark:bg-[#0d1320] border border-slate-200 dark:border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-200/80 dark:border-white/5 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Vault Active</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  {onToggleTheme && (
                    <button
                      onClick={() => {
                        onToggleTheme();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        {themeMode === 'light' ? (
                          <Sun className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Moon className="w-4 h-4 text-indigo-400" />
                        )}
                        <span>Theme Mode</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                        {themeMode}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>User Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                    <span>System Settings</span>
                  </button>

                  {onLockVault && (
                    <button
                      onClick={() => {
                        onLockVault();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-600 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors text-left"
                    >
                      <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      <span>Lock Password Vault</span>
                    </button>
                  )}

                  <div className="border-t border-slate-200/80 dark:border-white/5 my-1" />

                  <button
                    onClick={async () => {
                      setProfileDropdownOpen(false);
                      await signOut();
                      window.location.reload();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
