-- Migration: 001 - Create Tables
-- Created: 2025-12-09
-- Description: Create core tables for Team Feature Voting Board

-- Features table: Store feature proposals
CREATE TABLE IF NOT EXISTS public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (TRIM(title) != ''),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (
    status IN ('proposed', 'under_review', 'approved', 'in_progress', 'completed', 'rejected')
  ),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feature votes table: Store upvotes/downvotes
CREATE TABLE IF NOT EXISTS public.feature_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feature_id, user_id) -- Prevent duplicate votes per user
);

-- Feature comments table: Store comments on features
CREATE TABLE IF NOT EXISTS public.feature_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL CHECK (TRIM(comment_text) != ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.features IS 'Feature proposals submitted by users';
COMMENT ON TABLE public.feature_votes IS 'User votes (upvote/downvote) on features';
COMMENT ON TABLE public.feature_comments IS 'Comments on feature proposals';
