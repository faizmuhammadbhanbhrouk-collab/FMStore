import { 
  FileItem, 
  FolderItem, 
  NoteItem, 
  MessageItem, 
  VaultItem, 
  NotificationItem, 
  UserProfile, 
  StorageStats 
} from '../types';
import { 
  INITIAL_USER, 
  INITIAL_FOLDERS, 
  INITIAL_FILES, 
  INITIAL_NOTES, 
  INITIAL_MESSAGES, 
  INITIAL_VAULT_ITEMS, 
  INITIAL_NOTIFICATIONS 
} from './seedData';
import { saveFileBlob, getFileBlob, removeFileBlob } from './idb';
import { supabase, isSupabaseConfigured } from './supabase';

const KEYS = {
  USER: 'fm_current_user',
  FOLDERS: 'fm_folders_v1',
  FILES: 'fm_files_v1',
  NOTES: 'fm_notes_v1',
  MESSAGES: 'fm_messages_v1',
  VAULT: 'fm_vault_v1',
  NOTIFICATIONS: 'fm_notifications_v1',
  MASTER_PASS: 'fm_master_pass_hash',
};

// Helper for local storage parsing
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// Global event bus for reactive UI updates across components
type EventCallback = () => void;
const listeners = new Set<EventCallback>();

export function subscribeToStore(cb: EventCallback): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notifySubscribers() {
  listeners.forEach(cb => {
    try {
      cb();
    } catch (e) {
      console.error('Subscriber error:', e);
    }
  });
}

// Initialize seed data if empty
export function initStore() {
  if (!localStorage.getItem(KEYS.FOLDERS)) {
    setStored(KEYS.FOLDERS, INITIAL_FOLDERS);
  }
  if (!localStorage.getItem(KEYS.FILES)) {
    setStored(KEYS.FILES, INITIAL_FILES);
  }
  if (!localStorage.getItem(KEYS.NOTES)) {
    setStored(KEYS.NOTES, INITIAL_NOTES);
  }
  if (!localStorage.getItem(KEYS.MESSAGES)) {
    setStored(KEYS.MESSAGES, INITIAL_MESSAGES);
  }
  if (!localStorage.getItem(KEYS.VAULT)) {
    setStored(KEYS.VAULT, INITIAL_VAULT_ITEMS);
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    setStored(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
}

// -------------------------------------------------------------
// AUTHENTICATION
// -------------------------------------------------------------

export function getCurrentUser(): UserProfile | null {
  return getStored<UserProfile | null>(KEYS.USER, null);
}

export async function signUp(name: string, email: string, password: string): Promise<UserProfile> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) throw new Error(error.message);
    const user: UserProfile = {
      id: data.user?.id || 'usr_' + Date.now(),
      name: name || 'FM User',
      email,
      created_at: new Date().toISOString(),
      vault_lock_timeout: 15,
      theme_mode: 'light',
      theme_accent: 'indigo',
    };
    setStored(KEYS.USER, user);
    initStore();
    notifySubscribers();
    return user;
  }

  // Local-First Mock Registration
  const user: UserProfile = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name,
    email,
    created_at: new Date().toISOString(),
    vault_lock_timeout: 15,
    theme_mode: 'light',
    theme_accent: 'indigo',
  };
  setStored(KEYS.USER, user);
  initStore();
  addNotification('system', 'Account Created', `Welcome to FM_Store, ${name}!`);
  notifySubscribers();
  return user;
}

export async function signIn(email: string, password: string, _rememberMe: boolean = true): Promise<UserProfile> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    const user: UserProfile = {
      id: data.user.id,
      email: data.user.email || email,
      name: data.user.user_metadata?.name || email.split('@')[0],
      created_at: data.user.created_at || new Date().toISOString(),
      vault_lock_timeout: 15,
      theme_mode: 'light',
      theme_accent: 'indigo',
    };
    setStored(KEYS.USER, user);
    initStore();
    notifySubscribers();
    return user;
  }

  // Local-First Authentication: validates email format & non-empty password
  if (!email || !password) {
    throw new Error('Please enter both email and password.');
  }

  let user = getCurrentUser();
  if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
    user = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: email.split('@')[0].replace('.', ' '),
      email,
      created_at: new Date().toISOString(),
      vault_lock_timeout: 15,
      theme_mode: 'light',
      theme_accent: 'indigo',
    };
  }

  setStored(KEYS.USER, user);
  initStore();
  addNotification('security', 'New Login Detected', `Successful session established for ${user.email}`);
  notifySubscribers();
  return user;
}

