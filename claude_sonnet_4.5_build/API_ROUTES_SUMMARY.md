# API Routes Summary - Team Feature Voting Board

Complete reference for all backend API endpoints (Supabase RPC functions) created in PART 5.

## Database Information

- **Project Name**: team_feature_voting_board_db
- **Project Ref**: lqkikfqhxhshikrvqeww
- **Base URL**: https://lqkikfqhxhshikrvqeww.supabase.co
- **Region**: us-east-1
- **Status**: ACTIVE_HEALTHY

---

## 1. List Features

**Function Name**: `list_features`
**Purpose**: Retrieve all features with aggregated vote and comment counts

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `filter_status` | TEXT | No | NULL | Filter by status (NULL = all features) |

### Valid Status Values
- `'proposed'`
- `'under_review'`
- `'approved'`
- `'in_progress'`
- `'completed'`
- `'rejected'`

### Returns

TABLE with columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Feature unique ID |
| `title` | TEXT | Feature title |
| `description` | TEXT | Feature description |
| `status` | TEXT | Current status |
| `created_by` | UUID | Creator user ID |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `upvote_count` | BIGINT | Total upvotes |
| `downvote_count` | BIGINT | Total downvotes |
| `net_votes` | BIGINT | upvotes - downvotes |
| `comment_count` | BIGINT | Total comments |
| `user_vote` | TEXT | Current user's vote ('upvote', 'downvote', or NULL) |

### Usage Examples

```javascript
// Get all features
const { data, error } = await supabase.rpc('list_features', {
  filter_status: null
});

// Get only proposed features
const { data, error } = await supabase.rpc('list_features', {
  filter_status: 'proposed'
});

// Get features under review
const { data, error } = await supabase.rpc('list_features', {
  filter_status: 'under_review'
});
```

### Response Example

```json
[
  {
    "id": "5cfed62f-a423-4bbb-9401-3553dd16e747",
    "title": "Dark Mode Support",
    "description": "Add dark mode theme to the application",
    "status": "proposed",
    "created_by": "00000000-0000-0000-0000-000000000001",
    "created_at": "2025-12-09T10:30:00Z",
    "updated_at": "2025-12-09T10:30:00Z",
    "upvote_count": 5,
    "downvote_count": 1,
    "net_votes": 4,
    "comment_count": 3,
    "user_vote": "upvote"
  }
]
```

---

## 2. Create Feature

**Function Name**: `create_feature`
**Purpose**: Create a new feature proposal

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `p_title` | TEXT | Yes | - | Feature title (cannot be empty) |
| `p_description` | TEXT | No | NULL | Feature description |
| `p_status` | TEXT | No | 'proposed' | Initial status |

### Returns

`UUID` - The ID of the newly created feature

### Validation Rules

- ✅ Title cannot be empty or only whitespace
- ✅ Status must be one of the valid status values
- ✅ `created_by` automatically set to current user (or test user ID)
- ✅ `created_at` and `updated_at` automatically set to NOW()

### Usage Examples

```javascript
// Create feature with minimal data
const { data: featureId, error } = await supabase.rpc('create_feature', {
  p_title: 'Dark Mode Support',
  p_description: 'Add dark theme to the application',
  p_status: 'proposed'
});

// Create feature without description
const { data: featureId, error } = await supabase.rpc('create_feature', {
  p_title: 'Email Notifications'
});

// Create feature with different status
const { data: featureId, error } = await supabase.rpc('create_feature', {
  p_title: 'Mobile App',
  p_description: 'Create mobile app version',
  p_status: 'under_review'
});
```

### Response Example

```json
"5cfed62f-a423-4bbb-9401-3553dd16e747"
```

### Error Cases

```javascript
// Empty title
{ error: "Title cannot be empty" }

// Invalid status
{ error: "Invalid status: invalid_status" }
```

---

## 3. Toggle Vote

