# Team Feature Voting Board - Frontend

A modern, responsive Next.js application for team feature voting and collaboration.

## Features

- **Feature Management**: Create, view, and track feature proposals
- **Voting System**: Upvote/downvote features with real-time vote counts
- **Comments**: Discuss features with team members
- **Status Filtering**: Filter features by status (Proposed, Planned, In Progress, Completed, Rejected)
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Optimistic UI**: Instant feedback for user interactions
- **Type-Safe**: Full TypeScript support with Supabase types

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State Management**: React Hooks
- **Testing**: Jest + React Testing Library
- **Notifications**: react-hot-toast

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Environment variables configured

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these values from your Supabase project settings:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key

### 3. Database Setup

Ensure the Supabase database migrations are applied:

```bash
# From the backend/migrations directory
# Run each SQL file in order:
# 001_create_tables.sql
# 002_create_indexes.sql
# 003_enable_rls.sql
# 004_create_rpc_functions.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check
```

### 6. Build for Production

```bash
npm run build
npm start
```

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

## Testing

Tests are organized by component/feature:

```bash
# Run specific test file
npm test Button.test.tsx

# Run with coverage
npm test -- --coverage
```

## Performance Optimizations

- Server-side rendering with Next.js App Router
- Optimistic UI updates for instant feedback
- Efficient data fetching with custom hooks
- Memoized components to prevent unnecessary re-renders
- Lazy loading for images and heavy components

## Authentication

The application uses Supabase Auth. Users need to be authenticated to:
- Create features
- Vote on features
- Add comments

Authentication state is managed through the `useAuth` hook.

## Error Handling

- All API calls include error handling
- User-friendly error messages via toast notifications
- Graceful fallbacks for loading and error states
- Form validation with inline error messages

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the production bundle and deploy the `.next` folder:

```bash
npm run build
```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Troubleshooting

### "Missing Supabase environment variables" error
- Ensure `.env.local` file exists with correct values
- Restart the development server after adding env vars

### Database connection issues
- Verify Supabase project is active
- Check that RLS policies are properly configured
- Ensure migrations are applied in order

### Type errors
- Run `npm run type-check` to identify issues
- Ensure TypeScript version matches project requirements

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Run tests and type-check
5. Submit a pull request

## License

MIT