export function quickDemoLogin(): UserProfile {
  setStored(KEYS.USER, INITIAL_USER);
  initStore();
  notifySubscribers();
  return INITIAL_USER;
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(KEYS.USER);
  notifySubscribers();
}

export function updateProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getCurrentUser();
  if (!current) throw new Error('No user logged in');
  const updated: UserProfile = { ...current, ...updates };
  setStored(KEYS.USER, updated);
  addNotification('system', 'Profile Updated', 'Your profile settings have been saved.');
  notifySubscribers();
  return updated;
}

// -------------------------------------------------------------
// FOLDERS
// -------------------------------------------------------------

export function getFolders(): FolderItem[] {
  return getStored<FolderItem[]>(KEYS.FOLDERS, INITIAL_FOLDERS);
}

export function createFolder(name: string, parentId?: string | null, color: string = '#6366f1'): FolderItem {
  const folders = getFolders();
  const newFolder: FolderItem = {
    id: 'fld_' + Date.now(),
    user_id: getCurrentUser()?.id || 'usr_local',
    name,
    parent_id: parentId || null,
    created_at: new Date().toISOString(),
    color,
  };
  setStored(KEYS.FOLDERS, [newFolder, ...folders]);
  addNotification('system', 'Folder Created', `Created folder "${name}"`);
  notifySubscribers();
  return newFolder;
}

// -------------------------------------------------------------
// FILES
// -------------------------------------------------------------

export function getFiles(options?: {
  folderId?: string | null;
  category?: string;
  favoritesOnly?: boolean;
  includeTrash?: boolean;
}): FileItem[] {
  const allFiles = getStored<FileItem[]>(KEYS.FILES, INITIAL_FILES);

  return allFiles.filter(file => {
    // Trash filter
    if (options?.includeTrash) {
      return Boolean(file.is_trash);
    }
    if (file.is_trash) return false;

    // Favorite filter
    if (options?.favoritesOnly && !file.favorite) return false;

    // Category filter
    if (options?.category && options.category !== 'all') {
      if (options.category === 'images' && file.file_type !== 'image') return false;
      if (options.category === 'videos' && file.file_type !== 'video') return false;
      if (options.category === 'documents' && file.file_type !== 'document') return false;
      if (options.category === 'audio' && file.file_type !== 'audio') return false;
      if (options.category === 'archive' && file.file_type !== 'archive') return false;
      if (options.category !== 'images' && options.category !== 'videos' && options.category !== 'documents' && options.category !== 'audio' && options.category !== 'archive') {
        if (file.file_type !== options.category) return false;
      }
    }

    // Folder filter (if specified)
    if (options?.folderId !== undefined) {
      if (options.folderId === null) {
        // Root files or all files depending on mode
      } else if (file.folder_id !== options.folderId) {
        return false;
      }
    }

    return true;
  });
}

function detectFileType(file: File): 'image' | 'video' | 'document' | 'audio' | 'archive' | 'other' {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (
    file.type.includes('pdf') ||
    file.type.includes('word') ||
    file.type.includes('document') ||
    file.type.includes('text') ||
    file.type.includes('sheet') ||
    file.name.endsWith('.pdf') ||
    file.name.endsWith('.docx') ||
    file.name.endsWith('.doc') ||
    file.name.endsWith('.txt') ||
    file.name.endsWith('.md')
  ) {
    return 'document';
  }
  if (
    file.name.endsWith('.zip') ||
    file.name.endsWith('.tar.gz') ||
    file.name.endsWith('.rar') ||
    file.name.endsWith('.7z')
  ) {
    return 'archive';
  }
  return 'other';
}

