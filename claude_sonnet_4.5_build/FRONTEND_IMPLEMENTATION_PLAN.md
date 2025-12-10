# PART 6 - Frontend Implementation Plan
# Team Feature Voting Board

**Project:** team_feature_voting_board
**Framework:** Next.js 14+ (App Router) + TypeScript
**UI Library:** React 18+ with TailwindCSS
**Backend:** Supabase (PostgreSQL + Auth + RLS)
**Date:** 2025-12-09

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Routes & Navigation](#2-routes--navigation)
3. [Data Loading Strategy](#3-data-loading-strategy)
4. [State Management](#4-state-management)
5. [Core Components (TypeScript)](#5-core-components-typescript)
6. [Security Best Practices](#6-security-best-practices)
7. [Testing Strategy](#7-testing-strategy)
8. [Performance Optimization](#8-performance-optimization)
9. [File Structure](#9-file-structure)
10. [Implementation Checklist](#10-implementation-checklist)

---

## 1. Architecture Overview

### Tech Stack

```
Frontend:
├── Next.js 14+ (App Router with RSC - React Server Components)
├── TypeScript 5+ (strict mode enabled)
├── React 18+ (with Suspense, Server Components)
├── TailwindCSS 3+ (utility-first styling)
├── Supabase JS Client 2.39+ (realtime, auth, RPC)
├── React Hook Form (form management)
├── Zod (runtime validation)
└── Framer Motion (animations - optional)

Testing:
├── Vitest (unit tests)
├── React Testing Library (component tests)
├── Playwright (e2e tests)
└── MSW (API mocking)

Development:
├── ESLint + Prettier (code quality)
├── Husky (pre-commit hooks)
└── TypeScript strict mode
```

### Design Principles

1. **Security First**: XSS prevention, CSRF protection, RLS enforcement
2. **Performance**: Code splitting, lazy loading, optimistic updates
3. **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation
4. **Responsive**: Mobile-first, progressive enhancement
5. **Type Safety**: End-to-end TypeScript, no `any` types
6. **Error Handling**: Graceful degradation, user-friendly messages

---

## 2. Routes & Navigation

### Route Structure (Next.js App Router)

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx              # Login page
│   └── layout.tsx                # Auth layout (centered, no nav)
│
├── (dashboard)/
│   ├── layout.tsx                # Main layout (with header, nav)
│   ├── page.tsx                  # → "/" - Feature list (List Board)
│   ├── features/
│   │   ├── [id]/
│   │   │   └── page.tsx          # → "/features/:id" - Feature detail
│   │   └── new/
│   │       └── page.tsx          # → "/features/new" - Create feature (optional, can be modal)
│   └── loading.tsx               # Loading UI (skeleton)
│
├── api/                          # API routes (if needed for server actions)
│   └── webhooks/
│       └── route.ts              # Supabase webhooks (optional)
│
├── layout.tsx                    # Root layout (providers, fonts)
├── error.tsx                     # Global error boundary
└── not-found.tsx                 # 404 page
```

### Route Details

| Route | Purpose | Rendering | Auth Required |
|-------|---------|-----------|---------------|
| `/` | Feature list with filters | SSR (Server Component) | ✅ Yes |
| `/features/[id]` | Feature detail with comments | SSR (Server Component) | ✅ Yes |
| `/login` | Authentication | CSR (Client Component) | ❌ No |

**Note:** Create feature modal will be implemented as a client-side modal (not a route) for better UX.

### Navigation Flow

```
User Flow:
┌─────────────┐
│   /login    │ (if not authenticated)
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│     / (Feature List)            │
│  - View all features            │
│  - Filter by status             │
│  - Click "Create Feature" (modal)│
└─────────────┬───────────────────┘
              │
              ↓ (click feature card)
┌─────────────────────────────────┐
│  /features/[id] (Detail)        │
│  - View full description        │
│  - Vote (upvote/downvote)       │
│  - Add comments                 │
│  - Navigate back                │
└─────────────────────────────────┘
```

---

## 3. Data Loading Strategy

### Server Components vs Client Components

#### Server Components (RSC) ✅

Use for:
- Initial data fetching (features list, feature detail)
- Static content rendering
- Reducing JavaScript bundle size

**Benefits:**
- Zero JavaScript sent to client
- Direct database access (via Supabase server client)
- Better SEO
- Faster initial load

#### Client Components ⚛️

Use for:
- Interactive components (forms, modals, vote buttons)
- State management (filters, optimistic updates)
- Real-time subscriptions (Supabase realtime)
- Animations

### Data Fetching Patterns

#### 1. Feature List (Home Page - SSR)

```typescript
// app/(dashboard)/page.tsx (Server Component)
import { createServerClient } from '@/lib/supabase/server';

export default async function HomePage({ searchParams }: {
  searchParams: { status?: string }
}) {
  const supabase = createServerClient();

  // Fetch data server-side
  const { data: features, error } = await supabase.rpc('list_features', {
    filter_status: searchParams.status || null
  });

  if (error) throw error;

  return <FeatureList initialFeatures={features} />;
}
```

**Strategy:**
- Server-side initial load (fast first paint)
- Client-side hydration for interactivity
- Optimistic updates for filters
- Real-time subscriptions for live updates (optional)

#### 2. Feature Detail (Dynamic Route - SSR)

```typescript
// app/(dashboard)/features/[id]/page.tsx (Server Component)
import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function FeatureDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createServerClient();

  // Fetch feature details
  const { data: features } = await supabase.rpc('list_features', {
    filter_status: null
  });

  const feature = features?.find(f => f.id === params.id);
  if (!feature) notFound();

  // Fetch comments separately (better caching)
  const { data: comments } = await supabase
    .from('feature_comments')
    .select('*')
    .eq('feature_id', params.id)
    .order('created_at', { ascending: true });

  return <FeatureDetail feature={feature} initialComments={comments} />;
}

// Generate static params for common features (optional ISR)
export async function generateStaticParams() {
  const supabase = createServerClient();
  const { data: features } = await supabase.rpc('list_features', {
    filter_status: null
  });

  return features?.slice(0, 10).map((feature) => ({
    id: feature.id,
  })) || [];
}
```

**Strategy:**
- SSR for initial load (SEO-friendly)
- Incremental Static Regeneration (ISR) for popular features
- Client-side mutations for votes and comments
- Optimistic updates for instant feedback

#### 3. Mutations (Client-Side Actions)

```typescript
// Client-side mutation with optimistic update
'use client';

import { useOptimistic } from 'react';

async function handleVote(featureId: string, voteType: 'upvote' | 'downvote') {
  // Optimistic update (instant UI feedback)
  setOptimisticVote(voteType);

  try {
    const { data, error } = await supabase.rpc('toggle_vote', {
      p_feature_id: featureId,
      p_vote_type: voteType
    });

    if (error) throw error;

    // Revalidate server data
    router.refresh();
  } catch (error) {
    // Rollback optimistic update
    setOptimisticVote(null);
    toast.error('Failed to vote. Please try again.');
  }
}
```

**Strategy:**
- Optimistic updates for instant feedback
- Error handling with rollback
- Server revalidation after mutation
- Toast notifications for errors

### Caching Strategy

```typescript
// Next.js cache configuration
export const revalidate = 60; // Revalidate every 60 seconds (ISR)

// Supabase cache configuration
const supabase = createClient(url, key, {
  global: {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=120'
    }
  }
});
```

**Cache Layers:**
1. **Browser Cache**: 60s for list queries
2. **Next.js Cache**: ISR with 60s revalidation
3. **CDN Cache**: Vercel Edge Network (if deployed)
4. **On-Demand Revalidation**: After mutations

---

## 4. State Management

### Global State (Minimal)

**Approach:** React Context + Server State Library

```typescript
// Use Zustand for client-side global state (lightweight)
// lib/store/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  session: Session | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  }
}));
```

**What to Store Globally:**
- ✅ User authentication state
- ✅ Theme preference (dark/light mode)
- ❌ **NOT** feature data (use server state)
- ❌ **NOT** UI state (use local state)

### Local State (Component-Level)

```typescript
// Use React hooks for component state
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);
```

### Server State (React Query Alternative)

**Approach:** Use Next.js built-in caching + `router.refresh()`

```typescript
// No external library needed - leverage Next.js cache
import { useRouter } from 'next/navigation';

function FeatureList({ initialFeatures }) {
  const router = useRouter();

  const refreshData = () => {
    router.refresh(); // Revalidate server components
  };

  return <>{/* UI */}</>;
}
```

### Form State (React Hook Form + Zod)

```typescript
// Use React Hook Form for complex forms
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createFeatureSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['proposed', 'under_review', 'approved', 'in_progress', 'completed', 'rejected'])
});

