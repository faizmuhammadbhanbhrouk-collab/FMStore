import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Image, 
  Video, 
  FileText, 
  StickyNote, 
  Mail, 
  ShieldCheck, 
  Star, 
  Trash2, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  HardDrive,
  X
} from 'lucide-react';
import { getStorageStats, getTrashItems, subscribeToStore } from '../../services/storage';

interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRoute,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState(getStorageStats());
  const [trashCount, setTrashCount] = useState(0);

  useEffect(() => {
    const update = () => {
      setStats(getStorageStats());
      setTrashCount(getTrashItems().length);
    };
    update();
    const unsub = subscribeToStore(update);
    return unsub;
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'files', label: 'My Files', icon: FolderKanban, badge: stats.totalFiles },
    { id: 'images', label: 'Images', icon: Image, badge: stats.totalImages },
    { id: 'videos', label: 'Videos', icon: Video, badge: stats.totalVideos },
    { id: 'documents', label: 'Documents', icon: FileText, badge: stats.totalDocs },
    { id: 'notes', label: 'Notes', icon: StickyNote, badge: stats.totalNotes },
    { id: 'messages', label: 'Messages', icon: Mail, badge: null },
    { id: 'vault', label: 'Password Vault', icon: ShieldCheck, badge: 'AES' },
    { id: 'favorites', label: 'Favorites', icon: Star, badge: null },
    { id: 'trash', label: 'Recently Deleted', icon: Trash2, badge: trashCount > 0 ? trashCount : null, danger: true },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  const usedPercent = Math.min(100, Math.round((stats.used / stats.total) * 100));
  const usedGB = (stats.used / (1024 * 1024 * 1024)).toFixed(2);

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-4 select-none">
      {/* Navigation List */}
      <div className="space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile();
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-600/30 dark:to-cyan-600/10 text-indigo-700 dark:text-white border border-indigo-200 dark:border-indigo-500/40 shadow-sm dark:shadow-md dark:shadow-indigo-600/10 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-indigo-600 dark:bg-cyan-400 shadow-sm shadow-indigo-300 dark:shadow-cyan-300" />
              )}
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-cyan-400'
                    : item.danger && trashCount > 0
                    ? 'text-rose-500 dark:text-rose-400'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
                }`}
              />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        item.danger
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                          : isActive
                          ? 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-cyan-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Storage Meter at Sidebar Footer */}
      <div className="px-3 pt-3 border-t border-slate-200/80 dark:border-white/5">
        {!collapsed ? (
          <div className="p-3 rounded-2xl glass-panel bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                <HardDrive className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>Cloud Storage</span>
              </div>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-cyan-400 font-bold">{usedPercent}%</span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, usedPercent)}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">
              <span>{usedGB} GB</span>
              <span>15.00 GB</span>
            </div>
          </div>
        ) : (
          <div 
            className="flex justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 text-indigo-600 dark:text-cyan-400 cursor-pointer"
            title={`${usedGB} GB of 15 GB used`}
            onClick={() => setCollapsed(false)}
          >
            <HardDrive className="w-4 h-4" />
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex justify-end mt-2">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] glass-panel border-r border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#080b11]/70 backdrop-blur-xl transition-all duration-300 z-20 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" 
            onClick={onCloseMobile} 
          />

          {/* Slide-out Menu */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0c111c] border-r border-slate-200/80 dark:border-white/10 p-2 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-250 z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Navigation
              </span>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
