-- =========================================================
-- FM_Store Production Database Schema & Row Level Security (RLS)
-- Run this in your Supabase SQL Editor
-- =========================================================

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT DEFAULT 'FM User',
  avatar_url TEXT DEFAULT '',
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  theme_accent TEXT DEFAULT 'indigo',
  vault_lock_timeout INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Folders Table
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own folders"
  ON public.folders FOR ALL
  USING (auth.uid() = user_id);

-- 3. Files Table
CREATE TABLE IF NOT EXISTS public.files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'video', 'document', 'audio', 'archive', 'other'
  file_size BIGINT NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  favorite BOOLEAN DEFAULT FALSE,
  is_trash BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  url TEXT NOT NULL,
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own files"
  ON public.files FOR ALL
  USING (auth.uid() = user_id);

-- 4. Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  favorite BOOLEAN DEFAULT FALSE,
  pinned BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#1e293b',
  is_trash BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes"
  ON public.notes FOR ALL
  USING (auth.uid() = user_id);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  folder TEXT DEFAULT 'inbox', -- 'inbox', 'sent', 'archive', 'starred'
  favorite BOOLEAN DEFAULT FALSE,
  is_trash BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  sender TEXT DEFAULT 'You',
  recipient TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own messages"
  ON public.messages FOR ALL
  USING (auth.uid() = user_id);

-- 6. Secure Vault Items Table
-- Note: encrypted_password contains client-side encrypted AES-GCM ciphertext.
CREATE TABLE IF NOT EXISTS public.vault_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  website TEXT NOT NULL,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  category TEXT DEFAULT 'social',
  favorite BOOLEAN DEFAULT FALSE,
  is_trash BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vault items"
  ON public.vault_items FOR ALL
  USING (auth.uid() = user_id);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'info', -- 'upload', 'security', 'storage', 'system', 'trash'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- 8. Storage Bucket Policies
-- Create a storage bucket named 'user-uploads' in the Supabase Dashboard
-- and apply row-level user folder isolation:
-- (auth.uid()::text = (storage.foldername(name))[1])