export async function uploadFile(
  file: File, 
  folderId?: string | null,
  onProgress?: (progress: number) => void
): Promise<FileItem> {
  const fileType = detectFileType(file);
  const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  
  // Progress simulation for realistic UX
  if (onProgress) {
    onProgress(15);
    await new Promise(r => setTimeout(r, 120));
    onProgress(50);
    await new Promise(r => setTimeout(r, 150));
    onProgress(85);
    await new Promise(r => setTimeout(r, 100));
  }

  // Create Object URL for preview and store in IndexedDB
  const objectUrl = URL.createObjectURL(file);
  await saveFileBlob(fileId, objectUrl, file);

  const newFile: FileItem = {
    id: fileId,
    user_id: getCurrentUser()?.id || 'usr_local',
    name: file.name,
    file_path: `/${fileType}s/${file.name}`,
    file_type: fileType,
    file_size: file.size,
    folder_id: folderId || null,
    favorite: false,
    is_trash: false,
    created_at: new Date().toISOString(),
    url: objectUrl,
    thumbnail: fileType === 'image' ? objectUrl : undefined,
  };

  const files = getStored<FileItem[]>(KEYS.FILES, INITIAL_FILES);
  setStored(KEYS.FILES, [newFile, ...files]);

  if (onProgress) onProgress(100);
  addNotification('upload', 'Upload Completed', `"${file.name}" was uploaded successfully.`);
  notifySubscribers();
  return newFile;
}

export function deleteFile(id: string): void {
  const files = getStored<FileItem[]>(KEYS.FILES, INITIAL_FILES);
  const target = files.find(f => f.id === id);
  const updated = files.map(f => {
    if (f.id === id) {
      return { ...f, is_trash: true, deleted_at: new Date().toISOString() };
    }
    return f;
  });
  setStored(KEYS.FILES, updated);
  if (target) {
    addNotification('trash', 'File Moved to Trash', `"${target.name}" was moved to Recently Deleted.`);
  }
  notifySubscribers();
}

export function restoreFile(id: string): void {
  const files = getStored<FileItem[]>(KEYS.FILES, INITIAL_FILES);
  const updated = files.map(f => {
    if (f.id === id) {
      return { ...f, is_trash: false, deleted_at: null };
    }
    return f;
  });
  setStored(KEYS.FILES, updated);
  notifySubscribers();
}

export async function permanentDeleteFile(id: string): Promise<void> {
  const files = getStored<FileItem[]>(KEYS.FILES, INITIAL_FILES);
  const updated = files.filter(f => f.id !== id);
  setStored(KEYS.FILES, updated);
  await removeFileBlob(id);
  notifySubscribers();
}

export function toggleFavoriteFile(id: string): void {
  const files = getStored<FileItem[]>(KEYS.FILES, INITIAL_FILES);
  const updated = files.map(f => {
    if (f.id === id) {
      return { ...f, favorite: !f.favorite };
    }
    return f;
  });
  setStored(KEYS.FILES, updated);
  notifySubscribers();
}

export function renameFile(id: string, newName: string): void {
  const files = getStored<FileItem[]>(KEYS.FILES, INITIAL_FILES);
  const updated = files.map(f => {
    if (f.id === id) {
      return { ...f, name: newName };
    }
    return f;
  });
  setStored(KEYS.FILES, updated);
  notifySubscribers();
}

export function moveFile(id: string, targetFolderId: string | null): void {
  const files = getStored<FileItem[]>(KEYS.FILES, INITIAL_FILES);
  const updated = files.map(f => {
    if (f.id === id) {
      return { ...f, folder_id: targetFolderId };
    }
    return f;
  });
  setStored(KEYS.FILES, updated);
  notifySubscribers();
}

export function copyFile(id: string): FileItem | null {
  const files = getStored<FileItem[]>(KEYS.FILES, INITIAL_FILES);
  const target = files.find(f => f.id === id);
  if (!target) return null;

  const copy: FileItem = {
    ...target,
    id: 'file_copy_' + Date.now(),
    name: target.name.replace(/(\.[^.]+)$/, ' (Copy)$1'),
    created_at: new Date().toISOString(),
  };

  setStored(KEYS.FILES, [copy, ...files]);
  notifySubscribers();
  return copy;
}

// -------------------------------------------------------------
// NOTES
// -------------------------------------------------------------

export function getNotes(options?: { favoritesOnly?: boolean; includeTrash?: boolean }): NoteItem[] {
  const allNotes = getStored<NoteItem[]>(KEYS.NOTES, INITIAL_NOTES);
  return allNotes.filter(n => {
    if (options?.includeTrash) return Boolean(n.is_trash);
    if (n.is_trash) return false;
    if (options?.favoritesOnly && !n.favorite) return false;
    return true;
  });
}

