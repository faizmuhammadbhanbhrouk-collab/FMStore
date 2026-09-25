import React from 'react';
import { 
  X, 
  Download, 
  Star, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  HardDrive, 
  ExternalLink,
  Calendar,
  Layers
} from 'lucide-react';
import { FileItem } from '../../types';
import { toggleFavoriteFile, deleteFile } from '../../services/storage';

interface FilePreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="w-full max-w-2xl rounded-3xl glass-panel bg-[#0d1322] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-cyan-400 shrink-0">
              {file.file_type === 'image' ? (
                <ImageIcon className="w-5 h-5" />
              ) : file.file_type === 'video' ? (
                <Video className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                {file.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {(file.file_size / (1024 * 1024)).toFixed(2)} MB • {file.file_type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleFavoriteFile(file.id)}
              className={`p-2 rounded-xl border border-white/5 transition-colors ${
                file.favorite ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-white'
              }`}
              title="Favorite"
            >
              <Star className={`w-4 h-4 ${file.favorite ? 'fill-amber-400' : ''}`} />
            </button>
            <a
              href={file.url}
              download={file.name}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 border border-white/5 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                deleteFile(file.id);
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-slate-950/80 p-4 sm:p-6 flex items-center justify-center min-h-[260px] overflow-hidden">
          {file.file_type === 'image' ? (
            <img
              src={file.url}
              alt={file.name}
              className="max-h-[50vh] max-w-full object-contain rounded-xl shadow-xl"
            />
          ) : file.file_type === 'video' ? (
            <video
              src={file.url}
              controls
              className="max-h-[50vh] max-w-full rounded-xl shadow-xl"
            />
          ) : (
            <div className="text-center p-8">
              <FileText className="w-16 h-16 text-indigo-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-white">{file.name}</p>
              <p className="text-xs text-slate-400 mt-1">
                Document preview ready. Click Download to open with your local application.
              </p>
              <a
                href={file.url}
                download={file.name}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer Details */}
        <div className="p-4 border-t border-white/5 bg-slate-900/50 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Uploaded: {new Date(file.created_at).toLocaleString()}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
            Path: {file.file_path}
          </span>
        </div>
      </div>
    </div>
  );
};
