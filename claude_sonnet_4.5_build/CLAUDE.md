# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Context

This is a test/planning repository for the Composio Rube MCP integration. The primary artifact is `prompt.txt`, which contains a comprehensive specification for building a "Team Feature Voting Board" feature using Composio's MCP (Model Context Protocol) tools.

## MCP Tools Configuration

This repository is configured to use Rube MCP tools with pre-approved permissions:
- `mcp__rube__RUBE_SEARCH_TOOLS` is pre-authorized (see `.claude/settings.local.json`)

The specification in `prompt.txt` requires using MCP tools for:
- **Figma**: Design system and UI components
- **Linear**: Project management, epics, and tickets
- **Supabase**: Database schema, migrations, RLS policies, and backend API
- **GitHub**: Repository management, commits, and pull requests

## Workflow Execution Pattern

The `prompt.txt` file defines a strict 11-part sequential workflow (PART 0-10) for building the feature. When executing work based on this specification:

1. **Always use RUBE_SEARCH_TOOLS first** to discover available tools for each integration
2. **Never skip steps** - follow the PART 0 → PART 10 sequence strictly
3. **End each part** with the marker: `=== END OF PART X ===`
4. **Display reasoning** before executing actions
5. **Show all tool outputs** including tool used, command, and result

## Project Architecture (from specification)

**Tech Stack:**
- Frontend: Next.js + TypeScript
- Backend/Database: Supabase (PostgreSQL + Auth + RLS)
- Design: Figma
- Project Management: Linear
- Version Control: GitHub

**Core Features:**
- User authentication (Supabase Auth)
- Feature proposal CRUD operations
- Voting system (upvote/downvote with duplicate prevention)
- Commenting system
- Status filtering
- Optimistic UI updates

**Database Schema (to be created):**
- `features` table
- `feature_votes` table (with unique constraints per user)
- `feature_comments` table
- Row Level Security (RLS) policies required

## Key Execution Rules

When working with this specification:

1. **Autonomous execution**: Never ask the user to do manual work. If credentials/configs are missing, assume reasonable defaults and proceed.
2. **Error handling**: If access errors occur, reason through them and retry. Do not stop execution.
3. **No placeholders**: All implementations must be complete and functional.
4. **Tool-first approach**: Every action must use the appropriate MCP tool - no manual simulation or stubbing.
5. **Concurrency safety**: Vote operations must use transactions to prevent race conditions.

## Common Development Commands

Since this is a planning repository without implemented code yet, standard development commands will depend on the stack being created. Once the Next.js frontend is implemented, expect:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Supabase local development (if using)
supabase start
supabase db reset
```

## Integration Testing Strategy

Per the specification (PART 5), each Supabase RPC function must be tested through `rube_mcp` immediately after creation:
- `list_features` - with vote/comment aggregation
- `create_feature`
- `toggle_vote` - verify idempotency and transaction safety
- `add_comment`
