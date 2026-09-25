import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  FileText, 
  StickyNote, 
  Mail, 
  ShieldCheck, 
  Clock,
  ShieldAlert
} from 'lucide-react';
import { 
  getTrashItems, 
  restoreTrashItem, 
  permanentDeleteTrashItem, 
  emptyTrash, 
  subscribeToStore,
  UnifiedTrashItem 
} from '../services/storage';

export const TrashPage: React.FC = () => {
  const [trashItems, setTrashItems] = useState<UnifiedTrashItem[]>([]);
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UnifiedTrashItem | null>(null);

  const refresh = () => {
    setTrashItems(getTrashItems());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(refresh);
    return unsub;
  }, []);

  const handleRestore = async (item: UnifiedTrashItem) => {
    await restoreTrashItem(item.type, item.id);
  };

  const handlePermanentDelete = async () => {
    if (deleteTarget) {
      await permanentDeleteTrashItem(deleteTarget.type, deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleEmptyAll = async () => {
    await emptyTrash();
    setConfirmEmptyOpen(false);
  };

  const getIcon = (type: UnifiedTrashItem['type']) => {
    switch (type) {
      case 'file': return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'note': return <StickyNote className="w-4 h-4 text-amber-400" />;
      case 'message': return <Mail className="w-4 h-4 text-indigo-400" />;
      case 'vault': return <ShieldCheck className="w-4 h-4 text-violet-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" />
              Recycle Bin
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Recently Deleted Items
          </h1>
          <p className="text-xs text-slate-400">
            Recover accidentally deleted items or purge them permanently from hardware storage
          </p>
        </div>

        {trashItems.length > 0 && (
          <button
            onClick={() => setConfirmEmptyOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Recycle Bin</span>
          </button>
        )}
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-2xl glass-panel bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200">
          <p className="font-semibold">Items stored here are isolated from your active workspace.</p>
          <p className="text-amber-300/80 mt-0.5">
            You can restore any item back to its original location, or purge it permanently to free up allocated storage quota.
          </p>
        </div>
      </div>

      {/* Items Table / Cards */}
      {trashItems.length === 0 ? (
        <div className="rounded-3xl glass-panel bg-slate-900/30 border border-white/5 p-16 text-center flex flex-col items-center justify-center">
          <Trash2 className="w-12 h-12 text-slate-600 mb-2" />
          <p className="text-base font-bold text-white">Recycle Bin is empty</p>
          <p className="text-xs text-slate-400 mt-1">Deleted items will appear here before permanent purging.</p>
        </div>
      ) : (
        <div className="rounded-2xl glass-panel bg-slate-900/40 border border-white/10 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="p-3 pl-4">Item Name</th>
                <th className="p-3 hidden sm:table-cell">Type</th>
                <th className="p-3 hidden md:table-cell">Details</th>
                <th className="p-3 hidden lg:table-cell">Deleted At</th>
                <th className="p-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trashItems.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-800 shrink-0">
                        {getIcon(item.type)}
                      </div>
                      <span className="font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 hidden sm:table-cell font-mono capitalize text-slate-400">
                    {item.type}
                  </td>
                  <td className="p-3 hidden md:table-cell text-slate-400 font-mono text-[11px]">
                    {item.detail}
                  </td>
                  <td className="p-3 hidden lg:table-cell text-slate-400 font-mono text-[11px]">
                    {new Date(item.deleted_at).toLocaleString()}
                  </td>
                  <td className="p-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleRestore(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
                        title="Restore Item"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                        title="Permanent Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal: Single Item Permanent Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl glass-panel bg-[#0d1322] border border-rose-500/30 shadow-2xl p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Permanently Delete Item?</h3>
            <p className="text-xs text-slate-400 mb-5">
              "{deleteTarget.name}" will be erased permanently from storage. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDelete}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/30"
              >
                Yes, Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Empty All Trash */}
      {confirmEmptyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl glass-panel bg-[#0d1322] border border-rose-500/30 shadow-2xl p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Empty Entire Recycle Bin?</h3>
            <p className="text-xs text-slate-400 mb-5">
              All {trashItems.length} items currently in the recycle bin will be permanently purged from database and file records.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmEmptyOpen(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyAll}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/30"
              >
                Purge All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
