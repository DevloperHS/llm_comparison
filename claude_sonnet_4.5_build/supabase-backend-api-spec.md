# Supabase Backend API Specification

**Database**: team_feature_voting_board_db
**Project Ref**: lqkikfqhxhshikrvqeww
**Created**: PART 5 - Supabase Backend API

## Overview

This document describes the 4 PostgreSQL RPC (Remote Procedure Call) functions that provide the backend API for the Team Feature Voting Board application.

All functions use `SECURITY DEFINER` to run with the privileges of the function owner, allowing controlled access to data while enforcing Row Level Security (RLS) policies.

---

## 1. `list_features`

Lists all feature proposals with aggregated vote and comment data.

### Function Signature

```sql
public.list_features(filter_status TEXT DEFAULT NULL)
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
```

### Parameters

- `filter_status` (TEXT, optional): Filter features by status. Pass `NULL` to get all features.
  - Valid values: `'proposed'`, `'under_review'`, `'approved'`, `'in_progress'`, `'completed'`, `'rejected'`

### Returns

Table with the following columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Feature unique identifier |
| `title` | TEXT | Feature title |
| `description` | TEXT | Feature description |
| `status` | TEXT | Current status |
| `created_by` | UUID | User ID who created the feature |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `upvote_count` | BIGINT | Total upvotes |
| `downvote_count` | BIGINT | Total downvotes |
| `net_votes` | BIGINT | Net votes (upvotes - downvotes) |
| `comment_count` | BIGINT | Total comments |
| `user_vote` | TEXT | Current user's vote ('upvote', 'downvote', or NULL) |

### Features

- **Aggregation**: Calculates vote counts and comment counts using SQL aggregations
- **User Context**: Shows the current user's vote using `auth.uid()`
- **Ordering**: Results ordered by `created_at DESC` (newest first)
- **Filtering**: Optional status filter

### Example Usage

```javascript
// Get all features
const { data, error } = await supabase.rpc('list_features', {
  filter_status: null
});

// Get only proposed features
const { data, error } = await supabase.rpc('list_features', {
  filter_status: 'proposed'
});
```

---

## 2. `create_feature`

Creates a new feature proposal.

### Function Signature

```sql
public.create_feature(
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'proposed'
)
RETURNS UUID
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `p_title` | TEXT | Yes | - | Feature title (cannot be empty/whitespace) |
| `p_description` | TEXT | No | NULL | Detailed feature description |
| `p_status` | TEXT | No | 'proposed' | Initial status |

### Returns

- **UUID**: The ID of the newly created feature

### Validation

- ✅ Title cannot be empty or only whitespace
- ✅ Status must be one of: `'proposed'`, `'under_review'`, `'approved'`, `'in_progress'`, `'completed'`, `'rejected'`
- ✅ Automatically sets `created_by` to current user (`auth.uid()`)
- ✅ Automatically sets `created_at` and `updated_at` timestamps

### Errors

- Raises exception if title is empty
- Raises exception if status is invalid

### Example Usage

```javascript
// Create feature with minimal data
const { data: featureId, error } = await supabase.rpc('create_feature', {
  p_title: 'Dark Mode Support',
  p_description: 'Add dark theme to the application',
  p_status: 'proposed'
});
```

---

## 3. `toggle_vote`

Adds, removes, or changes a user's vote on a feature. This function is **concurrency-safe** using PostgreSQL's `SELECT FOR UPDATE` lock.

### Function Signature

```sql
public.toggle_vote(
  p_feature_id UUID,
  p_vote_type TEXT
)
RETURNS JSONB
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `p_feature_id` | UUID | Yes | Feature to vote on |
| `p_vote_type` | TEXT | Yes | Vote type: 'upvote' or 'downvote' |

### Returns

JSONB object with the following structure:

```json
{
  "action": "added|removed|changed",
  "feature_id": "uuid",
  "current_vote": "upvote|downvote|null"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `action` | TEXT | What happened: 'added', 'removed', or 'changed' |
| `feature_id` | UUID | The feature ID that was voted on |
| `current_vote` | TEXT/NULL | User's current vote after operation |

### Behavior

The function implements **toggle logic**:

1. **No existing vote + upvote** → Adds upvote (`action: "added"`)
2. **Existing upvote + upvote** → Removes upvote (`action: "removed"`)
3. **Existing upvote + downvote** → Changes to downvote (`action: "changed"`)
4. **Existing downvote + upvote** → Changes to upvote (`action: "changed"`)
5. **Existing downvote + downvote** → Removes downvote (`action: "removed"`)

### Concurrency Safety

Uses `SELECT FOR UPDATE` to lock the user's vote row during the transaction. This prevents race conditions when the same user clicks vote multiple times rapidly.

```sql
SELECT vote_type INTO v_existing_vote
FROM public.feature_votes
WHERE feature_id = p_feature_id AND user_id = v_user_id
FOR UPDATE;
```

### Validation

- ✅ User must be authenticated (`auth.uid()` must not be NULL)
- ✅ Vote type must be 'upvote' or 'downvote'
- ✅ Enforces unique constraint: one vote per user per feature

### Errors

- Raises exception if user not authenticated
- Raises exception if vote type is invalid

### Example Usage

```javascript
// Add upvote
const { data, error } = await supabase.rpc('toggle_vote', {
  p_feature_id: 'feature-uuid-here',
  p_vote_type: 'upvote'
});
// Result: { action: "added", feature_id: "...", current_vote: "upvote" }

