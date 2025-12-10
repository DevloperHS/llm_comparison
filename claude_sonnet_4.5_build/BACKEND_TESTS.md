# Backend API Tests

Comprehensive test suite for the Team Feature Voting Board backend API (Supabase RPC functions).

## What's Tested

This test suite validates all 4 RPC functions created in **PART 5**:

1. **`create_feature`** - Create new feature proposals
   - Valid feature creation
   - Empty title rejection
   - Invalid status rejection

2. **`list_features`** - List features with aggregated data
   - List all features
   - Filter by status
   - Vote and comment count aggregation
   - User-specific vote display

3. **`toggle_vote`** - Vote on features
   - Add upvote
   - Add downvote
   - Toggle off (remove vote)
   - Change vote type (upvote ↔ downvote)
   - Invalid vote type rejection
   - Concurrency safety (rapid toggles)

4. **`add_comment`** - Comment on features
   - Add valid comments
   - Empty comment rejection
   - Invalid feature ID rejection

## Prerequisites

1. **Node.js** (v14 or higher)
2. **Supabase Project** - `team_feature_voting_board_db` (ref: lqkikfqhxhshikrvqeww)
3. **Supabase Keys** - Anon key or Service role key

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://lqkikfqhxhshikrvqeww.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
# OR use service role key (bypasses RLS):
# SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

**Getting your keys:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `team_feature_voting_board_db`
3. Go to Settings → API
4. Copy `anon` key or `service_role` key

### 3. Run Tests

```bash
# Using npm script
npm test

# Or directly
node test-backend-api.js

# Make executable and run
chmod +x test-backend-api.js
./test-backend-api.js
```

## Test Output

The test script provides detailed output for each test:

```
🚀 Starting Backend API Tests for Team Feature Voting Board

======================================================================
TEST 1: CREATE_FEATURE - Valid Feature
======================================================================
✅ PASS: Create feature with valid data
   Feature ID: 123e4567-e89b-12d3-a456-426614174000

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

## Test Coverage

| Test # | Function | Test Case | Expected Result |
|--------|----------|-----------|----------------|
| 1-3 | `create_feature` | Valid features | Creates 3 features with different statuses |
| 4-5 | `create_feature` | Error handling | Rejects empty title and invalid status |
| 6-7 | `list_features` | Listing & filtering | Returns all/filtered features with aggregations |
| 8-12 | `toggle_vote` | Vote operations | Add, remove, change votes + error handling |
| 13-16 | `add_comment` | Comment operations | Add comments + error handling |
| 17 | `list_features` | Aggregations | Verifies vote/comment counts are correct |
| 18 | `toggle_vote` | Concurrency | Tests SELECT FOR UPDATE lock safety |

## Key Features Tested

### Concurrency Safety (Test 18)
Tests the `toggle_vote` function's ability to handle concurrent operations safely using PostgreSQL's `SELECT FOR UPDATE` lock. Performs 5 simultaneous toggle operations and verifies data integrity.

### Aggregation Accuracy (Test 17)
Verifies that `list_features` correctly aggregates:
- Upvote count
- Downvote count
- Net votes (upvotes - downvotes)
- Comment count
- User's current vote

### Error Handling (Tests 4-5, 12, 15-16)
Validates that RPC functions properly reject:
- Empty/whitespace-only strings
- Invalid enum values (status, vote_type)
- Non-existent foreign key references

## Troubleshooting

### Authentication Errors

If you see authentication errors:

1. **Using Anon Key**: Make sure RLS policies are set up correctly. The test user needs to be authenticated.
2. **Using Service Role Key**: Set `SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_ANON_KEY` to bypass RLS.

### RLS Policy Errors

If tests fail with "permission denied" or "new row violates row-level security policy":

```bash
# Verify RLS is enabled and policies exist
# You can check in Supabase Dashboard → Authentication → Policies
```

The schema includes these RLS policies:
- `features`: Users can read all, but only modify their own
- `feature_votes`: Users can read all, but only create/delete their own
- `feature_comments`: Users can read all, but only modify their own

### Connection Errors

If you can't connect to Supabase:

1. Verify `SUPABASE_URL` is correct
2. Check your internet connection
3. Verify the Supabase project is active (not paused)

## Files Structure

```
.
├── test-backend-api.js     # Main test script
├── package.json            # Node.js dependencies
├── .env.example           # Environment variables template
├── .env                   # Your credentials (gitignored)
└── BACKEND_TESTS.md       # This file
```

## Next Steps

After running these tests successfully:

1. **PART 6**: Define frontend implementation plan
2. **PART 7**: Commit backend code to GitHub
3. **PART 8**: Implement frontend with Next.js
4. **PART 9**: Create pull request
5. **PART 10**: Critique and improvement plan

## Support

For issues with:
- **Supabase setup**: Check [Supabase Documentation](https://supabase.com/docs)
- **Test failures**: Review test output and verify database schema (PART 4)
- **RPC functions**: Verify functions exist in Supabase Dashboard → Database → Functions
