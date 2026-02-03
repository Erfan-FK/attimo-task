-- =====================================================
-- Attimo Database Schema
-- =====================================================
-- This schema defines the core tables for the Attimo app:
-- - profiles: User profile data
-- - tasks: User tasks with priority and status
-- - notes: User notes with AI enhancement support
-- - note_ai_runs: AI processing history for notes
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- Stores user profile information
-- Automatically created when a user signs up via trigger
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- TASKS TABLE
-- =====================================================
-- Stores user tasks with status, priority, and deadlines
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' NOT NULL CHECK (status IN ('todo', 'in_progress', 'done', 'archived')),
  priority INTEGER DEFAULT 2 NOT NULL CHECK (priority BETWEEN 1 AND 5),
  deadline TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- NOTES TABLE
-- =====================================================
-- Stores user notes with AI enhancement support
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}' NOT NULL,
  pinned BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned) WHERE pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_pinned ON notes(user_id, pinned, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);
-- Full-text search index for notes
CREATE INDEX IF NOT EXISTS idx_notes_search ON notes USING GIN(to_tsvector('english', title || ' ' || content));

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notes
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- NOTE_AI_RUNS TABLE
-- =====================================================
-- Stores AI processing history for notes
CREATE TABLE IF NOT EXISTS note_ai_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('summarize', 'expand', 'improve', 'translate', 'extract_tasks', 'custom')),
  output TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_note_ai_runs_user_id ON note_ai_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_note_ai_runs_note_id ON note_ai_runs(note_id);
CREATE INDEX IF NOT EXISTS idx_note_ai_runs_created_at ON note_ai_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_note_ai_runs_note_created ON note_ai_runs(note_id, created_at DESC);

-- Enable RLS
ALTER TABLE note_ai_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for note_ai_runs
CREATE POLICY "Users can view own AI runs"
  ON note_ai_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI runs"
  ON note_ai_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI runs"
  ON note_ai_runs FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tasks table
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for notes table
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUTH TRIGGER
-- =====================================================
-- Automatically create a profile when a new user signs up

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to search notes by text
CREATE OR REPLACE FUNCTION search_notes(
  search_query TEXT,
  user_uuid UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  tags TEXT[],
  pinned BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.content,
    n.tags,
    n.pinned,
    n.created_at,
    n.updated_at,
    ts_rank(to_tsvector('english', n.title || ' ' || n.content), plainto_tsquery('english', search_query)) AS rank
  FROM notes n
  WHERE n.user_id = user_uuid
    AND to_tsvector('english', n.title || ' ' || n.content) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, n.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON TABLE tasks IS 'User tasks with status, priority, and deadlines';
COMMENT ON TABLE notes IS 'User notes with AI enhancement support';
COMMENT ON TABLE note_ai_runs IS 'AI processing history for notes';

COMMENT ON COLUMN tasks.priority IS 'Priority level: 1 (lowest) to 5 (highest)';
COMMENT ON COLUMN tasks.status IS 'Task status: todo, in_progress, done, archived';
COMMENT ON COLUMN note_ai_runs.action IS 'AI action type: summarize, expand, improve, translate, extract_tasks, custom';
