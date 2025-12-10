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
| PART 7 | ✅ | Backend implementation (GitHub) |
| PART 8 | ✅ | Frontend implementation |
| PART 9 | ✅ | Git workflow + PR |
| PART 10 | ✅ | Critique & improvements |

## Quick Start - The app

Clone the repo :
```
git clone https://github.com/DevloperHS/llm_comparison.git
```

### 1.  Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run 

```bash
npm run dev
```

Access it at localhost!

---

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── features/[id]/       # Feature detail page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (feature list)
│   └── globals.css          # Global styles
├── components/
│   ├── features/            # Feature-specific components
│   │   ├── CommentForm.tsx
│   │   ├── CommentList.tsx
│   │   ├── CreateFeatureModal.tsx
│   │   ├── FeatureCard.tsx
│   │   ├── FilterBar.tsx
│   │   └── VoteButton.tsx
│   └── ui/                  # Reusable UI components
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── LoadingSpinner.tsx
│       ├── Modal.tsx
│       ├── Select.tsx
│       └── Textarea.tsx
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useComments.ts
│   └── useFeatures.ts
├── lib/                     # Utility functions
│   ├── api.ts               # API client
│   └── supabase.ts          # Supabase client
├── types/                   # TypeScript types
│   ├── database.types.ts    # Supabase generated types
│   └── index.ts             # App-specific types
└── __tests__/               # Test files
    ├── components/
    └── lib/
```

## Key Components

### FeatureCard
Displays a feature with voting buttons, status badge, and comment count.

### VoteButton
Interactive voting component with upvote/downvote functionality.

### CreateFeatureModal
Modal form for creating new feature proposals with validation.

### CommentList & CommentForm
Display and add comments to features.

### FilterBar
Filter features by status and access the create feature modal.

## API Integration

All API calls are handled through the `FeatureAPI` class in `lib/api.ts`:

- `listFeatures(filterStatus?)` - Fetch all features with optional status filter
- `createFeature(input)` - Create a new feature
- `toggleVote(featureId, voteType)` - Toggle user vote on a feature
- `addComment(input)` - Add a comment to a feature
- `getComments(featureId)` - Fetch comments for a feature

## Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Mobile-specific optimizations:
- Touch-friendly buttons and form inputs
- Optimized spacing and typography
- Stack layout for smaller screens
- Collapsible sections where appropriate


