# FM_Store — Next-Generation Personal Cloud, Digital Vault & Productivity

FM_Store is a modern personal digital storage and productivity platform engineered with dark 3D glassmorphic aesthetics, zero-knowledge AES-GCM 256-bit cryptography, and real-time multi-media management.

![FM_Store Logo](data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%3E%3Cdefs%3E%3ClinearGradient%20id='g'%20x1='0%25'%20y1='0%25'%20x2='100%25'%20y2='100%25'%3E%3Cstop%20offset='0%25'%20stop-color='%2306b6d4'/%3E%3Cstop%20offset='50%25'%20stop-color='%236366f1'/%3E%3Cstop%20offset='100%25'%20stop-color='%238b5cf6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width='64'%20height='64'%20rx='16'%20fill='%23080b11'/%3E%3Crect%20x='4'%20y='4'%20width='56'%20height='56'%20rx='12'%20fill='none'%20stroke='url(%23g)'%20stroke-width='3'%20stroke-opacity='0.6'/%3E%3Cpath%20d='M18%2044V20h14m-14%2011h11m11%2013V20l7%2014%207-14v24'%20fill='none'%20stroke='url(%23g)'%20stroke-width='4'%20stroke-linecap='round'%20stroke-linejoin='round'/%3E%3C/svg%3E)

---

## 🚀 Key Features

### 1. 3D Animated Landing & Login Experience
- **Interactive 3D Particle Starfield**: Canvas WebGL physics with cursor-tracking mouse parallax and smooth depth perspective.
- **Glassmorphic 3D Card**: Parallax tilt responding dynamically to pointer coordinates.
- **One-Click Instant Preview**: Test the application immediately without registration with "Launch Quick Demo Account" or create a full account.
- **Password Obfuscation**: Show/hide password toggle, remember-me session persistence, and forgot-password recovery.

### 2. Command Central Dashboard (`/dashboard`)
- **Circular SVG Donut Storage Chart**: Real-time visualization of used vs available quota (out of 15.00 GB allocation).
- **Category Breakdown Bars**: Real-time sizing of Images, Videos, Documents, and System data.
- **Top Metrics**: Total Files, Images, Videos, Documents, and Encrypted Notes counts.
- **Quick Action Bar**: Instant 1-click shortcuts to upload files, launch new notes, save credentials, or create folders.
- **Recent Files Table**: Interactive list with thumbnails, file sizes, and quick actions.

### 3. Complete File Manager (`/files`)
- **Folder Navigation**: Breadcrumbs (`All Files > Folder Name`), folder item counters, and color coding.
- **View Toggle**: Grid View with high-res thumbnails vs Compact List View.
- **File Management**: Upload (drag-and-drop or file picker), Download, Rename, Duplicate/Copy, Move to Folder, and Delete to Trash.
- **Search, Sort & Filter**: Live filename filtering, sorting by Date, Name, or Size (Asc/Desc).

### 4. Visual Media Gallery (`/images`)
- **Masonry Grid**: Responsive image stream with hover metadata overlays.
- **Fullscreen Lightbox**: Zoom In/Out, 90° Rotation, Next/Prev navigation (arrow keys enabled), and Asset Metadata inspector.

### 5. Dedicated Video Library (`/videos`)
- **Duration Badges**: Formatted time indicators on all video thumbnails.
- **Integrated Video Player**: Play/Pause, scrubbable seek slider, volume control, mute, and fullscreen toggle.

### 6. Productivity & Encrypted Notes (`/notes`)
- **Rich Markdown Editor**: Format text with bold, italic, code blocks, bullet lists, and blockquotes.
- **Real-Time Autosave**: Automatic background saving with confirmation badge.
- **Color Themes & Tags**: Categorize notes with custom glow accents (Indigo, Cyan, Emerald, Violet, Amber, Rose).
- **Pinning & Favorites**: Keep critical notes pinned to top.

### 7. Secure Password Vault (`/vault`)
- **Web Crypto AES-GCM 256-Bit**: Client-side zero-knowledge encryption with PBKDF2 key derivation (100,000 rounds).
- **Hardware-Style Master Lock**: Locks automatically after configurable inactivity timeout (1m, 5m, 15m, 30m) or on demand.
- **Secure Password Generator**: Generates cryptographically random 16-32 character passwords with strength scoring.
- **Auto-Hide & Clipboard Clear**: Revealed passwords hide automatically after 20 seconds; copied passwords clear safely.

### 8. Personal Messages & Memos (`/messages`)
- Chat-style thread reader with folder organization: `Inbox`, `Starred`, `Sent`, and `Archive`.
- Direct compose memo modal.

### 9. Unified Favorites (`/favorites`)
- Consolidates starred files, media, notes, messages, and vault credentials into one unified dashboard.

### 10. Recently Deleted / Recycle Bin (`/trash`)
- Two-tier deletion: deleted items remain restorable before permanent hardware purge.
- "Empty Recycle Bin" and individual purge with confirmation modal dialogs.

### 11. Profile & Preferences (`/profile` & `/settings`)
- Avatar selection from high-resolution presets or custom upload.
- Security settings: Auto-lock interval, Two-Factor Authentication toggle.
- Appearance: Cyber Cyan, Neon Indigo, Electric Violet, Matrix Emerald themes.
- Supabase Cloud Sync: Connect to your own Supabase project with 1 click.
- Full Data Sovereignty: Download a complete JSON archive of all personal assets and records.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Glassmorphism, CSS 3D Transforms
- **Animations**: Framer Motion, Canvas 2D/WebGL Particle Engine
- **Icons**: Lucide React
- **Cryptography**: Web Crypto API (`crypto.subtle` AES-GCM 256-bit + PBKDF2 SHA-256)
- **Local Persistence**: IndexedDB (for large media files) + LocalStorage (for metadata state)
- **Cloud Backend Integration**: Supabase (Auth, Postgres RLS, Storage) via `@supabase/supabase-js`

---

## 💻 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite Development Server
npm run dev

# 3. Build for Production
npm run build
```

Open `http://localhost:5173/` in your browser.

---

## 🗄 Optional Supabase Cloud Integration

FM_Store runs out-of-the-box in local-first mode without requiring external setup. If you wish to connect to your Supabase project:
1. Create a project on [supabase.com](https://supabase.com).
2. Run the included `supabase-schema.sql` in your Supabase SQL Editor.
3. Open FM_Store Settings > **Supabase Sync** tab and input your Project URL and Anon Public Key, or specify them in `.env`.
