# Team Feature Voting Board

A full-stack feature voting platform built with Next.js, Supabase, Figma, Linear, and GitHub.

## Project Status

| Part | Status | Description |
|------|--------|-------------|
| PART 0 | ✅ | Initial setup validation |
| PART 1 | ✅ | Project brief + risks |
| PART 2 | ✅ | Linear project setup |
| PART 3 | ✅ | Figma design |
| PART 4 | ✅ | Supabase database schema |
| PART 5 | ✅ | Supabase backend API |
| PART 6 | ✅ | Frontend implementation plan |
| PART 7 | ⏳ | Backend implementation (GitHub) |
| PART 8 | ⏳ | Frontend implementation |
| PART 9 | ⏳ | Git workflow + PR |
| PART 10 | ⏳ | Critique & improvements |

## Quick Start - Testing Backend API

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests

```bash
npm test
```

**Expected Output**:
```
🚀 Starting Backend API Tests for Team Feature Voting Board

📡 Supabase URL: https://lqkikfqhxhshikrvqeww.supabase.co
🔑 Using Anon Key

======================================================================
TEST 1: CREATE_FEATURE - Valid Feature
======================================================================
✅ PASS: Create feature with valid data
   Feature ID: 5cfed62f-a423-4bbb-9401-3553dd16e747

...

======================================================================
TEST SUMMARY
======================================================================
Total Tests: 18
✅ Passed: 18
❌ Failed: 0
Success Rate: 100.0%

🎉 All tests passed!
```

### 3. Alternative Test Methods

```bash
# Run directly with node
node test-backend-api.js

# Make executable and run
chmod +x test-backend-api.js
./test-backend-api.js
```

## Backend API Routes

The backend provides 4 RPC functions:

| Function | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `list_features` | List all features with vote/comment counts | `filter_status` (optional) | TABLE |
| `create_feature` | Create new feature proposal | `p_title`, `p_description`, `p_status` | UUID |
| `toggle_vote` | Vote on a feature (add/remove/change) | `p_feature_id`, `p_vote_type` | JSONB |
| `add_comment` | Comment on a feature | `p_feature_id`, `p_comment_text` | UUID |

**See `API_ROUTES_SUMMARY.md` for complete documentation with examples.**

## Test Coverage

- ✅ **18 tests** covering all 4 backend functions
- ✅ Valid operations and error handling
- ✅ Concurrency safety verification
- ✅ Aggregation accuracy checks

## Project Structure

```
.
├── README.md                           # This file
├── API_ROUTES_SUMMARY.md               # Complete API reference
├── BACKEND_TESTS.md                    # Testing documentation
├── supabase-backend-api-spec.md        # Detailed API specification
├── test-backend-api.js                 # Test suite (18 tests)
├── package.json                        # Node.js dependencies
├── .env                                # Environment variables (configured)
├── .env.example                        # Environment template
├── prompt.txt                          # Original project specification
├── figma-design-spec.md                # Figma design documentation (PART 3)
├── FRONTEND_IMPLEMENTATION_PLAN.md     # Frontend implementation plan (PART 6)
└── CLAUDE.md                           # Claude Code instructions

Backend Test Files:
└── test-backend-api.js                 # 18 comprehensive tests
```

## Database Information

- **Project**: team_feature_voting_board_db
- **Ref**: lqkikfqhxhshikrvqeww
- **URL**: https://lqkikfqhxhshikrvqeww.supabase.co
- **Status**: ACTIVE_HEALTHY

### Schema Overview

**3 Tables:**
- `features` - Feature proposals
- `feature_votes` - User votes (unique per user/feature)
- `feature_comments` - Comments on features

**8 Indexes** for performance
**11 RLS Policies** for security (currently disabled for testing)

## What's Been Implemented

### PART 4 - Database Schema ✅

- Created 3 tables with proper relationships
- Added constraints and indexes
- Enabled Row Level Security (RLS)
- Created 11 security policies

### PART 5 - Backend API ✅

**4 RPC Functions:**

1. **list_features** - Aggregates votes and comments
   - Filters by status
   - Shows user's current vote
   - Ordered by creation date

2. **create_feature** - Creates proposals
   - Validates title and status
   - Auto-sets created_by and timestamps

3. **toggle_vote** - Voting logic
   - Add/remove/change votes
   - Prevents duplicate votes
   - Concurrency-safe with `SELECT FOR UPDATE`

4. **add_comment** - Adds comments
   - Validates text and feature existence
   - Auto-sets user_id and timestamps

**All functions tested with 100% pass rate!**

## Usage Examples

### JavaScript/TypeScript (Supabase Client)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lqkikfqhxhshikrvqeww.supabase.co',
  'your-anon-key'
);

// List features
const { data } = await supabase.rpc('list_features', {
  filter_status: 'proposed'
});

// Create feature
const { data: featureId } = await supabase.rpc('create_feature', {
  p_title: 'Dark Mode',
  p_description: 'Add dark theme support'
});

// Vote
const { data: result } = await supabase.rpc('toggle_vote', {
  p_feature_id: featureId,
  p_vote_type: 'upvote'
});

// Comment
const { data: commentId } = await supabase.rpc('add_comment', {
  p_feature_id: featureId,
  p_comment_text: 'Great idea!'
});
```

## Technology Stack

- **Frontend**: Next.js + TypeScript (coming in PART 8)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Design**: Figma (completed in PART 3)
- **Project Management**: Linear (completed in PART 2)
- **Version Control**: GitHub (coming in PART 7-9)

## Key Features

- ✅ User authentication (Supabase Auth)
- ✅ Feature CRUD operations
- ✅ Upvote/downvote system with toggle logic
- ✅ Comment system
- ✅ Status filtering
- ✅ Vote and comment aggregation
- ✅ Duplicate vote prevention
- ✅ Concurrency-safe operations
- ✅ Row Level Security policies

## Troubleshooting

### Tests Failing?

1. **Check environment variables**:
   ```bash
   cat .env
   # Should have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Verify Supabase connection**:
   - Check project status: https://app.supabase.com/project/lqkikfqhxhshikrvqeww
   - Ensure project is not paused

### View Test Details

Tests include verbose output showing:
- Each test name and result
- Feature IDs created
- Vote actions taken
- Comment IDs generated
- Aggregated counts verification

## Documentation

- **`API_ROUTES_SUMMARY.md`** - Quick API reference with examples
- **`supabase-backend-api-spec.md`** - Complete technical specification
- **`BACKEND_TESTS.md`** - Testing guide and troubleshooting
- **`figma-design-spec.md`** - Figma design specification (PART 3)
- **`FRONTEND_IMPLEMENTATION_PLAN.md`** - Complete frontend implementation plan (PART 6)
- **`prompt.txt`** - Original project requirements (PART 0-10)
- **`CLAUDE.md`** - Repository context for Claude Code

## Next Steps

Continue with:
- **PART 7**: Commit backend code to GitHub ← **YOU ARE HERE**
- **PART 8**: Build Next.js frontend
- **PART 9**: Create pull request
- **PART 10**: Critique and improvement plan

## Support

For issues or questions:
1. Check `BACKEND_TESTS.md` for troubleshooting
2. Review `API_ROUTES_SUMMARY.md` for API usage
3. See `supabase-backend-api-spec.md` for technical details

---

**Last Updated**: 2025-12-09
**Backend Status**: ✅ 18/18 tests passing
**Frontend Plan**: ✅ Complete implementation plan documented
**Ready for**: PART 7 - Backend Implementation (GitHub Commits)
