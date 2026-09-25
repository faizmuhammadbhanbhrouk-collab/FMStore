import { FileItem, FolderItem, NoteItem, MessageItem, VaultItem, NotificationItem } from '../types';

export const INITIAL_USER = {
  id: 'usr_fm_prime',
  email: 'faiz@fmstore.io',
  name: 'Faiz Muhammad',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  two_factor_enabled: false,
  theme_mode: 'light' as const,
  theme_accent: 'indigo' as const,
  vault_lock_timeout: 15,
};

export const INITIAL_FOLDERS: FolderItem[] = [
  { id: 'fld_design', user_id: INITIAL_USER.id, name: 'Brand Assets & Design', parent_id: null, created_at: new Date(Date.now() - 10 * 86400000).toISOString(), color: '#6366f1' },
  { id: 'fld_docs', user_id: INITIAL_USER.id, name: 'Contracts & Legal', parent_id: null, created_at: new Date(Date.now() - 8 * 86400000).toISOString(), color: '#06b6d4' },
  { id: 'fld_photos', user_id: INITIAL_USER.id, name: 'Product Photography', parent_id: null, created_at: new Date(Date.now() - 6 * 86400000).toISOString(), color: '#8b5cf6' },
  { id: 'fld_archive', user_id: INITIAL_USER.id, name: 'Archive 2026', parent_id: null, created_at: new Date(Date.now() - 4 * 86400000).toISOString(), color: '#f59e0b' },
];

export const INITIAL_FILES: FileItem[] = [
  {
    id: 'file_cyber_core',
    user_id: INITIAL_USER.id,
    name: 'Quantum_Architecture_Diagram.png',
    file_path: '/images/quantum_arch.png',
    file_type: 'image',
    file_size: 4280000,
    folder_id: 'fld_design',
    favorite: true,
    is_trash: false,
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    dimensions: { width: 3840, height: 2160 },
  },
  {
    id: 'file_nebula',
    user_id: INITIAL_USER.id,
    name: 'Deep_Space_Nebula_Hero.jpg',
    file_path: '/images/nebula_hero.jpg',
    file_type: 'image',
    file_size: 3120000,
    folder_id: 'fld_photos',
    favorite: true,
    is_trash: false,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    dimensions: { width: 2560, height: 1440 },
  },
  {
    id: 'file_glass_render',
    user_id: INITIAL_USER.id,
    name: 'Minimal_Glass_Isometric_3D.png',
    file_path: '/images/glass_render.png',
    file_type: 'image',
    file_size: 2890000,
    folder_id: 'fld_design',
    favorite: false,
    is_trash: false,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=80',
    dimensions: { width: 2400, height: 1600 },
  },
  {
    id: 'file_video_demo',
    user_id: INITIAL_USER.id,
    name: 'FM_Store_Product_Showcase.mp4',
    file_path: '/videos/showcase.mp4',
    file_type: 'video',
    file_size: 28400000,
    folder_id: 'fld_design',
    favorite: true,
    is_trash: false,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80',
    duration: 596,
  },
  {
    id: 'file_video_motion',
    user_id: INITIAL_USER.id,
    name: 'Particle_Sim_Background_Loop.mp4',
    file_path: '/videos/particle_loop.mp4',
    file_type: 'video',
    file_size: 16800000,
    folder_id: null,
    favorite: false,
    is_trash: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
    duration: 15,
  },
  {
    id: 'file_doc_specs',
    user_id: INITIAL_USER.id,
    name: 'FM_Store_Specification_v2.4.pdf',
    file_path: '/documents/FM_Store_Spec.pdf',
    file_type: 'document',
    file_size: 4500000,
    folder_id: 'fld_docs',
    favorite: true,
    is_trash: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    url: '#',
  },
  {
    id: 'file_doc_contract',
    user_id: INITIAL_USER.id,
    name: 'Enterprise_SLA_Master_Agreement.docx',
    file_path: '/documents/Master_Agreement.docx',
    file_type: 'document',
    file_size: 1850000,
    folder_id: 'fld_docs',
    favorite: false,
    is_trash: false,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    url: '#',
  },
  {
    id: 'file_archive_backup',
    user_id: INITIAL_USER.id,
    name: 'System_Config_Backup_Q1.tar.gz',
    file_path: '/archive/backup_q1.tar.gz',
    file_type: 'archive',
    file_size: 14200000,
    folder_id: 'fld_archive',
    favorite: false,
    is_trash: false,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    url: '#',
  },
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note_roadmap',
    user_id: INITIAL_USER.id,
    title: 'FM_Store Architecture & Launch Strategy',
    content: `# FM_Store Master Architecture

- **Security First**: Client-side AES-GCM 256-bit encryption for all credential vaults.
- **Visuals**: Dark glassmorphic design, smooth 60fps WebGL particle mesh, responsive sidebar.
- **Storage Tier**: Real-time folder hierarchy, drag & drop, file classification.
- **Offline Resiliency**: IndexedDB + localStorage state hydration with optional Supabase Cloud sync.

### Key Milestones:
1. Complete 3D Animated Landing & Auth Experience
2. Multi-category file management & instant video/image lightbox
3. Secure Password Vault with zero-knowledge master lock
4. Unified Search (Ctrl+K) & trash bin recovery`,
    tags: ['Architecture', 'Roadmap', 'Vault'],
    favorite: true,
    pinned: true,
    color: '#6366f1',
    is_trash: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'note_credentials',
    user_id: INITIAL_USER.id,
    title: 'Server Deployment & SSH Fingerprints',
    content: `Main production cluster:
- **Primary IP**: 198.51.100.24 (Cluster Alpha)
- **Backup Node**: 198.51.100.25 (Cluster Beta)
- **Key Fingerprint**: SHA256:7mP4eK+qZ9vB9...
- **Database**: Supabase Postgres v16 with Row Level Security active.

*Remember: Rotate SSH keys every 90 days!*`,
    tags: ['DevOps', 'Security', 'Infra'],
    favorite: false,
    pinned: true,
    color: '#06b6d4',
    is_trash: false,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'note_ideas',
    user_id: INITIAL_USER.id,
    title: 'Personal Productivity Habits 2026',
    content: `Daily Focus Routines:
1. Review Dashboard Storage & System Notifications early in the morning
2. Organize incoming files directly into tagged folders
3. Keep critical passwords stored inside the encrypted vault
4. Clear Recycle Bin at end of week`,
    tags: ['Personal', 'Habits'],
    favorite: true,
    pinned: false,
    color: '#10b981',
    is_trash: false,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

export const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: 'msg_welcome',
    user_id: INITIAL_USER.id,
    title: 'Welcome to FM_Store Enterprise Suite',
    content: 'Welcome Faiz! Your high-security digital vault and personal cloud storage workspace is active. All storage partitions are protected with Row Level Security and 256-bit encryption.',
    folder: 'inbox',
    favorite: true,
    is_trash: false,
    sender: 'FM_Store Security Team',
    recipient: 'faiz@fmstore.io',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'msg_backup',
    user_id: INITIAL_USER.id,
    title: 'Automated Snapshot Completed',
    content: 'All personal files, notes, and password vault hashes have been verified and mirrored to local persistent storage.',
    folder: 'inbox',
    favorite: false,
    is_trash: false,
    sender: 'System Backup Daemon',
    recipient: 'faiz@fmstore.io',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'msg_draft',
    user_id: INITIAL_USER.id,
    title: 'Memo: Upcoming Cloud Storage Expansion',
    content: 'Note to self: When local quota approaches 12 GB, enable extended Supabase bucket syncing with compression.',
    folder: 'sent',
    favorite: false,
    is_trash: false,
    sender: 'Faiz Muhammad',
    recipient: 'self@fmstore.io',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  }
];

