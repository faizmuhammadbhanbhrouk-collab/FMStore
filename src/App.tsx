import React, { useState, useEffect } from 'react';
import { UserProfile, FileItem } from './types';
import { getCurrentUser, subscribeToStore, initStore } from './services/storage';

// Layout & Common Components
import { Background3D } from './components/common/Background3D';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthScreen } from './components/auth/AuthScreen';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { UploadModal } from './components/files/UploadModal';
import { FilePreviewModal } from './components/files/FilePreviewModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { FileManager } from './pages/FileManager';
import { ImageGallery } from './pages/ImageGallery';
import { VideoLibrary } from './pages/VideoLibrary';
import { NotesPage } from './pages/NotesPage';
import { MessagesPage } from './pages/MessagesPage';
import { PasswordVault } from './pages/PasswordVault';
import { FavoritesPage } from './pages/FavoritesPage';
import { TrashPage } from './pages/TrashPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    initStore();
    return getCurrentUser();
  });

  // Theme Mode: Default to Light Theme
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('fm_theme_mode');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Default to Light theme
  });

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('fm_theme_mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
  };

  // URL Hash or Path Routing
  const getInitialRoute = () => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const path = window.location.pathname.replace(/^\//, '');
    const route = hash || path || 'dashboard';
    const valid = [
      'dashboard', 'files', 'images', 'videos', 'documents',
      'notes', 'messages', 'vault', 'favorites', 'trash',
      'profile', 'settings'
    ];
    return valid.includes(route) ? route : 'dashboard';
  };

  const [activeRoute, setActiveRoute] = useState<string>(getInitialRoute);

  // Modals & Panels
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFolderId, setUploadFolderId] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Sync user state and store changes
  useEffect(() => {
    const update = () => {
      setUser(getCurrentUser());
    };
    const unsub = subscribeToStore(update);
    return unsub;
  }, []);

  // Listen for browser popstate / back button
  useEffect(() => {
    const handlePopState = () => {
      setActiveRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: string) => {
    setActiveRoute(route);
    window.history.pushState(null, '', `#/${route}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenUpload = (folderId: string | null = null) => {
    setUploadFolderId(folderId);
    setUploadModalOpen(true);
  };

  // If not authenticated, render 3D Login screen
  if (!user) {
    return (
      <div className={themeMode === 'light' ? 'light' : 'dark'}>
        <AuthScreen
          onSuccess={() => {
            setUser(getCurrentUser());
            navigateTo('dashboard');
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans relative selection:bg-indigo-500/30 selection:text-indigo-600 transition-colors duration-300 ${
      themeMode === 'light' ? 'light bg-[#f8fafc] text-slate-800' : 'dark bg-[#080b11] text-slate-100'
    }`}>
      {/* Interactive 3D Canvas Background */}
      <Background3D themeMode={themeMode} />

      {/* Top Navbar */}
      <Navbar
        user={user}
        activeRoute={activeRoute}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        onNavigate={navigateTo}
        onOpenUpload={() => handleOpenUpload(null)}
        onOpenSearch={() => setSearchModalOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onLockVault={() => navigateTo('vault')}
      />

      {/* Main Workspace Layout (Sidebar + Content Stage) */}
      <div className="flex-1 flex w-full relative z-10">
        {/* Persistent Collapsible Sidebar */}
        <Sidebar
          activeRoute={activeRoute}
          onNavigate={navigateTo}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {activeRoute === 'dashboard' && (
            <Dashboard
              onNavigate={navigateTo}
              onOpenUpload={() => handleOpenUpload(null)}
              onPreviewFile={(f) => setPreviewFile(f)}
            />
          )}

          {activeRoute === 'files' && (
            <FileManager
              onOpenUpload={handleOpenUpload}
              onPreviewFile={(f) => setPreviewFile(f)}
              filterCategory="all"
            />
          )}

          {activeRoute === 'images' && (
            <ImageGallery onOpenUpload={() => handleOpenUpload(null)} />
          )}

          {activeRoute === 'videos' && (
            <VideoLibrary onOpenUpload={() => handleOpenUpload(null)} />
          )}

          {activeRoute === 'documents' && (
            <FileManager
              onOpenUpload={handleOpenUpload}
              onPreviewFile={(f) => setPreviewFile(f)}
              filterCategory="documents"
            />
          )}

          {activeRoute === 'notes' && <NotesPage />}

          {activeRoute === 'messages' && <MessagesPage />}

          {activeRoute === 'vault' && <PasswordVault />}

          {activeRoute === 'favorites' && (
            <FavoritesPage
              onNavigate={navigateTo}
              onPreviewFile={(f) => setPreviewFile(f)}
            />
          )}

          {activeRoute === 'trash' && <TrashPage />}

          {activeRoute === 'profile' && <ProfilePage user={user} />}

          {activeRoute === 'settings' && (
            <SettingsPage 
              user={user} 
              themeMode={themeMode}
              onSetThemeMode={(mode) => setThemeMode(mode)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={navigateTo}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={[]}
      />

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        defaultFolderId={uploadFolderId}
      />

      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}

export default App;
