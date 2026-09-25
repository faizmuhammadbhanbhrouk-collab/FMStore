import React from 'react';
import { 
  X, 
  CheckCheck, 
  Trash2, 
  UploadCloud, 
  ShieldAlert, 
  HardDrive, 
  Bell, 
  Sparkles,
  Check
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { markNotificationAsRead, markAllNotificationsAsRead, clearNotifications } from '../../services/storage';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'upload':
        return <UploadCloud className="w-4 h-4 text-cyan-400" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-violet-400" />;
      case 'storage':
        return <HardDrive className="w-4 h-4 text-amber-400" />;
      case 'trash':
        return <Trash2 className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  const formatTime = (iso: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm glass-panel bg-[#0d1322] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Notification Center</h3>
              {notifications.some(n => !n.read) && (
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                  {notifications.filter(n => !n.read).length} new
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-b border-white/5 bg-slate-900/40 flex items-center justify-between text-xs">
              <button
                onClick={() => markAllNotificationsAsRead()}
                className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
              <button
                onClick={() => clearNotifications()}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold text-slate-400">All caught up!</p>
                <p className="text-[11px] mt-1">No system alerts or notifications.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markNotificationAsRead(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                    item.read
                      ? 'bg-slate-900/30 border-white/5 text-slate-400'
                      : 'bg-indigo-950/20 border-indigo-500/30 text-slate-200 shadow-sm'
                  }`}
                >
                  {!item.read && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                  )}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-800/80 shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 pr-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                      </div>
                      <p className="text-xs mt-0.5 line-clamp-2">{item.message}</p>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                        {formatTime(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
