import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  AlertCircle, 
  Folder, 
  CheckCircle2,
  File
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { uploadFile, getFolders } from '../../services/storage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFolderId?: string | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  defaultFolderId = null,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(defaultFolderId);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const folders = getFolders();

  const handleFiles = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setError(null);
    setUploading(true);
    setProgress(10);

    const completed: string[] = [];

    try {
      for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i];
        
        // File validation (e.g. max 500MB per file for client safety)
        if (file.size > 500 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 500MB upload limit.`);
        }

        await uploadFile(file, selectedFolder, (p) => {
          const overall = Math.round(((i + p / 100) / filesList.length) * 100);
          setProgress(overall);
        });

        completed.push(file.name);
      }

      setUploadedFiles(completed);
      setProgress(100);

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#6366f1', '#a855f7'],
      });

      setTimeout(() => {
        setUploading(false);
        setUploadedFiles([]);
        setProgress(0);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setUploading(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Upload failed. Please try again.');
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      {/* Click outside backdrop */}
      <div className="fixed inset-0 -z-10" onClick={uploading ? undefined : onClose} />

      <div className="w-full max-w-lg rounded-3xl glass-panel bg-[#0d1322] border border-white/10 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload to Cloud Storage</h3>
              <p className="text-xs text-slate-400">Secure end-to-end encrypted storage</p>
            </div>
          </div>
          {!uploading && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Folder Destination Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Target Folder
          </label>
          <div className="relative">
            <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedFolder || ''}
              onChange={(e) => setSelectedFolder(e.target.value ? e.target.value : null)}
              disabled={uploading}
              aria-label="Target Folder"
              className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs text-white bg-slate-900/80 cursor-pointer"
            >
              <option value="">Root Directory (My Files)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dropzone Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
              : 'border-white/10 hover:border-indigo-500/50 hover:bg-slate-900/40 bg-slate-900/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            aria-label="Upload files"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 shadow-lg group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-sm font-semibold text-white">
            Click to browse or drag and drop files
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supports High-res Photos, 4K Videos, PDF, Office Docs, Archives & Audio
          </p>
        </div>

        {/* Upload Progress Bar Indicator */}
        {uploading && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-cyan-400 animate-bounce" />
                Encrypting and uploading payload...
              </span>
              <span className="font-mono text-cyan-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Completed list */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Uploaded {uploadedFiles.length} file(s) successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
};
