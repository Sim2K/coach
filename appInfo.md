# Pro UI Application Reference Guide

This document serves as a comprehensive reference for the Pro UI application architecture, components, and implementation details. It is maintained by Cascade AI to provide quick access to important information about the application's structure and functionality.

## Purpose
- Quick reference for application architecture and implementation details
- Centralized documentation for component configurations
- Easy lookup for file locations and component relationships
- Track important implementation decisions and configurations

## Table of Contents
1. [Navigation](#navigation)
2. [Components](#components)
3. [Styling](#styling)
4. [State Management](#state-management)
5. [Utils](#utils)
6. [Stripe Integration](#stripe-integration)
7. [Goals Page Mobile View](#goals-page-mobile-view)
8. [SMART Goals Integration](#smart-goals-integration)
9. [Goal and Milestone Dialogs](#goal-and-milestone-dialogs)
10. [Authentication and Configuration](#authentication-and-configuration)
11. [Database table structure](#database-table-structure)

---

## Navigation

### Menu System Overview
The application uses a responsive menu system implemented across two main components:
- Desktop: Sidebar (`components/sidebar.tsx`)
- Mobile: MobileMenu (`components/mobile-menu.tsx`)

#### Core Components
- **Sidebar**: Fixed desktop navigation
- **MobileMenu**: Responsive mobile navigation with overlay
- **Icons**: Imported from lucide-react library
- **UI Components**: Button from custom UI library

#### Menu Architecture

##### Desktop Sidebar
- Fixed width: w-64 (16rem)
- Position: Left side, full height (min-h-screen)
- Background: White with right border (bg-white border-r border-gray-200)
- Structure:
  1. Header Section (p-4)
     - Logo with Crosshair icon
     - App title
  2. Navigation Section
     - Scrollable menu items (space-y-1 pb-20)
     - Items mapped from menuItems array
  3. Bottom Section (fixed)
     - Special styling and positioning
     - Contains external links and logout

##### Mobile Menu
- Trigger: Hamburger menu button in top bar
- Full screen overlay with blur effect
- Structure:
  1. Top Bar (h-16)
     - Menu toggle button
     - Logo
  2. Overlay Menu
     - White background with blur (bg-white/95 backdrop-blur-sm)
     - Slide/fade transition
     - Full screen (fixed inset-0)
  3. Content Structure
     - Header with logo and close button
     - Scrollable menu items
     - Bottom section with special items

#### Menu Items Implementation
```typescript
const menuItems = [
  { name: "Profile", href: "/profile", Icon: UserIcon },
  { name: "Update Key", href: "/update-key", Icon: Key },
  { name: "Goals", href: "/goals", Icon: Target },
  { name: "Frameworks", href: "/soon-come", Icon: Crosshair },
  { name: "Settings", href: "/settings", Icon: Settings },
  { name: "Updates", href: "/updates", Icon: Bell },
  { name: "Preferences", href: "/soon-come", Icon: Heart }
]
```

#### Special Bottom Section
This section is styled and structured differently from regular menu items:

1. **Let's talk! Link** (Added 2024-12-22)
   - External link to https://GPTs4u.com/lifecoach
   - Opens in new tab (target="_blank")
   - Security attribute: rel="noopener noreferrer"
   - Purple theme styling:
     - Desktop: text-purple-600 hover:text-purple-700 hover:bg-purple-50
     - Mobile: Similar styling with adjusted padding
   - MessageSquare icon
   - Positioned above logout

2. **Logout Button**
   - Distinct red styling (text-red-600)
   - Red hover states (hover:text-red-700 hover:bg-red-50)
   - LogOut icon from lucide-react
   - Handles authentication logout via supabase
   - Programmatic navigation to login page

#### Styling Details
- **Regular Menu Items**
  - Active state: bg-purple-50 text-purple-600
  - Inactive state: text-gray-700 hover:bg-gray-50
  - Rounded corners: rounded-lg
  - Consistent padding: px-4 py-3
  - Icon + text layout with flex

- **Bottom Section**
  - Fixed positioning
  - Top border: border-t border-gray-200
  - White background
  - Full width of sidebar (w-64)
  - Consistent padding (p-4)

#### State Management
- Uses Next.js usePathname() for active route highlighting
- Mobile menu uses local state (useState) for open/close
- Authentication state handled through Supabase

#### Navigation Implementation
- Regular items: Next.js Link component for client-side routing
- External links: Standard a tags with security attributes
- Programmatic navigation: Next.js useRouter() for auth flows

#### Dependencies
- Icons: lucide-react
- Routing: next/navigation (usePathname, useRouter)
- UI Components: Custom Button component
- Authentication: Supabase client
- Notifications: Sonner toast

---

## Application Structure (Last Updated: 2024-12-25)

### 1. Navigation and Menu Structure
- **Main Menu Items**:
  ```typescript
  [
    { name: "Profile", href: "/profile", Icon: UserIcon },
    { name: "Update Key", href: "/update-key", Icon: Key },
    { name: "Goals", href: "/goals", Icon: Target },
    { name: "Frameworks", href: "/soon-come", Icon: Crosshair },
    { name: "Settings", href: "/settings", Icon: Settings },
    { name: "Updates", href: "/updates", Icon: Bell },
    { name: "Preferences", href: "/soon-come", Icon: Heart }
  ]
  ```
- **Menu Implementation**:
  - Single source of truth in `sidebar.tsx`
  - Shared between desktop sidebar and mobile menu
  - Mobile menu imports menu items from sidebar component
  - Responsive design: Hidden on mobile (md:flex for desktop)

### 2. Goals System Architecture

#### Database Schema
- **Goals Table**:
  ```sql
  goals (
    goal_id: uuid PRIMARY KEY,
    user_id: uuid REFERENCES auth.users,
    goal_description: text,
    goal_type: text,
    progress: integer,
    effort_level: integer,
    is_completed: boolean,
    review_needed: boolean
  )
  ```

#### Goals Page Structure
- **Main Components**:
  1. GoalsList (Left Panel - 1/3 width on desktop)
  2. GoalDetails (Right Panel - 2/3 width on desktop)
  3. SmartGoalDetails (Nested in GoalDetails)

#### Data Fetching Pattern
- **Initial Goals Query**:
  ```typescript
  const { data } = await supabase
    .from("goals")
    .select(`
      *,
      milestones:milestones(count),
      updates:updates(count),
      engagements:engagement(count),
      feedback:feedback(count)
    `)
    .eq("user_id", session.user.id);
  ```
- Efficient count aggregation using subqueries
- Counts available immediately in both list and detail views

#### Goal Type Definition
```typescript
type Goal = {
  goal_id: string;
  user_id: string;
  goal_description: string;
  goal_title: string;        // Required field for goal title
  goal_type?: string;
  target_date?: string;
  milestones?: { count: number }[];
  updates?: { count: number }[];
  engagements?: { count: number }[];
  feedback?: { count: number }[];
  count?: number;
  progress: number;
  effort_level: number;
  is_completed: boolean;
  review_needed?: boolean;
  review_previous_goal?: Partial<Goal>;
};
```

### 3. SMART Goals Framework

#### SmartGoal Type Definition
```typescript
interface SmartGoal {
  smart_id: string;
  specific: string | null;
  measurable: string | null;
  achievable: string | null;
  relevant: string | null;
  time_bound?: string | null;  // Optional, not shown in UI
  smart_progress: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
}
```

#### UI Components Structure
1. **Smart Goal Dialog**:
   - Form fields:
     - Specific (textarea)
     - Measurable (textarea)
     - Achievable (textarea)
     - Relevant (textarea)
     - Progress (slider)
     - Status (select)

2. **Smart Goal Details Display**:
   - Progress section (full width)
   - SMART criteria sections in grid layout
   - Status badge with color coding

#### Status Color Scheme
```typescript
const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-green-100 text-green-800',
  'On Hold': 'bg-gray-100 text-gray-800'
};
```

### 4. Responsive Design Structure

#### Desktop Layout
- Sidebar: Fixed width (w-64)
- Goals List: 1/3 width (w-1/3)
- Goal Details: 2/3 width (w-2/3)
- Maximize/Minimize capability for details panel

#### Mobile Layout
- Full-width design
- Toggle between list and details view
- Back button for navigation
- Hamburger menu for main navigation
- Sticky headers

### 5. State Management
- React useState for local component state
- Props drilling for component communication
- Supabase real-time updates not implemented
- Manual refetch patterns for data updates

### 6. Error Handling
- Toast notifications for user feedback
- Error boundaries not implemented
- Try-catch blocks in async operations
- Fallback UI for loading states

### 7. Performance Optimizations
- Efficient count queries using subqueries
- Lazy loading of details components
- Optimized re-renders using proper state management
- Responsive image loading

### 8. Security Measures
- Supabase RLS policies
- User session validation
- Protected routes
- Secure API endpoints

### 9. Accessibility Features
- ARIA labels
- Keyboard navigation
- Color contrast compliance
- Screen reader support

This documentation will be updated as new features are added or existing ones are modified.

---

## Record Backup System

### Goals and Milestones Backup
1. Record Backup Conditions:
   - Backup is only stored when `review_needed` is `false`
   - When a backup is stored, `review_needed` is set to `true`
   - Previous record data is stored in JSON format
   - Goals use `review_previous_goal` field for backup
   - Milestones use `review_previous_milestone` field for backup

2. Goal Backup Fields:
   ```typescript
   {
     goal_description: string;
     goal_type: string;
     target_date: string;
     progress: number;
     effort_level: number;
     is_completed: boolean;
     goal_title: string;
   }
   ```

3. Milestone Backup Fields:
   ```typescript
   {
     milestone_description: string;
     target_date: string;
     achieved: boolean;
     achievement_date: string | null;
   }
   ```

4. Backup Process:
   - Current state is captured before editing starts
   - Backup is stored only if the record is not under review
   - When backup is stored, record is marked for review
   - Backup is stored as a partial type of the original record

---

## Recent Updates (2024-12-31)

### Profile Page Updates

#### Account Status Section
- Renamed from "Account Settings" to "Account Status"
- Displays subscription and account status information
- All status indicators are read-only (no user modification allowed)

Components:
1. **Subscription End Date**
   - Shows user's subscription expiry date
   - Red background if subscription has expired
   - Date displayed in user's local format

2. **Active Status**
   - Shows "Active Status: Active" or "Active Status: Inactive"
   - Red background when inactive
   - Read-only status display
   - Removed user toggle switch
   - Status tied to subscription validity

3. **Induction Status**
   - Shows "Induction: Complete" or "Induction: Incomplete"
   - Read-only status display
   - Removed user toggle switch

4. **Last Login**
   - Updated to "Last Login with Ajay"
   - Shows timestamp in user's local format

### Activity Status Management

#### Client-Side Updates
- Immediate status updates after successful payment
- No page refresh required for status changes
- Periodic status checks (30-second intervals)
- Window focus triggers status refresh

#### Implementation Details
- Uses localStorage for persistent state
- Global isUserActive state for real-time updates
- Webhook updates database on payment success
- ActivityInitializer component manages status checks
- ActivityGuard enforces access based on status

---

## Goals Page Mobile View

### Layout Hierarchy
1. **Navigation Menu**
   - Fixed at top of screen
   - z-index: highest (above all content)
   - Height: 4rem (64px)

2. **Back Button**
   - Visible only on mobile (`block md:hidden`)
   - Sticky positioned below menu (`top-16`)
   - z-index: 40 (below menu, above content)
   - Background: white
   - Border bottom for visual separation
   - Padding: pt-4 pb-2 px-4
   - Negative margins (-mt-4 -mx-4) to align with parent padding
   - Only shows in goal details view

3. **Goal Title**
   - Positioned below back button
   - Top margin: mt-4 (mobile only)
   - Font: text-2xl, bold
   - Color: text-gray-900

### View States and Transitions
1. **Goals List View (Mobile)**
   - Full width when visible (`w-full`)
   - Hidden when showing details (`showDetailsOnMobile ? 'hidden md:block' : 'block'`)
   - Contains list of goals with click handlers

2. **Goal Details View (Mobile)**
   - Full width when visible (`w-full`)
   - Shows when goal selected (`showDetailsOnMobile` true)
   - Transition triggered by `onSelectGoal` in GoalsList
   - Back button triggers `setShowDetailsOnMobile(false)`

### Component Structure
1. **GoalsPage Component**
   - Manages view state with `showDetailsOnMobile`
   - Controls visibility of list vs details
   - Maintains maximized state for desktop

2. **GoalDetails Component**
   - Handles back navigation
   - Contains sticky back button
   - Manages edit/delete actions
   - Responsive layout with mobile-first design

### Mobile-Specific Classes
```css
/* Back Button Container */
.sticky.top-16.left-0.z-40.bg-white.-mt-4.-mx-4.px-4.pt-4.pb-2.block.md:hidden.border-b

/* Goals List Mobile */
.w-full.md:w-1/3.border-r.border-gray-200.bg-white.p-4.md:p-6

/* Goal Details Mobile */
.w-full.p-4.md:p-6.bg-white
```

### State Management
1. **View Transitions**
   ```typescript
   // Show details view
   onSelectGoal={(goal) => {
     setSelectedGoal(goal);
     setShowDetailsOnMobile(true);
   }}
   
   // Return to list view
   onBack={() => setShowDetailsOnMobile(false)}
   ```

2. **Visibility Control**
   ```typescript
   // List visibility
   `${showDetailsOnMobile ? 'hidden md:block' : 'block'}`
   
   // Details visibility
   `${!showDetailsOnMobile ? 'hidden' : 'block'} md:block`
   ```

### Responsive Breakpoints
- Mobile: Default styles
- Desktop: md: prefix (768px and above)
- Transitions between views only occur on mobile
- Desktop shows both views side by side

### Important Implementation Details
1. Back button must remain below fixed navigation
2. Content scrolls independently under sticky elements
3. Proper z-index layering ensures menu > back button > content
4. Negative margins on back button container align with parent padding
5. Mobile transitions maintain scroll position
6. Desktop view remains unaffected by mobile view states

---

## Stripe Integration

### Overview
The application implements a complete Stripe payment system with test and live environments, webhook handling, and database integration. The implementation supports multiple currencies and two payment types: "Worth" and "Afford".

### Directory Structure
```
/app/api/stripe/
├── create-session/
│   └── route.ts       # Handles checkout session creation
├── session-status/
│   └── route.ts       # Verifies payment status
└── webhook/
    └── route.ts       # Processes Stripe webhooks
/lib/stripe/
└── client.ts          # Client-side Stripe functions
/components/settings/billing-section/
└── payment-form.tsx   # Payment UI component
```

### Database Schema
```sql
CREATE TABLE public.payments (
    paymentid uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    issuccess boolean NOT NULL,
    status text NOT NULL,
    paymentstatus text NOT NULL,
    paymentintentstatus text NOT NULL,
    customeremail text NOT NULL,
    amount numeric NOT NULL,
    currency text NOT NULL,
    paymenttype text NOT NULL,
    timepaid timestamp without time zone NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    stripepaymentid text NULL,
    CONSTRAINT payments_pkey PRIMARY KEY (paymentid),
    CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES userprofile(user_id) ON DELETE CASCADE
);
```

### API Implementation Details

#### 1. Create Session Endpoint
```typescript
// /app/api/stripe/create-session/route.ts
export async function POST(request: Request) {
  // Request body structure
  interface CreateSessionRequest {
    currency: string;
    amount: number;
    paymentType: 'afford' | 'worth';
  }

  // Session creation configuration
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    submit_type: 'pay',
    billing_address_collection: 'auto',
    metadata: {
      paymentType,
      originalAmount: amount.toString(),
      currency,
      user_id: request.headers.get('x-user-id') || ''
    },
    line_items: [{
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: 'AI Coaching Subscription',
          description: `${paymentType === 'worth' ? 'Value-based' : 'Accessibility-based'} payment`,
        },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    }],
    success_url: `${origin}/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}&status=success`,
    cancel_url: `${origin}/settings?tab=billing&status=cancelled`,
  });
}
```

#### 2. Webhook Handler
```typescript
// /app/api/stripe/webhook/route.ts
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');
  
  // Event handling for successful payments
  case 'checkout.session.completed': {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Database record creation
    const { error } = await supabase
      .from("payments")
      .insert([{
        user_id: session.metadata?.user_id,
        issuccess: true,
        status: session.status,
        paymentstatus: session.payment_status,
        paymentintentstatus: 'succeeded',
        customeremail: session.customer_details?.email || '',
        amount: session.amount_total || 0,
        currency: session.currency,
        paymenttype: session.metadata?.paymentType?.toLowerCase() || '',
        stripepaymentid: session.payment_intent
      }]);
  }
}
```

#### 3. Session Status Endpoint
```typescript
// /app/api/stripe/session-status/route.ts
export async function GET(request: Request) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'subscription']
  });

  const isSuccess = 
    session.payment_status === 'paid' || 
    (session.payment_intent as Stripe.PaymentIntent)?.status === 'succeeded';

  return NextResponse.json({
    isSuccess,
    status: session.status,
    paymentStatus: session.payment_status,
    paymentIntentStatus: (session.payment_intent as Stripe.PaymentIntent)?.status,
    customerEmail: session.customer_details?.email,
    amount: session.amount_total,
    currency: session.currency,
    metadata: session.metadata,
  });
}
```

### Client-Side Implementation

#### 1. Stripe Client Functions
```typescript
// /lib/stripe/client.ts
export const createCheckoutSession = async (
  currency: string,
  amount: number,
  paymentType: 'afford' | 'worth'
): Promise<CheckoutSession> => {
  const { data: { session: userSession } } = await supabase.auth.getSession();
  
  const response = await fetch('/api/stripe/create-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userSession.user.id
    },
    body: JSON.stringify({
      currency,
      amount,
      paymentType,
    }),
  });
};
```

#### 2. Payment Form Component
```typescript
// /components/settings/billing-section/payment-form.tsx
export function BillingSection() {
  const currencies = [
    { code: "USD", symbol: "$", minAmount: 5, rate: 1 },
    { code: "GBP", symbol: "£", minAmount: 5, rate: 0.79 },
    { code: "EUR", symbol: "€", minAmount: 6, rate: 0.92 },
    { code: "CAD", symbol: "$", minAmount: 7, rate: 1.36 },
    { code: "AUD", symbol: "$", minAmount: 8, rate: 1.52 },
  ];

  // Form state
  const [currency, setCurrency] = useState<StripeCurrency>("USD");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("afford");
}
```

### Environment Detection
```typescript
// /lib/config/environment.ts
const isTestEnvironment = (hostname: string): boolean => {
  return hostname === 'sim2k.sytes.net' || 
         hostname.includes('localhost') || 
         hostname.includes('127.0.0.1');
};

const isLiveEnvironment = (hostname: string): boolean => {
  return hostname === 'coach.veedence.com';
};
```

### Webhook Configuration
1. **Test Environment**
   - URL: http://sim2k.sytes.net/api/stripe/webhook
   - Events: checkout.session.completed
   - API Version: 2024-12-18.acacia

2. **Production Environment**
   - URL: https://coach.veedence.com/api/stripe/webhook
   - Events: checkout.session.completed
   - API Version: 2024-12-18.acacia

### Type Definitions
```typescript
// /types/stripe.ts
export type StripeCurrency = 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';

export interface CreateSessionRequest {
  currency: string;
  amount: number;
  paymentType: 'afford' | 'worth';
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export type StripeSessionResponse = {
  isSuccess: boolean;
  status: 'complete' | 'expired' | 'open';
  paymentStatus: 'paid' | 'unpaid' | 'no_payment_required';
  paymentIntentStatus: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'canceled';
  customerEmail: string;
  amount: number;
  currency: string;
  metadata: StripeSessionMetadata;
};
```

---

## SMART Goals Integration

### Database Schema
```sql
create table smartgoals (
  smart_id uuid default uuid_generate_v4() primary key,
  goal_id uuid references goals(goal_id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  specific text,
  measurable text,
  achievable text,
  relevant text,
  time_bound date,
  smart_progress integer default 0,
  status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  review_needed boolean default false,
  review_previous_smart jsonb
);

-- Indexes
create index idx_smartgoals_goal_id on smartgoals(goal_id);
create index idx_smartgoals_user_id on smartgoals(user_id);
```

### Component Structure

#### 1. SmartGoalDialog (`components/goals/smart-goal-dialog.tsx`)
- **Purpose**: Create and edit SMART goal details
- **State Management**:
  ```typescript
  interface SmartGoal {
    smart_id: string;
    specific: string | null;
    measurable: string | null;
    achievable: string | null;
    relevant: string | null;
    time_bound: string | null;
    smart_progress: number;
    status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  }

  interface SmartGoalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    goalId: string;
    smartGoal: SmartGoal | null;
    onSmartGoalChange: () => void;
    previousSmartGoalData?: Partial<SmartGoal> | null;
  }
  ```

- **Layout**:
  - Max width: 600px
  - Two-column grid on desktop
  - Single column on mobile
  - Responsive padding: p-6
  - Form spacing: space-y-8
  - Grid gap: gap-8

- **Form Fields**:
  1. Specific:
     - Textarea component
     - Min height: 120px
     - Resizable vertically
     - Required field
     - 5 rows default
  2. Measurable:
     - Textarea component
     - Min height: 120px
     - Resizable vertically
     - Required field
     - 5 rows default
  3. Achievable:
     - Textarea component
     - Min height: 120px
     - Resizable vertically
     - Required field
     - 5 rows default
  4. Relevant:
     - Textarea component
     - Min height: 120px
     - Resizable vertically
     - Required field
     - 5 rows default
  5. Time-bound:
     - Date input
     - Height: 40px (h-10)
     - Required field
  6. Progress:
     - Slider component
     - Range: 0-100
     - Step: 1
  7. Status:
     - Select component
     - Options: Pending, In Progress, Completed, On Hold
     - Height: 40px (h-10)

- **Button Styling**:
  ```typescript
  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' }
  ];
  ```

#### 2. SmartGoalDetails (`components/goals/smart-goal-details.tsx`)
- **Purpose**: Display SMART goal details in an expanded view
- **Layout Structure**:
  1. Header Section:
     - Title: "SMART Details"
     - Status badge
     - Edit/Add button
     - Border bottom separator

  2. Progress Section:
     - Progress percentage
     - Progress bar (h-2)
     - Border bottom separator

  3. SMART Criteria Sections:
     - Divide-y separation
     - Each section:
       ```typescript
       {
         indicator: "h-8 w-1 rounded-full",
         title: "font-medium text-{color}-900",
         content: "pl-4 ml-3 border-l-2 border-{color}-100"
       }
       ```
     - Color scheme:
       - Specific: purple-600
       - Measurable: blue-600
       - Achievable: green-600
       - Relevant: orange-600
       - Time-bound: red-600

- **Status Colors**:
  ```typescript
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  ```

### Integration Points

1. **Goal Details Component**:
   ```typescript
   <SmartGoalDetails
     goalId={goal.goal_id}
     isEditing={isEditing}
     onUpdate={() => {
       fetchGoal();
       fetchSmartGoal();
     }}
   />
   ```

2. **Database Operations**:
   ```typescript
   // Fetch SMART goal
   const { data, error } = await supabase
     .from("smartgoals")
     .select("*")
     .eq("goal_id", goalId)
     .single();

   // Create SMART goal
   const { error } = await supabase
     .from("smartgoals")
     .insert([{
       ...formData,
       goal_id: goalId,
       user_id: session.user.id,
       review_needed: true
     }]);

   // Update SMART goal
   const { error } = await supabase
     .from("smartgoals")
     .update({
       ...formData,
       review_needed: true,
       review_previous_smart: previousSmartGoalData
     })
     .eq("smart_id", smartGoal.smart_id);
   ```

### Error Handling
1. **Session Validation**:
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   if (!session) {
     toast.error("Please sign in to continue");
     return;
   }
   ```

2. **Database Errors**:
   ```typescript
   try {
     // Database operations
   } catch (error: any) {
     toast.error(error.message || "Error saving SMART goal");
   }
   ```

### Mobile Considerations
1. **Dialog**:
   - Full-width on mobile
   - Single column layout
   - Touch-friendly inputs
   - Native date picker support
   - Minimum touch target size: 40px

2. **Details View**:
   - Responsive padding
   - Readable text size
   - Clear visual hierarchy
   - Adequate spacing for touch targets

### UI/UX Guidelines
1. **Typography**:
   - Headers: text-lg font-semibold
   - Labels: text-sm font-medium
   - Content: text-gray-600
   - Status: Badge component with color coding

2. **Spacing**:
   - Container: p-6
   - Between sections: space-y-6
   - Between form fields: space-y-2
   - Grid gap: gap-8 (desktop)

3. **Colors**:
   - Background: bg-card
   - Borders: border-gray-100
   - Text: text-gray-600
   - Accents: Various theme colors for SMART criteria

4. **Animations**:
   - Dialog transitions
   - Smooth progress bar updates
   - Button hover states
   - Focus states for form fields

### Best Practices
1. **Performance**:
   - Optimized re-renders
   - Efficient state updates
   - Proper cleanup
   - Memory management

2. **Accessibility**:
   - ARIA labels
   - Keyboard navigation
   - Focus management
   - Screen reader support

3. **Code Organization**:
   - Modular components
   - Clear interfaces
   - Consistent naming
   - Proper typing

4. **State Management**:
   - Local component state
   - Props for data passing
   - Callbacks for updates
   - Loading states

---

## Goal and Milestone Dialogs

### New Goal Dialog
1. **Component Location**: `components/goals/new-goal-dialog.tsx`

2. **Dialog Structure**
   - Max width: 425px on desktop (`sm:max-w-[425px]`)
   - Centered modal with overlay
   - Responsive padding and spacing

3. **Form Fields**
   - Description:
     - Textarea component
     - Min height: 120px
     - Resizable vertically
     - Required field
     - 5 rows default
   - Type:
     - Text input
     - Optional field
   - Target Date:
     - Date input
     - Optional field
   - Effort Level:
     - Slider component
     - Range: 1-5
     - Color-coded:
       ```typescript
       1: "#22c55e" // green
       2: "#86efac" // light green
       3: "#fbbf24" // orange (default)
       4: "#fb923c" // light red
       5: "#ef4444" // red
       ```

4. **State Management**
   ```typescript
   const [formData, setFormData] = useState({
     goal_description: "",
     goal_type: "",
     target_date: "",
     effort_level: 3
   });
   ```

5. **Error Handling**
   - Session validation
   - Database error handling
   - User feedback via toasts
   - Form validation

6. **Mobile Responsiveness**
   - Full-width on mobile
   - Maintains padding and spacing
   - Touch-friendly input areas
   - Keyboard-aware form fields

### Milestone Dialog
1. **Component Location**: `components/goals/milestone-dialog.tsx`

2. **Props Interface**
   ```typescript
   interface MilestoneDialogProps {
     open: boolean;
     onOpenChange: (open: boolean) => void;
     milestone: Milestone | null;
     goalId: string;
     onMilestoneChange: () => void;
     onMilestoneAdded?: () => void;
     previousMilestoneData: {
       milestone_description: string;
       target_date: string;
       achieved: boolean;
       achievement_date: string | null;
     } | null;
   }
   ```

3. **Form Fields**
   - Milestone Description:
     - Textarea component
     - Required field
     - Maintains previous value when editing
   - Target Date:
     - Date input
     - Required field
   - Achievement Status:
     - Switch component
     - Toggle between achieved/not achieved
   - Achievement Date:
     - Date input
     - Only visible when achieved is true
     - Optional field

4. **State Management**
   ```typescript
   const [formData, setFormData] = useState({
     milestone_description: "",
     target_date: "",
     achieved: false,
     achievement_date: null as string | null,
   });
   ```

5. **Loading States**
   - Loading indicator during submissions
   - Disabled form fields while submitting
   - Smooth transitions

6. **Data Handling**
   - Creates new milestone
   - Updates existing milestone
   - Maintains review history
   - Handles goal relationship

7. **Mobile Considerations**
   - Full-screen dialog on mobile
   - Touch-friendly inputs
   - Proper keyboard handling
   - Maintains scroll position

### Milestone Date Validation
- Milestones have a visual warning system for target dates that exceed their parent goal's target date
- Implementation in `components/goals/milestones-list.tsx`:
  ```typescript
  - Warning icon (AlertTriangle) appears in bottom-left corner
  - Slow pulse animation using animate-pulse
  - Amber color (text-amber-500) for warning state
  - Tooltip explains the date validation issue
  ```
- Props passed from goal-details.tsx:
  ```typescript
  <MilestonesList 
    goalId={goal.goal_id}
    goalTargetDate={goal.target_date}
  />
  ```
- Validation check:
  ```typescript
  {new Date(milestone.target_date) > new Date(goalTargetDate) && (
    // Show warning icon with tooltip
  )}
  ```

### Shared Features
1. **UI Components**
   - Dialog from shadcn/ui
   - Form components from shadcn/ui
   - Toast notifications for feedback

2. **Database Integration**
   - Direct Supabase integration
   - Real-time updates
   - Error handling
   - Data validation

3. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Focus management
   - Screen reader support

4. **Visual Consistency**
   - Consistent spacing
   - Matching typography
   - Unified color scheme
   - Coherent animations

5. **Error States**
   - Form validation
   - Database errors
   - Network errors
   - User feedback

6. **Performance**
   - Optimized re-renders
   - Efficient state updates
   - Proper cleanup
   - Memory management

---

## Register Page UI
- Left side panel contains Veedence logo (8x8 size) with text "Another Veedence.co.uk idea"
- Removed avatar stack from bottom of left panel for cleaner UI
- Background includes gradient and floating shapes for visual appeal
- Maintains responsive design with mobile-first approach

---

## Authentication and Configuration

### Login Flow
1. User enters credentials on login page
2. Upon successful authentication:
   - User activity status is checked based on:
     - Registration date + 1 month
     - Latest payment end date (if any)
   - Global `isUserActive` variable is set
   - Toast notification shows activity status and expiry date
   - User is redirected to Goals page
3. Middleware ensures:
   - Unauthenticated users are redirected to login
   - Authenticated users accessing public routes are redirected to Goals page

### User Activity Check Module (`lib/auth/loginChecks.ts` and `lib/auth/activityGuard.tsx`)
- Modular implementation for checking user activity status
- Tracks user activity through global `isUserActive` variable
- Considers both registration date and payment end date
- Updates user's active status in database if needed
- Provides toast notifications for activity status

#### Activity Guard Component
- Higher-order component to protect interactive elements based on user activity status
- Guards creation and editing of:
  - Goals
  - Milestones
  - SMART goals
- Shows toast notification with billing link when inactive user attempts interaction
- Implemented as both component wrapper and HOC for flexibility

### Toast Notification Order
1. Login success notification
2. Activity status notification (shows after login toast is dismissed)
3. Action-specific notifications (e.g., goal created, milestone updated)

### Authentication System

#### Core Components
1. **Supabase Client** (`lib/supabase.ts`):
   ```typescript
   import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
   export const supabase = createClientComponentClient();
   ```
   - Uses `@supabase/auth-helpers-nextjs` for client-side auth
   - Environment variables required:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY

2. **Middleware** (`middleware.ts`):
   ```typescript
   export async function middleware(request: NextRequest) {
     const res = NextResponse.next();
     const supabase = createMiddlewareClient({ req: request, res });
     const { data: { session } } = await supabase.auth.getSession();
     
     // Public routes that don't require authentication
     const publicRoutes = ['/auth/login', '/auth/register', '/', '/api/stripe/webhook'];
     const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

     // Route protection logic
     if (!session && !isPublicRoute) {
       return NextResponse.redirect(new URL('/auth/login', request.url));
     }
     if (session && isPublicRoute) {
       return NextResponse.redirect(new URL('/profile', request.url));
     }
     return res;
   }
   ```
   - Handles route protection
   - Manages authentication state
   - Redirects based on session status

3. **Login Form** (`components/auth/login-form.tsx`):
   ```typescript
   export function LoginForm() {
     const router = useRouter();
     const [isLoading, setIsLoading] = React.useState(false);

     async function onSubmit(values) {
       const { data, error } = await supabase.auth.signInWithPassword({
         email: values.email,
         password: values.password,
       });

       if (data?.session) {
         router.refresh();
         router.push('/profile');
       }
     }
   }
   ```
   - Client-side form handling
   - Session management
   - Navigation after successful login

#### Authentication Flow
1. User enters credentials
2. Form submits to Supabase auth
3. Session is established
4. Middleware validates session
5. User is redirected to protected routes

### Next.js Configuration

#### Core Configuration (`next.config.js`)
```javascript
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
  compiler: {
    removeConsole: false,
  },
  experimental: {
    serverActions: true,
  },
};
```

#### Key Features
1. **Build Optimization**:
   - SWC minification enabled
   - Console logs preserved in production
   - ESLint ignored during builds

2. **Security**:
   - Powered-by header removed
   - Strict mode enabled
   - Server actions enabled for forms

3. **Asset Handling**:
   - SVG support via SVGR
   - Unoptimized images for better build times

4. **Development Features**:
   - Server actions for better form handling
   - Console logs preserved for debugging

### Environment Configuration

#### Required Variables
```plaintext
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

#### Development vs Production
- Development uses same variables
- Production requires proper environment setup
- Stripe keys are live (not test) in production

### Route Structure

#### Public Routes
- `/auth/login`: Login page
- `/auth/register`: Register page
- `/`: Root redirect to login
- `/api/stripe/webhook`: Stripe webhook endpoint

#### Protected Routes
- `/profile`: User profile
- `/settings`: User settings
- `/goals`: Goals management
- Other feature routes (smart goals, feedback, etc.)

#### API Routes
- `/api/auth/login`: Auth endpoint
- `/api/stripe/*`: Stripe integration endpoints

### Error Handling

#### Client-Side
- Toast notifications for user feedback
- Form validation with Zod
- Loading states during operations

#### Server-Side
- Proper error responses from API routes
- Session validation in middleware
- Environment variable checks

## Type Safety and Build Error Prevention

### Type Synchronization Guidelines
1. When modifying type definitions:
   - Update all related state types in components
   - Check all useState hooks that use the modified type
   - Ensure form data structures match the type definition
   - Verify type consistency in any related components

2. State Management Best Practices:
   - Always define explicit types for useState hooks
   - Avoid using partial types unless absolutely necessary
   - Keep state types in sync with their corresponding model types
   - When using setState with objects, ensure the object shape matches exactly

3. Type Definition Changes Checklist:
   ```typescript
   // When updating a type (e.g., Goal):
   - Update the base type definition (types/goal.ts)
   - Update any state definitions using this type
   - Update any form data structures
   - Update any temporary state storage (like previousGoalData)
   - Run type checking before committing changes: npm run type-check
   ```

4. Common Type-Related Build Issues:
   - Property missing in state type but present in model type
   - Inconsistent property names between state and model
   - Missing properties in setState calls
   - Incomplete type definitions in temporary state storage

5. Prevention Strategy:
   - Always run type checking before commits
   - Keep type definitions centralized
   - Maintain consistency between model and state types
   - Document type dependencies in component comments

## Authentication Flow
- **Login Page** (`/auth/login`):
  - Redirects to `/profile` if user is already logged in
  - Contains links to register page for both mobile and desktop views
  - Uses Supabase authentication

- **Register Page** (`/auth/register`):
  - Accessible whether logged in or not
  - Registration form with fields:
    - First Name
    - Last Name
    - Email
    - Password
    - Nickname
    - Login Key
  - Uses Supabase for user registration

- **Auth Layout** (`/auth/layout.tsx`):
  - Only redirects to profile if user is logged in AND on login page
  - Allows access to register page regardless of authentication status

## Database Table Structure

### User Profile Table (`userprofile`)
```sql
create table
  public.userprofile (
    user_id uuid not null,
    first_name text null,
    last_name text null,
    coaching_style_preference text null,
    feedback_frequency text null,
    privacy_settings jsonb null,
    is_active boolean null default true,
    last_logged_in timestamp with time zone null,
    nick_name text null,
    user_email text null,
    induction_complete boolean null default false,
    country text null,
    city text null,
    age numeric null,
    gender text null,
    last_donation timestamp with time zone null,
    admin boolean null default false,
    subscription_end_date date null default (now() + '30 days'::interval),
    date_joined timestamp with time zone null default now(),
    constraint userprofile_pkey primary key (user_id),
    constraint userprofile_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;
```

### payments Table (`payments`)
```sql
create table
  public.payments (
    paymentid uuid not null default gen_random_uuid (),
    user_id uuid not null,
    issuccess boolean not null,
    status text not null,
    paymentstatus text not null,
    paymentintentstatus text not null,
    customeremail text not null,
    amount numeric not null,
    currency text not null,
    paymenttype text not null,
    timepaid timestamp without time zone null default (now() at time zone 'utc'::text),
    stripepaymentid text null,
    subsmonthcount numeric null default '1'::numeric,
    subsenddate date null default (now() + '30 days'::interval),
    constraint payments_pkey primary key (paymentid),
    constraint payments_user_id_fkey foreign key (user_id) references userprofile (user_id) on delete cascade
  ) tablespace pg_default;

create index if not exists idx_payments_user_id on public.payments using btree (user_id) tablespace pg_default;
```

### goals Table (`goals`)
```sql
create table
  public.goals (
    goal_id uuid not null default gen_random_uuid (),
    user_id uuid null,
    goal_description text not null,
    goal_type character varying(50) null,
    created_at timestamp with time zone null default now(),
    target_date date null,
    progress numeric(5, 2) null default 0.00,
    is_completed boolean null default false,
    last_updated timestamp with time zone null default now(),
    effort_level numeric null default '3'::numeric,
    review_needed boolean null default false,
    review_previous_goal jsonb null,
    framework_id uuid null,
    goal_title text null,
    constraint goals_pkey primary key (goal_id),
    constraint goals_framework_id_fkey foreign key (framework_id) references frameworks (framework_id) on delete cascade,
    constraint goals_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;

create index if not exists idx_goals_user_id on public.goals using btree (user_id) tablespace pg_default;
```

### milestones Table (`milestones`)
```sql
create table
  public.milestones (
    milestone_id uuid not null default gen_random_uuid (),
    goal_id uuid null,
    milestone_description text not null,
    target_date date null,
    achieved boolean null default false,
    achievement_date date null,
    created_at timestamp with time zone null default now(),
    last_updated timestamp with time zone null default now(),
    review_needed boolean null default false,
    review_previous_milestone jsonb null,
    framework_level_id uuid null,
    constraint milestones_pkey primary key (milestone_id),
    constraint milestones_framework_level_id_fkey foreign key (framework_level_id) references framework_levels (level_id) on delete cascade,
    constraint milestones_goal_id_fkey foreign key (goal_id) references goals (goal_id) on delete cascade
  ) tablespace pg_default;

create index if not exists idx_milestones_goal_id on public.milestones using btree (goal_id) tablespace pg_default;
```

### smartgoals Table (`smartgoals`)
```sql
create table
  public.smartgoals (
    smart_id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    goal_id uuid null,
    specific text null,
    measurable text null,
    achievable text null,
    relevant text null,
    time_bound date null,
    smart_progress numeric(5, 2) null default 0.00,
    status text null default 'Pending',
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    review_needed boolean null default false,
    review_previous_smart jsonb
);

-- Indexes
create index idx_smartgoals_goal_id on smartgoals(goal_id);
create index idx_smartgoals_user_id on smartgoals(user_id);
```

### frameworks Table (`frameworks`)
```sql
create table
  public.frameworks (
    framework_id uuid not null default gen_random_uuid (),
    name text not null,
    description text null,
    type text not null,
    version text null default '1.0'::text,
    created_by uuid null,
    updated_by uuid null,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    constraint frameworks_pkey primary key (framework_id),
    constraint frameworks_created_by_fkey foreign key (created_by) references auth.users (id),
    constraint frameworks_updated_by_fkey foreign key (updated_by) references auth.users (id)
  ) tablespace pg_default;

create index if not exists idx_framework_name on public.frameworks using btree (name) tablespace pg_default;      
``` 

### framework_levels Table (`framework_levels`)
```sql
create table
  public.framework_levels (
    level_id uuid not null default gen_random_uuid (),
    framework_id uuid not null,
    name text not null,
    description text null,
    level_order integer not null,
    parent_level_id uuid null,
    framework_cluster_name text null,
    framework_edi_compliance boolean null default false,
    constraint framework_levels_pkey primary key (level_id),
    constraint framework_levels_framework_id_fkey foreign key (framework_id) references frameworks (framework_id) on delete cascade,
    constraint framework_levels_parent_level_id_fkey foreign key (parent_level_id) references framework_levels (level_id) on delete cascade
  ) tablespace pg_default;

create index if not exists idx_framework_level_name on public.framework_levels using btree (name) tablespace pg_default;

create index if not exists idx_framework_cluster_name on public.framework_levels using btree (framework_cluster_name) tablespace pg_default;
```

### feedback Table (`feedback`)
```sql
create table
  public.feedback (
    feedback_id uuid not null default gen_random_uuid (),
    user_id uuid null,
    feedback_date date null default current_date,
    feedback_type character varying(50) null,
    feedback_content text null,
    action_taken text null,
    fk_goals uuid null,
    fk_milestones uuid null,
    fk_engagement uuid null,
    constraint feedback_pkey primary key (feedback_id),
    constraint feedback_fk_engagement_fkey foreign key (fk_engagement) references engagement (engagement_id),
    constraint feedback_fk_goals_fkey foreign key (fk_goals) references goals (goal_id),
    constraint feedback_fk_milestones_fkey foreign key (fk_milestones) references milestones (milestone_id),
    constraint feedback_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;

create index if not exists idx_feedback_user_id on public.feedback using btree (user_id) tablespace pg_default;
```

### engagement Table (`engagement`)
```sql
create table
  public.engagement (
    engagement_id uuid not null default gen_random_uuid (),
    user_id uuid null,
    interaction_type character varying(50) null,
    interaction_date timestamp with time zone null default now(),
    response_time interval null,
    sentiment character varying(20) null,
    notes text null,
    fk_feedback uuid null,
    fk_milestones uuid null,
    fk_goals uuid null,
    constraint engagement_pkey primary key (engagement_id),
    constraint engagement_fk_feedback_fkey foreign key (fk_feedback) references feedback (feedback_id),
    constraint engagement_fk_goals_fkey foreign key (fk_goals) references goals (goal_id),
    constraint engagement_fk_milestones_fkey foreign key (fk_milestones) references milestones (milestone_id),
    constraint engagement_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;

create index if not exists idx_engagement_user_id on public.engagement using btree (user_id) tablespace pg_default;
```

### settings Table (`updates`)
```sql
create table
  public.updates (
    update_id uuid not null default gen_random_uuid (),
    user_id uuid null,
    update_type character varying(50) null,
    update_date timestamp with time zone null default now(),
    previous_value text null,
    new_value text null,
    update_reason text null,
    source character varying(20) null,
    notes text null,
    reverted boolean null default false,
    revert_date timestamp with time zone null,
    fk_goal uuid null,
    fk_milestone uuid null,
    update_title text null,
    constraint updates_pkey primary key (update_id),
    constraint updates_fk_goal_fkey foreign key (fk_goal) references goals (goal_id),
    constraint updates_fk_milestone_fkey foreign key (fk_milestone) references milestones (milestone_id),
    constraint updates_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;

create index if not exists idx_updates_user_id on public.updates using btree (user_id) tablespace pg_default;
```

### userlogins Table (`userlogins`)
```sql
create table
  public.userlogins (
    login_id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    login_time timestamp with time zone not null default now(),
    time_diff_hours numeric null,
    constraint userlogins_pkey primary key (login_id),
    constraint userlogins_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;

create index if not exists idx_userlogins_user_id on public.userlogins using btree (user_id) tablespace pg_default;
