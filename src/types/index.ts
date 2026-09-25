export type FileCategory = 'all' | 'image' | 'video' | 'document' | 'audio' | 'archive' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  two_factor_enabled?: boolean;
  theme_mode?: 'light' | 'dark';
  theme_accent?: 'cyan' | 'indigo' | 'violet' | 'emerald';
  vault_lock_timeout?: number; // in minutes
}

export interface FileItem {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  file_type: 'image' | 'video' | 'document' | 'audio' | 'archive' | 'other';
  file_size: number;
  folder_id?: string | null;
  favorite: boolean;
  is_trash?: boolean;
  deleted_at?: string | null;
  created_at: string;
  url: string;
  thumbnail?: string;
  dimensions?: { width: number; height: number };
  duration?: number; // For videos in seconds
}

export interface FolderItem {
  id: string;
  user_id: string;
  name: string;
  parent_id?: string | null;
  created_at: string;
  color?: string;
}

export interface NoteItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  pinned: boolean;
  color?: string; // hex or color token
  is_trash?: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  folder: 'inbox' | 'sent' | 'archive' | 'starred';
  favorite: boolean;
  is_trash?: boolean;
  deleted_at?: string | null;
  sender: string;
  recipient?: string;
  created_at: string;
}

export type VaultCategory = 'social' | 'email' | 'banking' | 'work' | 'shopping' | 'security' | 'other';

export interface VaultItem {
  id: string;
  user_id: string;
  website: string;
  username: string;
  encrypted_password: string; // AES-GCM encrypted or ciphertext
  url?: string;
  notes?: string;
  category: VaultCategory;
  favorite: boolean;
  is_trash?: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'upload' | 'security' | 'storage' | 'system' | 'trash';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface StorageStats {
  total: number; // e.g. 15 GB in bytes
  used: number;
  available: number;
  imagesSize: number;
  videosSize: number;
  docsSize: number;
  otherSize: number;
  totalFiles: number;
  totalImages: number;
  totalVideos: number;
  totalDocs: number;
  totalNotes: number;
}
