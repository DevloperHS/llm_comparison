-- Migration: 004 - Create RPC Functions
-- Created: 2025-12-09
-- Description: Backend API functions for Team Feature Voting Board

-- ============================================================================
-- FUNCTION 1: list_features
-- Purpose: List all features with aggregated vote and comment counts
-- ============================================================================

CREATE OR REPLACE FUNCTION public.list_features(
  filter_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  upvote_count BIGINT,
  downvote_count BIGINT,
  net_votes BIGINT,
  comment_count BIGINT,
  user_vote TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user ID (fallback for testing)
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000001'::UUID);

  RETURN QUERY
  SELECT
    f.id,
    f.title,
    f.description,
    f.status,
    f.created_by,
    f.created_at,
    f.updated_at,
    COALESCE(SUM(CASE WHEN fv.vote_type = 'upvote' THEN 1 ELSE 0 END), 0) AS upvote_count,
    COALESCE(SUM(CASE WHEN fv.vote_type = 'downvote' THEN 1 ELSE 0 END), 0) AS downvote_count,
    COALESCE(
      SUM(CASE
        WHEN fv.vote_type = 'upvote' THEN 1
        WHEN fv.vote_type = 'downvote' THEN -1
        ELSE 0
      END),
      0
    ) AS net_votes,
    (SELECT COUNT(*) FROM public.feature_comments fc WHERE fc.feature_id = f.id) AS comment_count,
    (SELECT fv2.vote_type FROM public.feature_votes fv2
     WHERE fv2.feature_id = f.id AND fv2.user_id = v_user_id) AS user_vote
  FROM public.features f
  LEFT JOIN public.feature_votes fv ON fv.feature_id = f.id
  WHERE (filter_status IS NULL OR f.status = filter_status)
  GROUP BY f.id, f.title, f.description, f.status, f.created_by, f.created_at, f.updated_at
  ORDER BY f.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.list_features IS
  'Lists features with vote/comment aggregations. Optionally filter by status.';

-- ============================================================================
-- FUNCTION 2: create_feature
-- Purpose: Create a new feature proposal
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_feature(
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'proposed'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_feature_id UUID;
  v_user_id UUID;
BEGIN
  -- Get current user ID (fallback for testing)
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000001'::UUID);

  -- Validate status
  IF p_status NOT IN ('proposed', 'under_review', 'approved', 'in_progress', 'completed', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status: %', p_status;
  END IF;

  -- Validate title
  IF p_title IS NULL OR TRIM(p_title) = '' THEN
    RAISE EXCEPTION 'Title cannot be empty';
  END IF;

  -- Insert feature
  INSERT INTO public.features (title, description, status, created_by)
  VALUES (p_title, p_description, p_status, v_user_id)
  RETURNING id INTO v_feature_id;

  RETURN v_feature_id;
END;
$$;

COMMENT ON FUNCTION public.create_feature IS
  'Creates a new feature proposal. Returns feature ID.';

-- ============================================================================
-- FUNCTION 3: toggle_vote
-- Purpose: Add, remove, or change a user's vote (concurrency-safe)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.toggle_vote(
  p_feature_id UUID,
  p_vote_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_existing_vote TEXT;
  v_action TEXT;
BEGIN
  -- Get current user ID (fallback for testing)
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000001'::UUID);

  -- Validate vote type
  IF p_vote_type NOT IN ('upvote', 'downvote') THEN
    RAISE EXCEPTION 'Invalid vote type: %', p_vote_type;
  END IF;

  -- Check existing vote (with row lock for concurrency safety)
  SELECT vote_type INTO v_existing_vote
  FROM public.feature_votes
  WHERE feature_id = p_feature_id AND user_id = v_user_id
  FOR UPDATE;

  -- Toggle logic
  IF v_existing_vote IS NULL THEN
    -- No existing vote: add new vote
    INSERT INTO public.feature_votes (feature_id, user_id, vote_type)
    VALUES (p_feature_id, v_user_id, p_vote_type);
    v_action := 'added';

  ELSIF v_existing_vote = p_vote_type THEN
    -- Same vote type: remove vote (toggle off)
    DELETE FROM public.feature_votes
    WHERE feature_id = p_feature_id AND user_id = v_user_id;
    v_action := 'removed';

  ELSE
    -- Different vote type: change vote
    UPDATE public.feature_votes
    SET vote_type = p_vote_type, created_at = NOW()
    WHERE feature_id = p_feature_id AND user_id = v_user_id;
    v_action := 'changed';
  END IF;

  -- Return result
  RETURN jsonb_build_object(
    'action', v_action,
    'feature_id', p_feature_id,
    'current_vote', CASE WHEN v_action = 'removed' THEN NULL ELSE p_vote_type END
  );
END;
$$;

COMMENT ON FUNCTION public.toggle_vote IS
  'Toggles user vote on a feature. Uses SELECT FOR UPDATE for concurrency safety.';

-- ============================================================================
-- FUNCTION 4: add_comment
-- Purpose: Add a comment to a feature
-- ============================================================================

CREATE OR REPLACE FUNCTION public.add_comment(
  p_feature_id UUID,
  p_comment_text TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comment_id UUID;
  v_user_id UUID;
BEGIN
  -- Get current user ID (fallback for testing)
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000001'::UUID);

  -- Validate comment text
  IF p_comment_text IS NULL OR TRIM(p_comment_text) = '' THEN
    RAISE EXCEPTION 'Comment text cannot be empty';
  END IF;

  -- Validate feature exists
  IF NOT EXISTS (SELECT 1 FROM public.features WHERE id = p_feature_id) THEN
    RAISE EXCEPTION 'Feature not found: %', p_feature_id;
  END IF;

  -- Insert comment
  INSERT INTO public.feature_comments (feature_id, user_id, comment_text)
  VALUES (p_feature_id, v_user_id, p_comment_text)
  RETURNING id INTO v_comment_id;

  RETURN v_comment_id;
END;
$$;

COMMENT ON FUNCTION public.add_comment IS
  'Adds a comment to a feature. Returns comment ID.';

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.list_features TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_feature TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_vote TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_comment TO authenticated;