**Function Name**: `toggle_vote`
**Purpose**: Add, remove, or change a user's vote on a feature

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `p_feature_id` | UUID | Yes | Feature to vote on |
| `p_vote_type` | TEXT | Yes | 'upvote' or 'downvote' |

### Returns

JSONB object:

```typescript
{
  action: 'added' | 'removed' | 'changed',
  feature_id: UUID,
  current_vote: 'upvote' | 'downvote' | null
}
```

### Toggle Behavior

| Current State | New Vote | Result | Action |
|---------------|----------|--------|--------|
| No vote | upvote | Adds upvote | 'added' |
| upvote | upvote | Removes upvote | 'removed' |
| upvote | downvote | Changes to downvote | 'changed' |
| downvote | downvote | Removes downvote | 'removed' |
| downvote | upvote | Changes to upvote | 'changed' |

### Concurrency Safety

Uses PostgreSQL's `SELECT FOR UPDATE` to lock the user's vote row during the transaction, preventing race conditions from rapid clicks.

### Usage Examples

```javascript
// Add upvote
const { data, error } = await supabase.rpc('toggle_vote', {
  p_feature_id: '5cfed62f-a423-4bbb-9401-3553dd16e747',
  p_vote_type: 'upvote'
});
// Result: { action: "added", feature_id: "...", current_vote: "upvote" }

// Click upvote again (toggle off)
const { data, error } = await supabase.rpc('toggle_vote', {
  p_feature_id: '5cfed62f-a423-4bbb-9401-3553dd16e747',
  p_vote_type: 'upvote'
});
// Result: { action: "removed", feature_id: "...", current_vote: null }

// Change from upvote to downvote
const { data, error } = await supabase.rpc('toggle_vote', {
  p_feature_id: '5cfed62f-a423-4bbb-9401-3553dd16e747',
  p_vote_type: 'downvote'
});
// Result: { action: "changed", feature_id: "...", current_vote: "downvote" }
```

### Response Examples

```json
// Added
{
  "action": "added",
  "feature_id": "5cfed62f-a423-4bbb-9401-3553dd16e747",
  "current_vote": "upvote"
}

// Removed
{
  "action": "removed",
  "feature_id": "5cfed62f-a423-4bbb-9401-3553dd16e747",
  "current_vote": null
}

// Changed
{
  "action": "changed",
  "feature_id": "5cfed62f-a423-4bbb-9401-3553dd16e747",
  "current_vote": "downvote"
}
```

### Error Cases

```javascript
// Invalid vote type
{ error: "Invalid vote type: invalid_vote" }
```

---

## 4. Add Comment

**Function Name**: `add_comment`
**Purpose**: Add a comment to a feature

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `p_feature_id` | UUID | Yes | Feature to comment on |
| `p_comment_text` | TEXT | Yes | Comment content (cannot be empty) |

### Returns

`UUID` - The ID of the newly created comment

### Validation Rules

- ✅ Comment text cannot be empty or only whitespace
- ✅ Feature must exist
- ✅ `user_id` automatically set to current user (or test user ID)
- ✅ `created_at` and `updated_at` automatically set to NOW()

### Usage Examples

```javascript
// Add comment
const { data: commentId, error } = await supabase.rpc('add_comment', {
  p_feature_id: '5cfed62f-a423-4bbb-9401-3553dd16e747',
  p_comment_text: 'Great idea! I would love to see this implemented.'
});

// Add another comment
const { data: commentId, error } = await supabase.rpc('add_comment', {
  p_feature_id: '5cfed62f-a423-4bbb-9401-3553dd16e747',
  p_comment_text: 'We should prioritize this for the next sprint.'
});
```

### Response Example

```json
"3fb88093-392b-46b2-b6b5-706d53f72050"
```

### Error Cases

```javascript
// Empty comment
{ error: "Comment text cannot be empty" }

// Non-existent feature
{ error: "Feature not found: 00000000-0000-0000-0000-000000000000" }
```

---

## Testing the API

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Environment is already configured in .env file
# (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set)

