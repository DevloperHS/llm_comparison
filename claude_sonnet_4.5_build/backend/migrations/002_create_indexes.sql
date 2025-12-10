-- Migration: 002 - Create Indexes
-- Created: 2025-12-09
-- Description: Performance indexes for frequent queries

-- Features table indexes
CREATE INDEX IF NOT EXISTS idx_features_status
  ON public.features(status);

CREATE INDEX IF NOT EXISTS idx_features_created_at
  ON public.features(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_features_created_by
  ON public.features(created_by);

-- Feature votes table indexes
CREATE INDEX IF NOT EXISTS idx_feature_votes_feature_id
  ON public.feature_votes(feature_id);

CREATE INDEX IF NOT EXISTS idx_feature_votes_user_id
  ON public.feature_votes(user_id);

-- Feature comments table indexes
CREATE INDEX IF NOT EXISTS idx_feature_comments_feature_id
  ON public.feature_comments(feature_id);

CREATE INDEX IF NOT EXISTS idx_feature_comments_user_id
  ON public.feature_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_feature_comments_created_at
  ON public.feature_comments(created_at DESC);

-- Performance notes:
-- - idx_features_status: Fast filtering by status (proposed, in_progress, etc.)
-- - idx_features_created_at: Fast sorting by date (newest first)
-- - idx_feature_votes_feature_id: Fast vote aggregation per feature
-- - idx_feature_comments_feature_id: Fast comment retrieval per feature
