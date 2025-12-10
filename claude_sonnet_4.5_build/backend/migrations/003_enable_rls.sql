-- Migration: 003 - Enable Row Level Security (RLS)
-- Created: 2025-12-09
-- Description: Security policies for authenticated user access

-- Enable RLS on all tables
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FEATURES TABLE POLICIES
-- ============================================================================

-- Allow all authenticated users to read features
CREATE POLICY "features_select_policy"
  ON public.features
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create features
CREATE POLICY "features_insert_policy"
  ON public.features
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own features
CREATE POLICY "features_update_policy"
  ON public.features
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow users to delete their own features
CREATE POLICY "features_delete_policy"
  ON public.features
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- ============================================================================
-- FEATURE VOTES TABLE POLICIES
-- ============================================================================

-- Allow all authenticated users to read votes
CREATE POLICY "feature_votes_select_policy"
  ON public.feature_votes
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create votes
CREATE POLICY "feature_votes_insert_policy"
  ON public.feature_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own votes
CREATE POLICY "feature_votes_update_policy"
  ON public.feature_votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own votes
CREATE POLICY "feature_votes_delete_policy"
  ON public.feature_votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- FEATURE COMMENTS TABLE POLICIES
-- ============================================================================

-- Allow all authenticated users to read comments
CREATE POLICY "feature_comments_select_policy"
  ON public.feature_comments
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create comments
CREATE POLICY "feature_comments_insert_policy"
  ON public.feature_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "feature_comments_update_policy"
  ON public.feature_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "feature_comments_delete_policy"
  ON public.feature_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Security notes:
-- - All policies require authentication (authenticated role)
-- - Users can only create/update/delete their own content
-- - All users can read all content (public voting board)
-- - RLS is enforced at the database level for security
