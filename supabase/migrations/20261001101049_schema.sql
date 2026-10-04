-- ==============================================================================
-- NovaSlate: Production Supabase PostgreSQL Schema
-- Migration: 20261001101049_schema.sql
-- ==============================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. USER PROFILES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    grade TEXT DEFAULT 'Class 10',
    avatar_url TEXT,
    streak_count INTEGER DEFAULT 1,
    last_active_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Automatically create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, grade, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'name',
            split_part(new.email, '@', 1)
        ),
        COALESCE(new.raw_user_meta_data->>'grade', 'Class 10'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', NULL)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = excluded.email,
        full_name = COALESCE(excluded.full_name, profiles.full_name),
        grade = COALESCE(excluded.grade, profiles.grade),
        avatar_url = COALESCE(excluded.avatar_url, profiles.avatar_url),
        updated_at = now();
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 2. NCERT DIGITAL CATALOG
-- Binary PDFs stream with ZERO EGRESS costs from Internet Archive (IAS3).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.catalog (
    id TEXT PRIMARY KEY,
    file_path TEXT UNIQUE NOT NULL,
    class TEXT NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    book_code TEXT,
    url TEXT NOT NULL,
    size_bytes BIGINT DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_class ON public.catalog(class);
CREATE INDEX IF NOT EXISTS idx_catalog_subject ON public.catalog(subject);
CREATE INDEX IF NOT EXISTS idx_catalog_is_available ON public.catalog(is_available);
CREATE INDEX IF NOT EXISTS idx_catalog_title ON public.catalog(title);

ALTER TABLE public.catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to catalog" ON public.catalog;
CREATE POLICY "Allow public read access to catalog"
    ON public.catalog FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow service role full access to catalog" ON public.catalog;
CREATE POLICY "Allow service role full access to catalog"
    ON public.catalog FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 3. STUDENT NOTES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    subject TEXT DEFAULT 'General',
    class TEXT DEFAULT 'Class 10',
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
CREATE POLICY "Users can view own notes"
    ON public.notes FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own notes" ON public.notes;
CREATE POLICY "Users can create own notes"
    ON public.notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
CREATE POLICY "Users can update own notes"
    ON public.notes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
CREATE POLICY "Users can delete own notes"
    ON public.notes FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 4. BOOKMARKS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('textbook', 'chapter', 'pyq', 'formula')),
    item_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view own bookmarks"
    ON public.bookmarks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can manage own bookmarks"
    ON public.bookmarks FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 5. COURSES & LMS CURRICULUM (StudyByte)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    instructor TEXT NOT NULL,
    category TEXT NOT NULL,
    grade TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    rating NUMERIC(3,2) DEFAULT 4.80,
    total_students INTEGER DEFAULT 0,
    modules JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to courses" ON public.courses;
CREATE POLICY "Allow public read access to courses"
    ON public.courses FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow service role full access to courses" ON public.courses;
CREATE POLICY "Allow service role full access to courses"
    ON public.courses FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    progress_percent INTEGER DEFAULT 0,
    completed_lessons TEXT[] DEFAULT '{}',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    last_accessed_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.course_enrollments(course_id);

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own enrollments" ON public.course_enrollments;
CREATE POLICY "Users can view own enrollments"
    ON public.course_enrollments FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.course_enrollments;
CREATE POLICY "Anyone can view reviews"
    ON public.course_enrollments FOR SELECT
    USING (review IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage own enrollment" ON public.course_enrollments;
CREATE POLICY "Users can manage own enrollment"
    ON public.course_enrollments FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 6. PEER COMMUNITY HUB (Discussions & Doubt Solving)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    author_grade TEXT DEFAULT 'Class 10',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    subject TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    upvoted_by UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_subject ON public.community_posts(subject);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.community_posts(created_at DESC);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.community_posts;
CREATE POLICY "Posts are viewable by everyone"
    ON public.community_posts FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.community_posts;
CREATE POLICY "Authenticated users can create posts"
    ON public.community_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts or upvote" ON public.community_posts;
CREATE POLICY "Users can update own posts or upvote"
    ON public.community_posts FOR UPDATE
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;
CREATE POLICY "Users can delete own posts"
    ON public.community_posts FOR DELETE
    USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.community_comments(post_id);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.community_comments;
CREATE POLICY "Comments are viewable by everyone"
    ON public.community_comments FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.community_comments;
CREATE POLICY "Authenticated users can comment"
    ON public.community_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.community_comments;
CREATE POLICY "Users can delete own comments"
    ON public.community_comments FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 7. STUDY SPRINTS & POMODORO SESSIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.study_sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    task_name TEXT,
    duration_minutes INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sprints_user_id ON public.study_sprints(user_id);

ALTER TABLE public.study_sprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own study sprints" ON public.study_sprints;
CREATE POLICY "Users can view own study sprints"
    ON public.study_sprints FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can log study sprints" ON public.study_sprints;
CREATE POLICY "Users can log study sprints"
    ON public.study_sprints FOR INSERT
    WITH CHECK (auth.uid() = user_id);