type CreateFeatureInput = z.infer<typeof createFeatureSchema>;

function CreateFeatureForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateFeatureInput>({
    resolver: zodResolver(createFeatureSchema),
    defaultValues: {
      status: 'proposed'
    }
  });

  const onSubmit = async (data: CreateFeatureInput) => {
    // Submit to Supabase RPC
  };

  return <form onSubmit={handleSubmit(onSubmit)}>{/* fields */}</form>;
}
```

---

## 5. Core Components (TypeScript)

### Type Definitions

```typescript
// types/database.ts
export interface Feature {
  id: string;
  title: string;
  description: string | null;
  status: 'proposed' | 'under_review' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  created_by: string;
  created_at: string;
  updated_at: string;
  upvote_count: number;
  downvote_count: number;
  net_votes: number;
  comment_count: number;
  user_vote: 'upvote' | 'downvote' | null;
}

export interface Comment {
  id: string;
  feature_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

export interface VoteResult {
  action: 'added' | 'removed' | 'changed';
  feature_id: string;
  current_vote: 'upvote' | 'downvote' | null;
}

export type FeatureStatus = Feature['status'];
```

### Component Specifications

#### 1. FeatureCard Component

```typescript
// components/features/FeatureCard.tsx
'use client';

import { Feature } from '@/types/database';
import { StatusBadge } from './StatusBadge';
import { VoteCount } from './VoteCount';
import Link from 'next/link';

interface FeatureCardProps {
  feature: Feature;
  className?: string;
  onClick?: () => void;
}

export function FeatureCard({ feature, className, onClick }: FeatureCardProps) {
  const hasVoted = feature.user_vote !== null;

  return (
    <Link
      href={`/features/${feature.id}`}
      className={cn(
        "block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        "rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200",
        hasVoted && "border-blue-500 dark:border-blue-400",
        className
      )}
      onClick={onClick}
    >
      {/* Status Badge - Top Right */}
      <div className="flex items-start justify-between mb-3">
        <StatusBadge status={feature.status} />
      </div>

      {/* Title - 2 line truncate */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
        {feature.title}
      </h3>

      {/* Description - 3 line truncate */}
      <p className="text-base text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
        {feature.description || 'No description provided.'}
      </p>

      {/* Footer - Votes & Comments */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <VoteCount
          upvotes={feature.upvote_count}
          downvotes={feature.downvote_count}
          netVotes={feature.net_votes}
          userVote={feature.user_vote}
        />
        <CommentCount count={feature.comment_count} />
      </div>
    </Link>
  );
}
```

#### 2. VoteButton Component

```typescript
// components/features/VoteButton.tsx
'use client';

import { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { createClientClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface VoteButtonProps {
  featureId: string;
  voteType: 'upvote' | 'downvote';
  isActive: boolean;
  disabled?: boolean;
  onVoteSuccess?: () => void;
}

export function VoteButton({
  featureId,
  voteType,
  isActive,
  disabled = false,
  onVoteSuccess
}: VoteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientClient();

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside Link
    e.stopPropagation();

    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('toggle_vote', {
        p_feature_id: featureId,
        p_vote_type: voteType
      });

      if (error) throw error;

      // Show success feedback
      if (data.action === 'added') {
        toast.success(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'}!`);
      } else if (data.action === 'removed') {
        toast.info('Vote removed');
      } else if (data.action === 'changed') {
        toast.success('Vote changed');
      }

      // Revalidate server data
      router.refresh();
      onVoteSuccess?.();

    } catch (error) {
      console.error('Vote error:', error);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = voteType === 'upvote' ? ChevronUpIcon : ChevronDownIcon;

  return (
    <button
      type="button"
      onClick={handleVote}
      disabled={disabled || isLoading}
      aria-label={`${voteType === 'upvote' ? 'Upvote' : 'Downvote'} feature`}
      className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        isActive && voteType === 'upvote' && "bg-green-500 text-white focus:ring-green-500",
        isActive && voteType === 'downvote' && "bg-red-500 text-white focus:ring-red-500",
        !isActive && "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
        (disabled || isLoading) && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon className={cn("w-6 h-6", isLoading && "animate-pulse")} />
    </button>
  );
}
```

#### 3. StatusBadge Component

```typescript
// components/features/StatusBadge.tsx
import { FeatureStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: FeatureStatus;
  className?: string;
}

const statusConfig: Record<FeatureStatus, { label: string; className: string }> = {
  proposed: {
    label: 'Proposed',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide",
        config.className,
        className
      )}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
```

#### 4. CreateFeatureModal Component

```typescript
// components/features/CreateFeatureModal.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { createClientClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const createFeatureSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['proposed', 'under_review', 'approved', 'in_progress', 'completed', 'rejected'])
});

type CreateFeatureInput = z.infer<typeof createFeatureSchema>;

interface CreateFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFeatureModal({ isOpen, onClose }: CreateFeatureModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClientClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateFeatureInput>({
    resolver: zodResolver(createFeatureSchema),
    defaultValues: {
      status: 'proposed'
    }
  });

  const onSubmit = async (data: CreateFeatureInput) => {
    setIsSubmitting(true);

    try {
      const { data: featureId, error } = await supabase.rpc('create_feature', {
        p_title: data.title,
        p_description: data.description || null,
        p_status: data.status
      });

      if (error) throw error;

      toast.success('Feature created successfully!');
      reset();
      onClose();
      router.refresh();
      router.push(`/features/${featureId}`);

    } catch (error: any) {
      console.error('Create feature error:', error);
      toast.error(error.message || 'Failed to create feature');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Feature Proposal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <Input
            label="Title"
            placeholder="Feature title"
            required
            error={errors.title?.message}
            {...register('title')}
          />

          {/* Description */}
          <Textarea
            label="Description"
            placeholder="Describe your feature proposal..."
            rows={6}
            error={errors.description?.message}
            {...register('description')}
          />

          {/* Status */}
          <Select
            label="Status"
            error={errors.status?.message}
            {...register('status')}
          >
            <option value="proposed">Proposed</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </Select>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Feature'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

#### 5. CommentList Component

```typescript
// components/features/CommentList.tsx
'use client';

import { useState } from 'react';
import { Comment } from '@/types/database';
import { CommentView } from './CommentView';
import { CommentForm } from './CommentForm';

interface CommentListProps {
  featureId: string;
  initialComments: Comment[];
}

export function CommentList({ featureId, initialComments }: CommentListProps) {
  const [comments, setComments] = useState(initialComments);

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [...prev, newComment]);
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <CommentForm featureId={featureId} onCommentAdded={handleCommentAdded} />

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map(comment => (
            <CommentView key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}
```

---

## 6. Security Best Practices

### 1. XSS Prevention

**Strategy:** Sanitize all user input, use React's built-in escaping

```typescript
// ✅ SAFE - React automatically escapes
<p>{feature.description}</p>

// ❌ DANGEROUS - Never use dangerouslySetInnerHTML with user content
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE - Use DOMPurify if HTML rendering is needed
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

**Implementation:**
- ✅ All user inputs are validated with Zod schemas
- ✅ React's JSX escapes content by default
- ✅ No `dangerouslySetInnerHTML` for user content
- ✅ Content Security Policy headers in `next.config.js`

### 2. CSRF Protection

**Strategy:** Use Supabase's built-in CSRF protection + SameSite cookies

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

### 3. Authentication & Authorization

**Strategy:** Enforce auth at multiple layers

```typescript
// middleware.ts - Enforce auth at edge
import { createServerClient } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createServerClient(request);

  const { data: { session } } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico).*)']
};
```

**Enforcement Layers:**
1. **Edge Middleware**: Redirect unauthenticated users
2. **Server Components**: Check `auth.getUser()` before rendering
3. **RLS Policies**: Enforce at database level (already configured in PART 4)
4. **Client Components**: Check `session` before rendering sensitive UI

### 4. Input Validation

**Strategy:** Validate on client AND server

```typescript
// Shared validation schema (use in both client and server)
// lib/validations/feature.ts
import { z } from 'zod';

export const createFeatureSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .trim()
    .optional(),
  status: z.enum(['proposed', 'under_review', 'approved', 'in_progress', 'completed', 'rejected'])
});

// Client-side validation (React Hook Form)
const form = useForm({
  resolver: zodResolver(createFeatureSchema)
});

// Server-side validation (Server Action)
export async function createFeature(input: unknown) {
  const validated = createFeatureSchema.parse(input); // Throws if invalid
  // ... proceed with database operation
}
```

### 5. SQL Injection Prevention

**Strategy:** Use Supabase RPC functions (parameterized queries)

```typescript
// ✅ SAFE - RPC functions use parameterized queries
await supabase.rpc('create_feature', {
  p_title: userInput // Safely parameterized
});

// ❌ DANGEROUS - Never construct raw SQL from user input
// (This is not possible with Supabase client, but shown for awareness)
await supabase.rpc('raw_sql', {
  query: `SELECT * FROM features WHERE title = '${userInput}'` // DON'T DO THIS
});
```

### 6. Rate Limiting

**Strategy:** Implement rate limiting for mutations

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true
});

// Use in server actions
export async function createFeature(input: CreateFeatureInput) {
  const { success } = await ratelimit.limit(`create_feature_${session.user.id}`);

  if (!success) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // ... proceed with creation
}
```

### 7. Environment Variables

**Strategy:** Separate public and private keys

```bash
# .env.local
# Public keys (safe to expose to client)
NEXT_PUBLIC_SUPABASE_URL=https://lqkikfqhxhshikrvqeww.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Private keys (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # NEVER expose to client
```

**Rules:**
- ✅ Use `NEXT_PUBLIC_` prefix for client-side variables
- ✅ Never commit `.env.local` to Git
- ✅ Use Vercel environment variables for production
- ❌ Never expose service role key to client

---

## 7. Testing Strategy

### Unit Tests (Vitest + React Testing Library)

**Coverage Target:** 80%+ for components

```typescript
// __tests__/components/FeatureCard.test.tsx
import { render, screen } from '@testing-library/react';
import { FeatureCard } from '@/components/features/FeatureCard';

const mockFeature = {
  id: '123',
  title: 'Test Feature',
  description: 'Test description',
  status: 'proposed' as const,
  upvote_count: 5,
  downvote_count: 2,
  net_votes: 3,
  comment_count: 10,
  user_vote: null,
  created_by: 'user-123',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
};

describe('FeatureCard', () => {
  it('renders feature title and description', () => {
    render(<FeatureCard feature={mockFeature} />);

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(<FeatureCard feature={mockFeature} />);

    expect(screen.getByText('Proposed')).toBeInTheDocument();
  });

  it('displays vote and comment counts', () => {
    render(<FeatureCard feature={mockFeature} />);

    expect(screen.getByText('5')).toBeInTheDocument(); // upvotes
    expect(screen.getByText('2')).toBeInTheDocument(); // downvotes
    expect(screen.getByText('10')).toBeInTheDocument(); // comments
  });

  it('highlights card if user has voted', () => {
    const votedFeature = { ...mockFeature, user_vote: 'upvote' as const };
    const { container } = render(<FeatureCard feature={votedFeature} />);

    expect(container.firstChild).toHaveClass('border-blue-500');
  });
});
```

### Integration Tests (API Mocking with MSW)

```typescript
// __tests__/integration/features.test.tsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureList } from '@/components/features/FeatureList';

const server = setupServer(
  rest.post('/rest/v1/rpc/list_features', (req, res, ctx) => {
    return res(ctx.json([mockFeature]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('FeatureList Integration', () => {
  it('fetches and displays features', async () => {
    render(<FeatureList />);

    await waitFor(() => {
      expect(screen.getByText('Test Feature')).toBeInTheDocument();
    });
  });

  it('filters features by status', async () => {
    render(<FeatureList />);

    const filterButton = screen.getByText('Proposed');
    await userEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText('Test Feature')).toBeInTheDocument();
    });
  });
});
```

### End-to-End Tests (Playwright)

```typescript
// e2e/features.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Voting Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');
    await page.waitForURL('/');
  });

  test('should create a new feature', async ({ page }) => {
    // Open create modal
    await page.click('text=Create Feature');

    // Fill form
    await page.fill('[name=title]', 'E2E Test Feature');
    await page.fill('[name=description]', 'This is a test feature');
    await page.selectOption('[name=status]', 'proposed');

    // Submit
    await page.click('button[type=submit]');

    // Verify redirect to detail page
    await expect(page).toHaveURL(/\/features\/.+/);
    await expect(page.locator('h1')).toContainText('E2E Test Feature');
  });

  test('should vote on a feature', async ({ page }) => {
    await page.goto('/features/123');

    // Click upvote button
    await page.click('button[aria-label="Upvote feature"]');

    // Verify toast notification
    await expect(page.locator('text=Upvoted!')).toBeVisible();

    // Verify button is now active
    await expect(page.locator('button[aria-label="Upvote feature"]')).toHaveClass(/bg-green-500/);
  });

  test('should add a comment', async ({ page }) => {
    await page.goto('/features/123');

    // Type comment
    await page.fill('[placeholder="Add a comment..."]', 'This is a test comment');
    await page.click('button:has-text("Post Comment")');

    // Verify comment appears
    await expect(page.locator('text=This is a test comment')).toBeVisible();
  });
});
```

### Test Coverage Requirements

| Area | Target Coverage | Tools |
|------|----------------|-------|
| **Unit Tests** | 80%+ | Vitest + React Testing Library |
| **Integration Tests** | 70%+ | MSW + React Testing Library |
| **E2E Tests** | Critical paths | Playwright |
| **Type Safety** | 100% | TypeScript strict mode |

**Critical Paths for E2E:**
1. Login flow
2. Create feature
3. Vote on feature
4. Add comment
5. Filter features

---

## 8. Performance Optimization

### 1. Code Splitting

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const CreateFeatureModal = dynamic(() => import('@/components/features/CreateFeatureModal'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Client-side only
});

const CommentList = dynamic(() => import('@/components/features/CommentList'), {
  loading: () => <CommentListSkeleton />
});
```

### 2. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={user.avatar_url}
  alt={user.name}
  width={32}
  height={32}
  className="rounded-full"
  loading="lazy"
/>
```

### 3. Suspense Boundaries

```typescript
// app/(dashboard)/page.tsx
import { Suspense } from 'react';
import { FeatureListSkeleton } from '@/components/features/FeatureListSkeleton';

export default function HomePage() {
  return (
    <Suspense fallback={<FeatureListSkeleton />}>
      <FeatureList />
    </Suspense>
  );
}
```

### 4. Debounced Search

```typescript
// Use debounce for search input
import { useDebouncedCallback } from 'use-debounce';

const handleSearch = useDebouncedCallback((query: string) => {
  setSearchQuery(query);
}, 300);
```

### 5. Virtual Scrolling (for large lists)

```typescript
// Use react-virtual for long lists
import { useVirtual } from '@tanstack/react-virtual';

function FeatureList({ features }: { features: Feature[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtual({
    size: features.length,
    parentRef,
    estimateSize: () => 240, // FeatureCard height
    overscan: 5
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div style={{ height: `${rowVirtualizer.totalSize}px` }}>
        {rowVirtualizer.virtualItems.map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <FeatureCard feature={features[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. Bundle Analysis

```bash
# Add to package.json scripts
"analyze": "ANALYZE=true next build"

# Install bundle analyzer
npm install @next/bundle-analyzer
```

**Performance Targets:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

---

## 9. File Structure

```
team-feature-voting-board/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── features/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── api/
│   │   └── webhooks/
│   │       └── route.ts
│   ├── error.tsx
│   ├── layout.tsx
│   └── not-found.tsx
│
├── components/
│   ├── features/
│   │   ├── FeatureCard.tsx
│   │   ├── FeatureList.tsx
│   │   ├── FeatureDetail.tsx
│   │   ├── VoteButton.tsx
│   │   ├── VoteCount.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── CreateFeatureModal.tsx
│   │   ├── CommentList.tsx
│   │   ├── CommentView.tsx
│   │   ├── CommentForm.tsx
│   │   └── FilterBar.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Dialog.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── Toast.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── Footer.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Client-side Supabase client
│   │   ├── server.ts           # Server-side Supabase client
│   │   └── middleware.ts       # Middleware Supabase client
│   ├── validations/
│   │   ├── feature.ts
│   │   └── comment.ts
│   ├── utils.ts
│   └── cn.ts                   # classnames utility
│
├── types/
│   ├── database.ts             # Database types
│   └── supabase.ts             # Generated Supabase types
│
├── hooks/
│   ├── useAuth.ts
│   ├── useFeatures.ts
│   └── useOptimistic.ts
│
├── __tests__/
│   ├── components/
│   ├── integration/
│   └── e2e/
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vitest.config.ts
└── playwright.config.ts
```

---

## 10. Implementation Checklist

### Phase 1: Foundation (Day 1-2)

- [ ] **Initialize Next.js 14 project**
  ```bash
  npx create-next-app@latest team-feature-voting-board --typescript --tailwind --app
  ```
- [ ] **Install dependencies**
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install react-hook-form @hookform/resolvers zod
  npm install sonner # Toast notifications
  npm install @heroicons/react # Icons
  npm install zustand # State management
  ```
- [ ] **Setup Supabase clients** (client, server, middleware)
- [ ] **Configure TypeScript** (strict mode, paths)
- [ ] **Setup TailwindCSS** (design tokens from Figma spec)
- [ ] **Create environment variables** (.env.local, .env.example)

### Phase 2: Authentication (Day 2-3)

- [ ] **Implement auth middleware** (edge protection)
- [ ] **Create login page** (Supabase Auth UI)
- [ ] **Setup auth context** (Zustand store)
- [ ] **Implement logout functionality**
- [ ] **Add session persistence**

### Phase 3: Core Components (Day 3-5)

- [ ] **Base UI components** (Button, Input, Textarea, Select, Dialog)
- [ ] **FeatureCard component** (with all variants)
- [ ] **VoteButton component** (with loading states)
- [ ] **StatusBadge component** (all status types)
- [ ] **CommentView component**
- [ ] **CommentForm component**
- [ ] **Loading skeletons** (FeatureCard, Detail)
- [ ] **Empty state component**
- [ ] **Error toast component**

### Phase 4: Pages (Day 5-7)

- [ ] **Home page (/)** - Feature list with SSR
- [ ] **Feature detail page (/features/[id])** - SSR with ISR
- [ ] **Create feature modal** - Client component
- [ ] **Layout components** (Header, Navigation)
- [ ] **404 page**
- [ ] **Error boundary**

### Phase 5: Functionality (Day 7-9)

- [ ] **Implement list_features RPC** (with filters)
- [ ] **Implement toggle_vote RPC** (with optimistic updates)
- [ ] **Implement add_comment RPC**
- [ ] **Implement create_feature RPC**
- [ ] **Filter by status** (client-side state)
- [ ] **Real-time subscriptions** (optional - for live updates)

### Phase 6: Security & Validation (Day 9-10)

- [ ] **Input validation** (Zod schemas on client + server)
- [ ] **XSS prevention** (sanitization, CSP headers)
- [ ] **CSRF protection** (middleware)
- [ ] **Rate limiting** (Upstash Redis)
- [ ] **Environment variable security**
- [ ] **RLS policy testing**

### Phase 7: Testing (Day 10-12)

- [ ] **Unit tests** (Vitest + RTL) - 80% coverage
- [ ] **Integration tests** (MSW mocking)
- [ ] **E2E tests** (Playwright) - critical paths
- [ ] **Type checking** (tsc --noEmit)
- [ ] **Accessibility testing** (axe-core)

### Phase 8: Optimization (Day 12-13)

- [ ] **Code splitting** (dynamic imports)
- [ ] **Image optimization** (Next.js Image)
- [ ] **Suspense boundaries** (loading states)
- [ ] **Bundle analysis** (@next/bundle-analyzer)
- [ ] **Lighthouse audit** (target: 90+ score)

### Phase 9: Polish (Day 13-14)

- [ ] **Dark mode support** (Tailwind dark: classes)
- [ ] **Responsive design** (mobile, tablet, desktop)
- [ ] **Accessibility audit** (WCAG 2.1 AA)
- [ ] **Error handling** (toast notifications)
- [ ] **Loading states** (skeletons, spinners)
- [ ] **Empty states** (illustrations, CTAs)

### Phase 10: Documentation (Day 14)

- [ ] **README.md** (setup instructions)
- [ ] **CONTRIBUTING.md** (contribution guidelines)
- [ ] **DEPLOYMENT.md** (deployment guide)
- [ ] **Component documentation** (Storybook - optional)
- [ ] **API integration docs** (how to use Supabase RPCs)

---

## Dependencies

```json
{
  "name": "team-feature-voting-board",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit",
    "analyze": "ANALYZE=true next build"
  },
  "dependencies": {
    "@heroicons/react": "^2.1.1",
    "@hookform/resolvers": "^3.3.4",
    "@supabase/ssr": "^0.0.10",
    "@supabase/supabase-js": "^2.39.0",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.3",
    "sonner": "^1.3.1",
    "zod": "^3.22.4",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^14.1.0",
    "@playwright/test": "^1.40.1",
    "@testing-library/react": "^14.1.2",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.1.0",
    "msw": "^2.0.11",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5",
    "vitest": "^1.1.0"
  }
}
```

---

## Environment Variables

```bash
# .env.example

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lqkikfqhxhshikrvqeww.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Rate limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Optional: Analytics
NEXT_PUBLIC_GA_TRACKING_ID=your-ga-id
```

---

## Next Steps (PART 7 Preparation)

After completing this implementation plan:

1. **Review and approve** this plan with stakeholders
2. **Setup development environment** (Node.js, npm, Git)
3. **Create GitHub repository** (will be done in PART 7)
4. **Begin implementation** (PART 8 - Frontend Implementation)

---

**=== END OF PART 6 ===**

**Status:** ✅ Frontend Implementation Plan Complete
**Next:** PART 7 - Backend Implementation (GitHub Commits)