// Click upvote again (toggle off)
const { data, error } = await supabase.rpc('toggle_vote', {
  p_feature_id: 'feature-uuid-here',
  p_vote_type: 'upvote'
});
// Result: { action: "removed", feature_id: "...", current_vote: null }

// Add downvote
const { data, error } = await supabase.rpc('toggle_vote', {
  p_feature_id: 'feature-uuid-here',
  p_vote_type: 'downvote'
});
// Result: { action: "added", feature_id: "...", current_vote: "downvote" }

// Change to upvote
const { data, error } = await supabase.rpc('toggle_vote', {
  p_feature_id: 'feature-uuid-here',
  p_vote_type: 'upvote'
});
// Result: { action: "changed", feature_id: "...", current_vote: "upvote" }
```

---

## 4. `add_comment`

Adds a comment to a feature.

### Function Signature

```sql
public.add_comment(
  p_feature_id UUID,
  p_comment_text TEXT
)
RETURNS UUID
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `p_feature_id` | UUID | Yes | Feature to comment on |
| `p_comment_text` | TEXT | Yes | Comment content (cannot be empty/whitespace) |

### Returns

- **UUID**: The ID of the newly created comment

### Validation

- ✅ User must be authenticated (`auth.uid()` must not be NULL)
- ✅ Comment text cannot be empty or only whitespace
- ✅ Feature must exist in the database
- ✅ Automatically sets `user_id` to current user
- ✅ Automatically sets `created_at` and `updated_at` timestamps

### Errors

- Raises exception if user not authenticated
- Raises exception if comment text is empty
- Raises exception if feature doesn't exist

### Example Usage

```javascript
const { data: commentId, error } = await supabase.rpc('add_comment', {
  p_feature_id: 'feature-uuid-here',
  p_comment_text: 'Great idea! Would love to see this implemented.'
});
```

---

## Security & Permissions

All functions use `SECURITY DEFINER` mode and respect Row Level Security (RLS) policies:

### Features Table
- **SELECT**: All authenticated users can read all features
- **INSERT**: Users can create features (automatically set as `created_by`)
- **UPDATE/DELETE**: Users can only modify their own features

### Feature Votes Table
- **SELECT**: All authenticated users can read all votes
- **INSERT**: Users can create votes (automatically set as `user_id`)
- **DELETE**: Users can only delete their own votes
- **Constraint**: One vote per user per feature (UNIQUE constraint)

### Feature Comments Table
- **SELECT**: All authenticated users can read all comments
- **INSERT**: Users can create comments (automatically set as `user_id`)
- **UPDATE/DELETE**: Users can only modify their own comments

---

## Testing

A comprehensive test suite is provided in `test-backend-api.js` covering:

- ✅ All 4 RPC functions
- ✅ Valid operations
- ✅ Error handling
- ✅ Concurrency safety
- ✅ Aggregation accuracy
- ✅ Edge cases

Run tests with:

```bash
npm install
npm test
```

See `BACKEND_TESTS.md` for detailed testing documentation.

---

## Database Schema Reference

### Tables

- `public.features` - Feature proposals
- `public.feature_votes` - User votes on features
- `public.feature_comments` - Comments on features

### Status Values

```sql
'proposed' | 'under_review' | 'approved' | 'in_progress' | 'completed' | 'rejected'
```

### Vote Types

```sql
'upvote' | 'downvote'
```

---

## Implementation Notes

### Why SECURITY DEFINER?

All functions use `SECURITY DEFINER` to ensure they run with elevated privileges while still respecting RLS policies. This allows:

1. Functions to access `auth.uid()` reliably
2. Controlled data access through function parameters
3. Enforcement of business logic in the database layer
4. Simplified client-side code (no need to handle complex queries)

### Concurrency Safety in toggle_vote

The `toggle_vote` function uses PostgreSQL's row-level locking to prevent race conditions:

```sql
SELECT vote_type INTO v_existing_vote
FROM public.feature_votes
WHERE feature_id = p_feature_id AND user_id = v_user_id
FOR UPDATE;
```

This ensures that if a user rapidly clicks vote buttons, the operations are serialized and processed in order, maintaining data integrity.

### Performance Considerations

- Indexes are created on all foreign keys and frequently queried columns
- Aggregations in `list_features` use efficient SQL GROUP BY
- `user_vote` subquery is optimized with indexed lookups
- Vote toggle uses minimal row locking (only user's own vote row)

---

## Next Steps (PART 6+)

1. **PART 6**: Frontend implementation plan
2. **PART 7**: Commit backend to GitHub
3. **PART 8**: Build Next.js frontend using these APIs
4. **PART 9**: Create pull request
5. **PART 10**: Critique and improvements