export const INITIAL_VAULT_ITEMS: VaultItem[] = [
  {
    id: 'vault_github',
    user_id: INITIAL_USER.id,
    website: 'GitHub Enterprise',
    username: 'faiz-fm',
    encrypted_password: btoa('G#9x!vP$4mK2@zQ9'),
    url: 'https://github.com',
    notes: 'Includes personal access token for automated CI deployments',
    category: 'work',
    favorite: true,
    is_trash: false,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'vault_google',
    user_id: INITIAL_USER.id,
    website: 'Google Workspace',
    username: 'faiz@fmstore.io',
    encrypted_password: btoa('K9$L#m7X!qZ@p1Wv'),
    url: 'https://workspace.google.com',
    notes: '2FA recovery keys backed up in notes folder',
    category: 'email',
    favorite: true,
    is_trash: false,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'vault_chase',
    user_id: INITIAL_USER.id,
    website: 'Chase Premier Banking',
    username: 'faiz_banking_usr',
    encrypted_password: btoa('9b#X!88mP$kL@7qQ'),
    url: 'https://chase.com',
    notes: 'Primary checking and business credit line',
    category: 'banking',
    favorite: false,
    is_trash: false,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'vault_linkedin',
    user_id: INITIAL_USER.id,
    website: 'LinkedIn Professional',
    username: 'faiz.muhammad.tech',
    encrypted_password: btoa('W!4m$8kP#9vL2@zQ'),
    url: 'https://linkedin.com',
    notes: 'Direct networking profile',
    category: 'social',
    favorite: false,
    is_trash: false,
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_welcome',
    user_id: INITIAL_USER.id,
    type: 'system',
    title: 'FM_Store Ready',
    message: 'Welcome to your next-generation 3D personal cloud storage & vault.',
    read: false,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'notif_upload',
    user_id: INITIAL_USER.id,
    type: 'upload',
    title: 'Asset Upload Complete',
    message: 'Quantum_Architecture_Diagram.png was uploaded successfully.',
    read: true,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'notif_security',
    user_id: INITIAL_USER.id,
    type: 'security',
    title: 'Vault Encrypted with AES-GCM',
    message: 'Your password vault is protected with 256-bit client-side cryptography.',
    read: true,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];