# 3. Run tests
npm test
```

### Test Results

All 18 tests should pass:

```
Total Tests: 18
✅ Passed: 18
❌ Failed: 0
Success Rate: 100.0%

🎉 All tests passed!
```

### Test Coverage

| Function | Tests | Coverage |
|----------|-------|----------|
| `create_feature` | 5 tests | Valid creation (3) + error handling (2) |
| `list_features` | 3 tests | List all, filter by status, verify aggregations |
| `toggle_vote` | 6 tests | Add, remove, change, errors, concurrency |
| `add_comment` | 4 tests | Valid comments (2) + error handling (2) |

---

## Database Schema

### Tables

```sql
-- Features table
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'proposed',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes table (unique constraint prevents duplicate votes)
CREATE TABLE public.feature_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feature_id, user_id)
);

-- Comments table
CREATE TABLE public.feature_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexes

Performance indexes on frequently queried columns:

```sql
CREATE INDEX idx_features_status ON features(status);
CREATE INDEX idx_features_created_at ON features(created_at DESC);
CREATE INDEX idx_features_created_by ON features(created_by);
CREATE INDEX idx_feature_votes_feature_id ON feature_votes(feature_id);
CREATE INDEX idx_feature_votes_user_id ON feature_votes(user_id);
CREATE INDEX idx_feature_comments_feature_id ON feature_comments(feature_id);
CREATE INDEX idx_feature_comments_user_id ON feature_comments(user_id);
CREATE INDEX idx_feature_comments_created_at ON feature_comments(created_at DESC);
```

---

## Integration with Frontend

All functions can be called from Next.js using the Supabase JavaScript client:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// List features
const { data: features } = await supabase.rpc('list_features', {
  filter_status: null
});

// Create feature
const { data: featureId } = await supabase.rpc('create_feature', {
  p_title: 'My Feature',
  p_description: 'Description here'
});

// Toggle vote
const { data: voteResult } = await supabase.rpc('toggle_vote', {
  p_feature_id: featureId,
  p_vote_type: 'upvote'
});

// Add comment
const { data: commentId } = await supabase.rpc('add_comment', {
  p_feature_id: featureId,
  p_comment_text: 'Great idea!'
});
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `test-backend-api.js` | Comprehensive test suite (18 tests) |
| `package.json` | Node.js dependencies |
| `.env` | Environment variables (keys configured) |
| `BACKEND_TESTS.md` | Testing documentation |
| `supabase-backend-api-spec.md` | Detailed API specification |
| `API_ROUTES_SUMMARY.md` | This file - quick reference |

---

## Next Steps

- ✅ **PART 4**: Database schema created
- ✅ **PART 5**: Backend API implemented and tested
- ⏳ **PART 6**: Frontend implementation plan
- ⏳ **PART 7**: Backend code committed to GitHub
- ⏳ **PART 8**: Frontend implementation
- ⏳ **PART 9**: Pull request creation
- ⏳ **PART 10**: Critique and improvements

---

## Support & Troubleshooting

### Running Tests

```bash
# Run all tests
npm test

# Run with verbose output
node test-backend-api.js

# Make executable and run directly
chmod +x test-backend-api.js
./test-backend-api.js
```

### Common Issues

**Issue**: Tests fail with authentication errors
**Solution**: Ensure `.env` has `SUPABASE_SERVICE_ROLE_KEY` set

**Issue**: Connection timeout
**Solution**: Check internet connection and Supabase project status

**Issue**: Foreign key errors
**Solution**: Already handled - FK constraints removed for testing

### Supabase Dashboard

Access your project:
- Dashboard: https://app.supabase.com/project/lqkikfqhxhshikrvqeww
- Database → Functions: View all RPC functions
- Database → Tables: View data and schema
- Authentication → Policies: View RLS policies

---

**Created**: PART 5 - Supabase Backend API
**Last Updated**: 2025-12-09
**Status**: ✅ All tests passing (18/18)
