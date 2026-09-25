import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Search, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  Trash2, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Edit2, 
  Info, 
  Sparkles,
  RotateCw
} from 'lucide-react';
import { getFiles, deleteFile, toggleFavoriteFile, renameFile, subscribeToStore } from '../services/storage';
import { FileItem } from '../types';

interface ImageGalleryProps {
  onOpenUpload: () => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ onOpenUpload }) => {
  const [images, setImages] = useState<FileItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [showMetadata, setShowMetadata] = useState(false);
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const refreshImages = () => {
    const all = getFiles({ category: 'images' });
    setImages(all);
  };

  useEffect(() => {
    refreshImages();
    const unsub = subscribeToStore(refreshImages);
    return unsub;
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') closeLightbox();
      if (e.key === '+') handleZoomIn();
      if (e.key === '-') handleZoomOut();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  const openLightbox = (index: number) => {
    setActiveLightboxIndex(index);
    setZoomLevel(1);
    setRotation(0);
  };

  const closeLightbox = () => {
    setActiveLightboxIndex(null);
    setZoomLevel(1);
    setRotation(0);
    setShowMetadata(false);
  };

  const handleNext = () => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((activeLightboxIndex + 1) % filteredImages.length);
    setZoomLevel(1);
    setRotation(0);
  };

  const handlePrev = () => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((activeLightboxIndex - 1 + filteredImages.length) % filteredImages.length);
    setZoomLevel(1);
    setRotation(0);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.3, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const currentImage = activeLightboxIndex !== null ? filteredImages[activeLightboxIndex] : null;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Media Stream
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Visual Media Gallery
          </h1>
          <p className="text-xs text-slate-400">
            High-resolution photographs, renders, assets, and graphics
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images by filename..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
          />
        </div>
        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {filteredImages.length === 0 ? (
        <div className="rounded-3xl glass-panel bg-slate-900/30 border border-white/5 p-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
            <ImageIcon className="w-8 h-8" />
          </div>
          <p className="text-base font-bold text-white">No images yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Upload your favorite photos, wallpapers, and design assets to organize your personal gallery.
          </p>
          <button
            onClick={onOpenUpload}
            className="mt-5 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all"
          >
            Upload Your First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((img, index) => (
            <div
              key={img.id}
              onClick={() => openLightbox(index)}
              className="group relative rounded-2xl glass-panel-interactive border-white/5 overflow-hidden aspect-[4/3] cursor-pointer"
            >
              <img
                src={img.url}
                alt={img.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                <div className="flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteFile(img.id);
                    }}
                    className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                      img.favorite
                        ? 'bg-amber-500/30 text-amber-300'
                        : 'bg-black/40 text-white hover:text-amber-300'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${img.favorite ? 'fill-amber-400' : ''}`} />
                  </button>

                  <div className="p-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-white truncate drop-shadow-md">
                    {img.name}
                  </p>
                  <p className="text-[10px] text-cyan-300 font-mono mt-0.5">
                    {(img.file_size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activeLightboxIndex !== null && currentImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl select-none animate-fade-in">
          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 h-16 px-6 flex items-center justify-between border-b border-white/10 z-20 bg-slate-950/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {activeLightboxIndex + 1} / {filteredImages.length}
              </span>
              <span className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                {currentImage.name}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Rotate 90deg"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className={`p-2 rounded-xl transition-colors ${
                  showMetadata ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Details"
              >
                <Info className="w-4 h-4" />
              </button>
              <a
                href={currentImage.url}
                download={currentImage.name}
                className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => {
                  deleteFile(currentImage.id);
                  if (filteredImages.length <= 1) {
                    closeLightbox();
                  } else {
                    handleNext();
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Move to Trash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button
                onClick={closeLightbox}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Previous Button */}
          {filteredImages.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-2xl glass-panel bg-black/40 hover:bg-black/80 text-white border-white/10 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {filteredImages.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-2xl glass-panel bg-black/40 hover:bg-black/80 text-white border-white/10 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Main Stage Image */}
          <div className="relative max-w-[85vw] max-h-[80vh] flex items-center justify-center overflow-hidden transition-transform duration-200">
            <img
              src={currentImage.url}
              alt={currentImage.name}
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-out',
              }}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl drop-shadow-2xl"
            />
          </div>

          {/* Metadata Inspector Drawer */}
          {showMetadata && (
            <div className="absolute right-6 bottom-6 w-80 rounded-2xl glass-panel bg-[#0d1322]/90 border border-white/10 p-5 shadow-2xl z-30 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Asset Metadata
                </h4>
                <button
                  onClick={() => setShowMetadata(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">File Name</span>
                  <span className="text-slate-200 font-semibold break-all">{currentImage.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">File Size</span>
                  <span className="text-slate-200 font-mono">
                    {(currentImage.file_size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Dimensions</span>
                  <span className="text-slate-200 font-mono">
                    {currentImage.dimensions ? `${currentImage.dimensions.width} x ${currentImage.dimensions.height} px` : 'High Definition'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Upload Date</span>
                  <span className="text-slate-200 font-mono">
                    {new Date(currentImage.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