export function saveNote(note: Partial<NoteItem>): NoteItem {
  const notes = getStored<NoteItem[]>(KEYS.NOTES, INITIAL_NOTES);
  const now = new Date().toISOString();

  if (note.id) {
    const updated = notes.map(n => {
      if (n.id === note.id) {
        return {
          ...n,
          ...note,
          updated_at: now,
        } as NoteItem;
      }
      return n;
    });
    setStored(KEYS.NOTES, updated);
    notifySubscribers();
    return updated.find(n => n.id === note.id)!;
  }

  const newNote: NoteItem = {
    id: 'note_' + Date.now(),
    user_id: getCurrentUser()?.id || 'usr_local',
    title: note.title || 'Untitled Note',
    content: note.content || '',
    tags: note.tags || [],
    favorite: Boolean(note.favorite),
    pinned: Boolean(note.pinned),
    color: note.color || '#6366f1',
    is_trash: false,
    created_at: now,
    updated_at: now,
  };

  setStored(KEYS.NOTES, [newNote, ...notes]);
  notifySubscribers();
  return newNote;
}

export function deleteNote(id: string): void {
  const notes = getStored<NoteItem[]>(KEYS.NOTES, INITIAL_NOTES);
  const updated = notes.map(n => {
    if (n.id === id) {
      return { ...n, is_trash: true, deleted_at: new Date().toISOString() };
    }
    return n;
  });
  setStored(KEYS.NOTES, updated);
  notifySubscribers();
}

export function restoreNote(id: string): void {
  const notes = getStored<NoteItem[]>(KEYS.NOTES, INITIAL_NOTES);
  const updated = notes.map(n => {
    if (n.id === id) {
      return { ...n, is_trash: false, deleted_at: null };
    }
    return n;
  });
  setStored(KEYS.NOTES, updated);
  notifySubscribers();
}

export function permanentDeleteNote(id: string): void {
  const notes = getStored<NoteItem[]>(KEYS.NOTES, INITIAL_NOTES);
  const updated = notes.filter(n => n.id !== id);
  setStored(KEYS.NOTES, updated);
  notifySubscribers();
}

export function toggleFavoriteNote(id: string): void {
  const notes = getStored<NoteItem[]>(KEYS.NOTES, INITIAL_NOTES);
  const updated = notes.map(n => (n.id === id ? { ...n, favorite: !n.favorite } : n));
  setStored(KEYS.NOTES, updated);
  notifySubscribers();
}

export function togglePinNote(id: string): void {
  const notes = getStored<NoteItem[]>(KEYS.NOTES, INITIAL_NOTES);
  const updated = notes.map(n => (n.id === id ? { ...n, pinned: !n.pinned } : n));
  setStored(KEYS.NOTES, updated);
  notifySubscribers();
}

// -------------------------------------------------------------
// MESSAGES
// -------------------------------------------------------------

