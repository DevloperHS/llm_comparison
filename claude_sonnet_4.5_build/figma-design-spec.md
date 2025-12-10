# Team Feature Voting Board - Figma Design Specification

**Project:** team_feature_voting_board
**Figma File:** mWEn1LduyP32s3YT2hY97T
**Date:** 2025-12-09
**Design System:** TailwindCSS-compatible tokens

---

## 1. PAGE STRUCTURE & HIERARCHY

### Page 1: List Board (Main View)
**Purpose:** Display all feature proposals with filtering and navigation

**Frames:**
- `Frame: Desktop - List Board (1440x900)`
  - Header with logo, search, user profile
  - Filter tabs: All | Proposed | In Progress | Completed | Rejected
  - Feature grid (3 columns on desktop, 2 on tablet, 1 on mobile)
  - Floating action button: "Create Feature"
  - Empty state illustration
  - Loading skeleton state

- `Frame: Tablet - List Board (768x1024)`
  - 2-column grid layout
  - Collapsible filter menu

- `Frame: Mobile - List Board (375x812)`
  - Single column layout
  - Bottom navigation
  - Sticky filter bar

**Node Structure:**
```
List Board Page
├── Header Component
├── Filter Bar Component
├── Feature Grid Container
│   ├── FeatureCard Component (repeated)
│   ├── FeatureCard Component
│   └── ...
├── FAB: Create Feature Button
└── States
    ├── Empty State
    └── Loading State
```

---

### Page 2: Feature Detail (Single Feature View)
**Purpose:** Display full feature details with voting and comments

**Frames:**
- `Frame: Desktop - Feature Detail (1440x900)`
  - Breadcrumb navigation
  - Feature header (title, status badge, metadata)
  - Vote section (upvote/downvote buttons with count)
  - Description section
  - Comments section with input
  - Loading spinner for actions
  - Error toast notification

- `Frame: Tablet - Feature Detail (768x1024)`
  - Single column scrollable layout

- `Frame: Mobile - Feature Detail (375x812)`
  - Sticky vote bar at bottom
  - Collapsed description (expandable)

**Node Structure:**
```
Feature Detail Page
├── Breadcrumb Navigation
├── Feature Header
│   ├── Title (h1)
│   ├── StatusBadge Component
│   └── Metadata (author, date)
├── Vote Section
│   ├── VoteButton Component (Upvote)
│   ├── Vote Count Display
│   └── VoteButton Component (Downvote)
├── Description Section
├── Comments Section
│   ├── CommentView Component (repeated)
│   ├── CommentView Component
│   └── CommentInput Component
└── States
    ├── Loading Overlay
    └── Error Toast
```

---

### Page 3: Create Feature (Modal/Form)
**Purpose:** Form to create new feature proposals

**Frames:**
- `Frame: Modal - Create Feature (600x700)`
  - Modal overlay (backdrop)
  - Modal container with shadow
  - Form fields:
    - Title input
    - Description textarea
    - Status dropdown
  - Action buttons: Cancel | Create
  - Validation error states

- `Frame: Mobile - Create Feature (375x812)`
  - Full-screen modal
  - Bottom action bar

**Node Structure:**
```
Create Feature Modal
├── Modal Backdrop (overlay)
└── Modal Container
    ├── Modal Header
    │   ├── Title: "Create Feature"
    │   └── Close Button
    ├── Form Body
    │   ├── Input Component (Title)
    │   ├── Input Component (Description - multiline)
    │   └── Input Component (Status - dropdown)
    ├── Form Footer
    │   ├── Button: Cancel (secondary)
    │   └── Button: Create (primary)
    └── States
        ├── Validation Error State
        └── Submit Loading State
```

---

## 2. REUSABLE COMPONENTS

### Component 1: FeatureCard
**ID:** `component_feature_card`
**Purpose:** Display feature proposal summary in grid view

**Variants:**
- Default
- Hover
- Selected
- Voted (user has voted)

**Properties:**
- title: String
- description: String (truncated)
- status: Enum (proposed | in-progress | completed | rejected)
- voteCount: Number
- commentCount: Number
- author: String
- createdAt: Date
- userHasVoted: Boolean

**Structure:**
```
FeatureCard (320x240)
├── Card Container (border, shadow, rounded)
├── StatusBadge Component (top-right)
├── Title (h3, 2-line truncate)
├── Description (body, 3-line truncate)
├── Footer
│   ├── Vote Count (icon + number)
│   ├── Comment Count (icon + number)
│   └── Author Avatar + Name
└── States
    ├── Hover (elevated shadow)
    └── Voted (accent border)
```

**Design Tokens:**
- Background: `bg-white dark:bg-gray-800`
- Border: `border border-gray-200 dark:border-gray-700`
- Shadow: `shadow-sm hover:shadow-md`
- Padding: `p-4`
- Gap: `gap-3`

---

### Component 2: VoteButton
**ID:** `component_vote_button`
**Purpose:** Upvote/downvote interaction button

**Variants:**
- Upvote (default)
- Upvote (active - user voted)
- Downvote (default)
- Downvote (active - user voted)
- Disabled (loading)

**Properties:**
- type: Enum (upvote | downvote)
- active: Boolean
- count: Number
- disabled: Boolean

**Structure:**
```
VoteButton (48x48 circular)
├── Button Container (rounded-full)
├── Icon (chevron-up or chevron-down)
└── States
    ├── Active (filled background, accent color)
    ├── Hover (light background)
    └── Disabled (opacity-50, no pointer)
```

**Design Tokens:**
- Default: `bg-gray-100 text-gray-600`
- Active Upvote: `bg-green-500 text-white`
- Active Downvote: `bg-red-500 text-white`
- Hover: `hover:bg-gray-200`
- Size: `w-12 h-12`

---

### Component 3: StatusBadge
**ID:** `component_status_badge`
**Purpose:** Visual indicator of feature status

**Variants:**
- Proposed (blue)
- In Progress (yellow)
- Completed (green)
- Rejected (red)

**Properties:**
- status: Enum (proposed | in-progress | completed | rejected)

**Structure:**
```
StatusBadge (auto-width x 24px)
├── Badge Container (rounded-full, px-3 py-1)
└── Status Text (uppercase, text-xs, font-medium)
```

**Design Tokens:**
- Proposed: `bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`
- In Progress: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`
- Completed: `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
- Rejected: `bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`

---

### Component 4: Input
**ID:** `component_input`
**Purpose:** Text input for forms

**Variants:**
- Text (single-line)
- Textarea (multi-line)
- Dropdown (select)
- Error (validation failed)

**Properties:**
- label: String
- placeholder: String
- value: String
- error: String (error message)
- required: Boolean

**Structure:**
```
Input Component (100% width x auto height)
├── Label (text-sm, font-medium)
├── Input Field
│   ├── Border (focus ring on interaction)
│   └── Placeholder text
├── Error Message (text-xs, text-red-600)
└── States
    ├── Default
    ├── Focus (ring-2 ring-blue-500)
    ├── Error (border-red-500, ring-red-500)
    └── Disabled (opacity-60, cursor-not-allowed)
```

**Design Tokens:**
- Background: `bg-white dark:bg-gray-900`
- Border: `border border-gray-300 dark:border-gray-600`
- Focus Ring: `focus:ring-2 focus:ring-blue-500`
- Padding: `px-3 py-2`
- Font: `text-base`

---

### Component 5: CommentView
**ID:** `component_comment_view`
**Purpose:** Display user comment with metadata

**Variants:**
- Default
- Own Comment (highlighted, with delete button)

**Properties:**
- author: String
- avatarUrl: String
- commentText: String
- createdAt: Date
- isOwnComment: Boolean