export function getMessages(options?: { folder?: string; favoritesOnly?: boolean; includeTrash?: boolean }): MessageItem[] {
  const all = getStored<MessageItem[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
  return all.filter(m => {
    if (options?.includeTrash) return Boolean(m.is_trash);
    if (m.is_trash) return false;
    if (options?.favoritesOnly && !m.favorite) return false;
    if (options?.folder && options.folder !== 'all' && m.folder !== options.folder) return false;
    return true;
  });
}

export function saveMessage(msg: Partial<MessageItem>): MessageItem {
  const all = getStored<MessageItem[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
  const newMsg: MessageItem = {
    id: 'msg_' + Date.now(),
    user_id: getCurrentUser()?.id || 'usr_local',
    title: msg.title || 'Untitled Memo',
    content: msg.content || '',
    folder: msg.folder || 'inbox',
    favorite: false,
    is_trash: false,
    sender: msg.sender || getCurrentUser()?.name || 'You',
    recipient: msg.recipient || 'Personal Storage',
    created_at: new Date().toISOString(),
  };

  setStored(KEYS.MESSAGES, [newMsg, ...all]);
  addNotification('system', 'New Message Saved', `"${newMsg.title}" stored in ${newMsg.folder}`);
  notifySubscribers();
  return newMsg;
}

export function deleteMessage(id: string): void {
  const all = getStored<MessageItem[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
  const updated = all.map(m => (m.id === id ? { ...m, is_trash: true, deleted_at: new Date().toISOString() } : m));
  setStored(KEYS.MESSAGES, updated);
  notifySubscribers();
}

export function restoreMessage(id: string): void {
  const all = getStored<MessageItem[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
  const updated = all.map(m => (m.id === id ? { ...m, is_trash: false, deleted_at: null } : m));
  setStored(KEYS.MESSAGES, updated);
  notifySubscribers();
}

export function permanentDeleteMessage(id: string): void {
  const all = getStored<MessageItem[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
  const updated = all.filter(m => m.id !== id);
  setStored(KEYS.MESSAGES, updated);
  notifySubscribers();
}

export function toggleFavoriteMessage(id: string): void {
  const all = getStored<MessageItem[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
  const updated = all.map(m => (m.id === id ? { ...m, favorite: !m.favorite } : m));
  setStored(KEYS.MESSAGES, updated);
  notifySubscribers();
}

// -------------------------------------------------------------
// SECURE PASSWORD VAULT
// -------------------------------------------------------------

export function getVaultItems(options?: { category?: string; favoritesOnly?: boolean; includeTrash?: boolean }): VaultItem[] {
  const all = getStored<VaultItem[]>(KEYS.VAULT, INITIAL_VAULT_ITEMS);
  return all.filter(v => {
    if (options?.includeTrash) return Boolean(v.is_trash);
    if (v.is_trash) return false;
    if (options?.favoritesOnly && !v.favorite) return false;
    if (options?.category && options.category !== 'all' && v.category !== options.category) return false;
    return true;
  });
}

export function saveVaultItem(item: Partial<VaultItem>): VaultItem {
  const all = getStored<VaultItem[]>(KEYS.VAULT, INITIAL_VAULT_ITEMS);
  const now = new Date().toISOString();

  if (item.id) {
    const updated = all.map(v => {
      if (v.id === item.id) {
        return { ...v, ...item, updated_at: now } as VaultItem;
      }
      return v;
    });
    setStored(KEYS.VAULT, updated);
    addNotification('security', 'Vault Updated', `Credential for ${item.website || 'account'} updated.`);
    notifySubscribers();
    return updated.find(v => v.id === item.id)!;
  }

  const newItem: VaultItem = {
    id: 'vault_' + Date.now(),
    user_id: getCurrentUser()?.id || 'usr_local',
    website: item.website || 'New Service',
    username: item.username || '',
    encrypted_password: item.encrypted_password || '',
    url: item.url || '',
    notes: item.notes || '',
    category: item.category || 'other',
    favorite: Boolean(item.favorite),
    is_trash: false,
    created_at: now,
    updated_at: now,
  };

  setStored(KEYS.VAULT, [newItem, ...all]);
  addNotification('security', 'Credential Vaulted', `Encrypted credentials for "${newItem.website}" saved.`);
  notifySubscribers();
  return newItem;
}

export function deleteVaultItem(id: string): void {
  const all = getStored<VaultItem[]>(KEYS.VAULT, INITIAL_VAULT_ITEMS);
  const updated = all.map(v => (v.id === id ? { ...v, is_trash: true, deleted_at: new Date().toISOString() } : v));
  setStored(KEYS.VAULT, updated);
  notifySubscribers();
}

export function restoreVaultItem(id: string): void {
  const all = getStored<VaultItem[]>(KEYS.VAULT, INITIAL_VAULT_ITEMS);
  const updated = all.map(v => (v.id === id ? { ...v, is_trash: false, deleted_at: null } : v));
  setStored(KEYS.VAULT, updated);
  notifySubscribers();
}

export function permanentDeleteVaultItem(id: string): void {
  const all = getStored<VaultItem[]>(KEYS.VAULT, INITIAL_VAULT_ITEMS);
  const updated = all.filter(v => v.id !== id);
  setStored(KEYS.VAULT, updated);
  notifySubscribers();
}

export function toggleFavoriteVaultItem(id: string): void {
  const all = getStored<VaultItem[]>(KEYS.VAULT, INITIAL_VAULT_ITEMS);
  const updated = all.map(v => (v.id === id ? { ...v, favorite: !v.favorite } : v));
  setStored(KEYS.VAULT, updated);
  notifySubscribers();
}

// -------------------------------------------------------------
// TRASH & RECYCLE BIN
// -------------------------------------------------------------

export interface UnifiedTrashItem {
  id: string;
  type: 'file' | 'note' | 'message' | 'vault';
  name: string;
  detail: string;
  deleted_at: string;
}

export function getTrashItems(): UnifiedTrashItem[] {
  const files = getFiles({ includeTrash: true }).map(f => ({
    id: f.id,
    type: 'file' as const,
    name: f.name,
    detail: `${(f.file_size / (1024 * 1024)).toFixed(1)} MB • ${f.file_type}`,
    deleted_at: f.deleted_at || f.created_at,
  }));

  const notes = getNotes({ includeTrash: true }).map(n => ({
    id: n.id,
    type: 'note' as const,
    name: n.title,
    detail: `Note • ${n.tags.join(', ') || 'No tags'}`,
    deleted_at: n.deleted_at || n.created_at,
  }));

  const messages = getMessages({ includeTrash: true }).map(m => ({
    id: m.id,
    type: 'message' as const,
    name: m.title,
    detail: `Message in ${m.folder}`,
    deleted_at: m.deleted_at || m.created_at,
  }));

  const vault = getVaultItems({ includeTrash: true }).map(v => ({
    id: v.id,
    type: 'vault' as const,
    name: v.website,
    detail: `Vault credential (${v.category})`,
    deleted_at: v.deleted_at || v.created_at,
  }));

  return [...files, ...notes, ...messages, ...vault].sort((a, b) => 
    new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
  );
}

export async function restoreTrashItem(type: 'file' | 'note' | 'message' | 'vault', id: string): Promise<void> {
  if (type === 'file') restoreFile(id);
  if (type === 'note') restoreNote(id);
  if (type === 'message') restoreMessage(id);
  if (type === 'vault') restoreVaultItem(id);
}

export async function permanentDeleteTrashItem(type: 'file' | 'note' | 'message' | 'vault', id: string): Promise<void> {
  if (type === 'file') await permanentDeleteFile(id);
  if (type === 'note') permanentDeleteNote(id);
  if (type === 'message') permanentDeleteMessage(id);
  if (type === 'vault') permanentDeleteVaultItem(id);
}

export async function emptyTrash(): Promise<void> {
  const trashItems = getTrashItems();
  for (const item of trashItems) {
    await permanentDeleteTrashItem(item.type, item.id);
  }
  addNotification('trash', 'Recycle Bin Emptied', 'All items in trash have been permanently purged.');
  notifySubscribers();
}

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------

export function getNotifications(): NotificationItem[] {
  return getStored<NotificationItem[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
}

export function addNotification(type: NotificationItem['type'], title: string, message: string): void {
  const notifs = getNotifications();
  const newNotif: NotificationItem = {
    id: 'notif_' + Date.now(),
    user_id: getCurrentUser()?.id || 'usr_local',
    type,
    title,
    message,
    read: false,
    created_at: new Date().toISOString(),
  };
  setStored(KEYS.NOTIFICATIONS, [newNotif, ...notifs.slice(0, 24)]);
  notifySubscribers();
}

export function markNotificationAsRead(id: string): void {
  const notifs = getNotifications();
  const updated = notifs.map(n => (n.id === id ? { ...n, read: true } : n));
  setStored(KEYS.NOTIFICATIONS, updated);
  notifySubscribers();
}

export function markAllNotificationsAsRead(): void {
  const notifs = getNotifications();
  const updated = notifs.map(n => ({ ...n, read: true }));
  setStored(KEYS.NOTIFICATIONS, updated);
  notifySubscribers();
}

export function clearNotifications(): void {
  setStored(KEYS.NOTIFICATIONS, []);
  notifySubscribers();
}

// -------------------------------------------------------------
// STORAGE STATS CALCULATOR
// -------------------------------------------------------------

export function getStorageStats(): StorageStats {
  const files = getFiles();
  const notes = getNotes();

  const TOTAL_QUOTA = 15 * 1024 * 1024 * 1024; // 15 GB quota
  let imagesSize = 0;
  let videosSize = 0;
  let docsSize = 0;
  let otherSize = 0;
  let totalImages = 0;
  let totalVideos = 0;
  let totalDocs = 0;

  files.forEach(f => {
    if (f.file_type === 'image') {
      imagesSize += f.file_size;
      totalImages++;
    } else if (f.file_type === 'video') {
      videosSize += f.file_size;
      totalVideos++;
    } else if (f.file_type === 'document') {
      docsSize += f.file_size;
      totalDocs++;
    } else {
      otherSize += f.file_size;
    }
  });

  const used = imagesSize + videosSize + docsSize + otherSize;
  const available = Math.max(0, TOTAL_QUOTA - used);

  return {
    total: TOTAL_QUOTA,
    used,
    available,
    imagesSize,
    videosSize,
    docsSize,
    otherSize,
    totalFiles: files.length,
    totalImages,
    totalVideos,
    totalDocs,
    totalNotes: notes.length,
  };
}