**Structure:**
```
CommentView (100% width x auto height)
├── Header
│   ├── Avatar (32x32 rounded-full)
│   ├── Author Name (font-medium)
│   ├── Timestamp (text-sm, text-gray-500)
│   └── Delete Button (if isOwnComment)
├── Comment Body (text-base, whitespace-pre-wrap)
└── Divider (border-b)
```

**Design Tokens:**
- Background: `bg-transparent`
- Own Comment BG: `bg-blue-50 dark:bg-blue-900/20`
- Padding: `p-4`
- Gap: `gap-2`

---

## 3. STATE VARIATIONS

### Empty State
**Page:** List Board
**Trigger:** No features exist

**Content:**
- Illustration: Empty box or lightbulb icon (200x200)
- Heading: "No features yet"
- Subtext: "Be the first to propose a feature!"
- CTA Button: "Create First Feature"

**Structure:**
```
Empty State (centered)
├── Illustration SVG
├── Heading (text-2xl, font-semibold)
├── Subtext (text-gray-600)
└── CTA Button (primary style)
```

---

### Loading State (Skeleton)
**Pages:** List Board, Feature Detail
**Trigger:** Data fetching in progress

**Content:**
- FeatureCard Skeleton: Animated gray rectangles mimicking card structure
- Detail Skeleton: Animated placeholders for title, description, comments

**Design Tokens:**
- Background: `bg-gray-200 dark:bg-gray-700`
- Animation: `animate-pulse`

**Structure:**
```
Loading Skeleton
├── Skeleton Card (repeated 6x)
│   ├── Rectangle (title, h-6 w-3/4)
│   ├── Rectangle (description, h-4 w-full)
│   ├── Rectangle (description, h-4 w-5/6)
│   └── Footer Rectangles (circles for avatars, h-4 w-1/4)
```

---

### Error State
**Pages:** All pages
**Trigger:** API failure, network error, validation error

**Content:**
- Toast Notification (top-right corner)
  - Error icon (red)
  - Error message text
  - Dismiss button

**Structure:**
```
Error Toast (auto-width x 64px)
├── Toast Container (bg-red-50, border-red-500)
├── Error Icon (text-red-600)
├── Message Text (text-sm)
└── Close Button
```

**Design Tokens:**
- Background: `bg-red-50 dark:bg-red-900/20`
- Border: `border-l-4 border-red-500`
- Padding: `p-4`
- Animation: `slide-in-right`

---

## 4. DESIGN TOKENS (Tailwind-Compatible)

### Colors
```js
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',  // Main brand blue
    600: '#2563eb',
    700: '#1d4ed8',
  },
  success: {
    500: '#10b981',  // Green for completed, upvotes
    600: '#059669',
  },
  danger: {
    500: '#ef4444',  // Red for rejected, downvotes
    600: '#dc2626',
  },
  warning: {
    500: '#f59e0b',  // Yellow for in-progress
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    800: '#1f2937',
    900: '#111827',
  }
}
```

### Typography
```js
fontSize: {
  xs: '0.75rem',     // 12px - badges, captions
  sm: '0.875rem',    // 14px - metadata, secondary text
  base: '1rem',      // 16px - body text
  lg: '1.125rem',    // 18px - subheadings
  xl: '1.25rem',     // 20px - card titles
  '2xl': '1.5rem',   // 24px - page headings
  '3xl': '1.875rem', // 30px - hero text
}

fontWeight: {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}
```

### Spacing
```js
spacing: {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
}
```

### Shadows
```js
boxShadow: {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
}
```

### Border Radius
```js
borderRadius: {
  DEFAULT: '0.375rem', // 6px - default for cards
  md: '0.5rem',        // 8px - larger elements
  lg: '0.75rem',       // 12px - modals
  full: '9999px',      // circular buttons, avatars
}
```

---

## 5. COMPONENT IDs (For Implementation Reference)

**Note:** Since Figma file creation via API is not supported, these are logical IDs for the specification:

| Component | Specification ID | Description |
|-----------|------------------|-------------|
| **FeatureCard** | `COMP_FEATURE_CARD_001` | Grid item displaying feature summary |
| **VoteButton** | `COMP_VOTE_BTN_002` | Upvote/downvote circular button |
| **StatusBadge** | `COMP_STATUS_BADGE_003` | Status indicator pill |
| **Input** | `COMP_INPUT_004` | Text input with label and validation |
| **CommentView** | `COMP_COMMENT_005` | Comment display with avatar |
| **Modal Container** | `COMP_MODAL_006` | Reusable modal wrapper |
| **Button Primary** | `COMP_BTN_PRIMARY_007` | Primary action button |
| **Button Secondary** | `COMP_BTN_SECONDARY_008` | Secondary action button |
| **Avatar** | `COMP_AVATAR_009` | User profile picture (32px circular) |
| **LoadingSkeleton** | `COMP_SKELETON_010` | Animated loading placeholder |
| **EmptyState** | `COMP_EMPTY_011` | Empty state illustration + CTA |
| **ErrorToast** | `COMP_ERROR_TOAST_012` | Error notification toast |

---

## 6. PAGE HIERARCHY SUMMARY

```
team_feature_voting_board (Figma File)
│
├── 📄 Page: List Board
│   ├── 🖼️ Frame: Desktop (1440x900)
│   ├── 🖼️ Frame: Tablet (768x1024)
│   ├── 🖼️ Frame: Mobile (375x812)
│   └── 🎨 States: Empty, Loading
│
├── 📄 Page: Feature Detail
│   ├── 🖼️ Frame: Desktop (1440x900)
│   ├── 🖼️ Frame: Tablet (768x1024)
│   ├── 🖼️ Frame: Mobile (375x812)
│   └── 🎨 States: Loading, Error
│
├── 📄 Page: Create Feature Modal
│   ├── 🖼️ Frame: Modal (600x700)
│   ├── 🖼️ Frame: Mobile Full-screen (375x812)
│   └── 🎨 States: Validation Error, Submit Loading
│
└── 📦 Components Page (Library)
    ├── FeatureCard (with variants)
    ├── VoteButton (with variants)
    ├── StatusBadge (with variants)
    ├── Input (with variants)
    ├── CommentView
    ├── Modal Container
    ├── Buttons (Primary, Secondary)
    ├── Avatar
    ├── LoadingSkeleton
    ├── EmptyState
    └── ErrorToast
```

---

## 7. IMPLEMENTATION NOTES

### For Frontend Developers:
1. Use this spec to implement components in React + TailwindCSS
2. Component props match the "Properties" sections above
3. Design tokens are Tailwind-compatible (copy to `tailwind.config.js`)
4. Mobile breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1440px`

### For Designers:
1. Implement this structure in Figma manually
2. Use Auto Layout for responsive components
3. Create component variants as specified
4. Publish components as a library for team use

### Responsive Behavior:
- **Desktop (1440px+)**: 3-column feature grid
- **Tablet (768px-1439px)**: 2-column feature grid, collapsible filters
- **Mobile (<768px)**: 1-column stack, bottom navigation, sticky vote bar

---

## 8. ACCESSIBILITY REQUIREMENTS

- All interactive elements must have `:focus-visible` states
- Color contrast ratio minimum: 4.5:1 (WCAG AA)
- Use semantic HTML in implementation (not div soup)
- Vote buttons must have `aria-label` (e.g., "Upvote feature")
- Status badges must have `aria-label` for screen readers
- Empty states must have meaningful `alt` text on illustrations
- Form inputs must have associated `<label>` elements
- Error messages must be announced to screen readers

---

**Design Specification Complete**
**Ready for:** Manual Figma implementation or direct frontend development
