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

5. Review Notifications:
   - Toast notification appears in two scenarios:
     1. When an existing record update is flagged for review
     2. When a new goal or milestone is created
   - Notification duration: 10 seconds
   - Messages:
     - For updates: "This [goal/milestone] update has been flagged for review with Ajay in your next AI session."
     - For new records: "This new [goal/milestone] has been flagged for review with Ajay in your next AI session."
   - Descriptions:
     - For updates: "Changes will be discussed and reviewed during the session."
     - For new records: "The [goal/milestone] will be discussed and reviewed during the session."
   - All new goals and milestones are automatically set with `review_needed: true`
   - For existing records, only shown when `review_needed` changes from `false` to `true`

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

## Code Cleanup History

### 2025-01-05: Removed Legacy Stripe Integration
1. **Files Removed**:
   - `lib/config/environment.ts` - Unused Stripe configuration
   - `types/stripe.ts` - Unused Stripe type definitions
   
2. **Reason for Removal**:
   - Files were remnants of an unused/incomplete Stripe integration
   - No active references to these files in the codebase
   - All related environment variables were already commented out
   - Referenced a different domain (coach.veedence.com) in returnUrl

3. **Verification**:
   - Confirmed no active imports of these files
   - Confirmed no active usage of Stripe-related types
   - All Stripe environment variables were already commented out in `.env.local`

---

## Utils

### Celebration Utility (`lib/utils/celebration.ts`)
- Provides confetti animation functionality
- Uses `canvas-confetti` library with proper type imports
- Shapes are properly typed using `Shape[]` from canvas-confetti types
- Default configuration:
  - Star shape
  - Multiple colors: Gold, Orange, Red-Orange, Purple, Royal Blue
  - Customizable particle count and animation parameters

### Type Fix for Celebration Utility
- Fixed type issue with `triggerCelebration` function
- Added type annotations for `confetti` function
- Ensured type consistency with `canvas-confetti` library

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

## Goal Completion System

### Complete Goal Feature
1. Button Requirements:
   - Located next to Delete Goal button
   - Disabled if any milestones are incomplete
   - Tooltip shows completion requirements
   - Uses CheckCircle2 icon from lucide-react

2. Completion Process:
   - Confirmation dialog before proceeding
   - Updates goal with:
     ```typescript
     {
       progress: 100.00,
       is_completed: true,
       last_updated: new Date().toISOString(),
       review_needed: true,
       review_previous_goal: {...previousState} // If not under review
     }
     ```
   - Triggers celebration animation
   - Shows success toast
   - Shows review notification if needed

3. Milestone Validation:
   - Tracks total and completed milestone counts
   - Requires all milestones to be completed
   - Updates counts when milestones change
   - Disables button if validation fails

### Celebration System
1. Modular Celebration Function:
   ```typescript
   // lib/utils/celebration.ts
   triggerCelebration(times?: number): Promise<void>
   ```
   - Takes optional number of bursts (2-5)
   - Uses canvas-confetti library
   - Customizable colors and patterns
   - Async with delay between bursts

2. Default Configuration:
   ```typescript
   {
     spread: 360,
     ticks: 100,
     gravity: 0.5,
     decay: 0.94,
     startVelocity: 30,
     shapes: ['star'],
     colors: ['#FFD700', '#FFA500', '#FF4500', '#9370DB', '#4169E1']
   }
   ```

3. Usage:
   - Goal completion celebration
   - Random number of bursts (2-5 times)
   - 750ms delay between bursts
   - Reusable for other achievements

---

## Goal List UI System

### Date-Based Background Colors

1. Color Logic:
   ```typescript
   // lib/utils/date-colors.ts
   const colors = {
     past: { default: "bg-red-50", selected: "bg-red-100" },
     near: { default: "bg-orange-50", selected: "bg-orange-100" },
     future: { default: "bg-white", selected: "bg-purple-50" }
   }
   ```
   - Defined in `date-colors.ts`
   - Used consistently across all goal forms
   - Type-safe implementation using TypeScript

2. Date Conditions:
   - Past Due (Red): Target date < Current date
   - Near Due (Orange): Target date within 10 days
   - Future (White/Purple): Target date > 10 days away

3. Implementation:
   - Modular utility function in `date-colors.ts`
   - Handles both selected and unselected states
   - Integrates with existing selection UI
   - Uses Tailwind CSS classes for consistency

4. Visual Indicators:
   - Target date displayed with calendar icon
   - Tooltip shows "Goal target date"
   - Smooth color transitions
   - Maintains existing hover states

5. State Handling:
   - Preserves selection highlight logic
   - Compatible with completion status
   - Updates dynamically with date changes
   - Fallback to default colors if no target date

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
```

### users Table (`auth.users`)
```sql
create table
  auth.users (
    instance_id uuid null,
    id uuid not null,
    aud character varying(255) null,
    role character varying(255) null,
    email character varying(255) null,
    encrypted_password character varying(255) null,
    email_confirmed_at timestamp with time zone null,
    invited_at timestamp with time zone null,
    confirmation_token character varying(255) null,
    confirmation_sent_at timestamp with time zone null,
    recovery_token character varying(255) null,
    recovery_sent_at timestamp with time zone null,
    email_change_token_new character varying(255) null,
    email_change character varying(255) null,
    email_change_sent_at timestamp with time zone null,
    last_sign_in_at timestamp with time zone null,
    raw_app_meta_data jsonb null,
    raw_user_meta_data jsonb null,
    is_super_admin boolean null,
    created_at timestamp with time zone null,
    updated_at timestamp with time zone null,
    phone text null default null::character varying,
    phone_confirmed_at timestamp with time zone null,
    phone_change text null default ''::character varying,
    phone_change_token character varying(255) null default ''::character varying,
    phone_change_sent_at timestamp with time zone null,
    confirmed_at timestamp with time zone generated always as (least(email_confirmed_at, phone_confirmed_at)) stored null,
    email_change_token_current character varying(255) null default ''::character varying,
    email_change_confirm_status smallint null default 0,
    banned_until timestamp with time zone null,
    reauthentication_token character varying(255) null default ''::character varying,
    reauthentication_sent_at timestamp with time zone null,
    is_sso_user boolean not null default false,
    deleted_at timestamp with time zone null,
    is_anonymous boolean not null default false,
    constraint users_pkey primary key (id),
    constraint users_phone_key unique (phone),
    constraint users_email_change_confirm_status_check check (
      (
        (email_change_confirm_status >= 0)
        and (email_change_confirm_status <= 2)
      )
    )
  ) tablespace pg_default;

create index if not exists users_instance_id_idx on auth.users using btree (instance_id) tablespace pg_default;

create index if not exists users_instance_id_email_idx on auth.users using btree (instance_id, lower((email)::text)) tablespace pg_default;

create unique index if not exists confirmation_token_idx on auth.users using btree (confirmation_token) tablespace pg_default
where
  ((confirmation_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists recovery_token_idx on auth.users using btree (recovery_token) tablespace pg_default
where
  ((recovery_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists email_change_token_current_idx on auth.users using btree (email_change_token_current) tablespace pg_default
where
  (
    (email_change_token_current)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists email_change_token_new_idx on auth.users using btree (email_change_token_new) tablespace pg_default
where
  (
    (email_change_token_new)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists reauthentication_token_idx on auth.users using btree (reauthentication_token) tablespace pg_default
where
  (
    (reauthentication_token)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists users_email_partial_key on auth.users using btree (email) tablespace pg_default
where
  (is_sso_user = false);

create index if not exists users_is_anonymous_idx on auth.users using btree (is_anonymous) tablespace pg_default;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function create_user_profile_v2 ();

---

## Authentication and Password Management

### URL Configuration
1. **Supabase URL Configuration (Required)**
   - Required Setup: Configure redirect URLs in Supabase dashboard
   - Path: `https://supabase.com/dashboard/project/{PROJECT_ID}/auth/url-configuration`
   - Add your domain to the redirect URLs list
   - Format: `http://your-domain.com/**`
   - Note: Replace {PROJECT_ID} with your Supabase project ID
   - This configuration is crucial for the password reset flow to work correctly

2. **URL Handling**
   - Utility: `url-utils.ts`
   - Functions:
     - `getBaseUrl()` - Dynamic base URL detection
       - Browser: Uses `window.location.origin` (automatically gets current domain)
       - Server: Falls back to localhost (server-side URL not needed for auth flows)
     - `getAuthRedirectUrl()` - Generates full auth redirect URLs

### Password Reset Flow
1. **Forgot Password Flow**
   - Route: `/auth/forgot-password`
   - Component: `ForgotPasswordForm`
   - Functionality: 
     - Allows users to request a password reset via email
     - Uses browser's current domain for redirects
     - Non-authenticated route accessible to logged-out users

2. **Password Reset Flow**
   - Routes:
     - `/auth/confirm` - Handles OTP verification
     - `/auth/reset-password` - New password entry form
     - `/auth/error` - Error handling page
   - Components:
     - `ResetPasswordForm`
   - Implementation: 
     - Uses Supabase PKCE flow for secure password reset
     - Uses browser's current domain for redirects
     - All routes are non-authenticated and accessible to logged-out users

3. **Public Routes**
   The following routes are accessible without authentication:
   ```typescript
   const publicRoutes = [
     '/auth/login',
     '/auth/register',
     '/auth/forgot-password',
     '/auth/reset-password',
     '/auth/confirm',
     '/auth/error',
     '/',
     '/api/stripe/webhook'
   ];
   ```

### Important Setup Steps
1. Configure Supabase URL Configuration:
   - Access Supabase dashboard at: `https://supabase.com/dashboard/project/{PROJECT_ID}/auth/url-configuration`
   - Add your domain to redirect URLs
   - Format: `http://your-domain.com/**`
   - This step is crucial for the password reset flow to work correctly

2. Verify Middleware Configuration:
   - Ensure all auth-related routes are listed in `publicRoutes`
   - Check middleware.ts for proper route handling

---

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
```

### users Table (`auth.users`)
```sql
create table
  auth.users (
    instance_id uuid null,
    id uuid not null,
    aud character varying(255) null,
    role character varying(255) null,
    email character varying(255) null,
    encrypted_password character varying(255) null,
    email_confirmed_at timestamp with time zone null,
    invited_at timestamp with time zone null,
    confirmation_token character varying(255) null,
    confirmation_sent_at timestamp with time zone null,
    recovery_token character varying(255) null,
    recovery_sent_at timestamp with time zone null,
    email_change_token_new character varying(255) null,
    email_change character varying(255) null,
    email_change_sent_at timestamp with time zone null,
    last_sign_in_at timestamp with time zone null,
    raw_app_meta_data jsonb null,
    raw_user_meta_data jsonb null,
    is_super_admin boolean null,
    created_at timestamp with time zone null,
    updated_at timestamp with time zone null,
    phone text null default null::character varying,
    phone_confirmed_at timestamp with time zone null,
    phone_change text null default ''::character varying,
    phone_change_token character varying(255) null default ''::character varying,
    phone_change_sent_at timestamp with time zone null,
    confirmed_at timestamp with time zone generated always as (least(email_confirmed_at, phone_confirmed_at)) stored null,
    email_change_token_current character varying(255) null default ''::character varying,
    email_change_confirm_status smallint null default 0,
    banned_until timestamp with time zone null,
    reauthentication_token character varying(255) null default ''::character varying,
    reauthentication_sent_at timestamp with time zone null,
    is_sso_user boolean not null default false,
    deleted_at timestamp with time zone null,
    is_anonymous boolean not null default false,
    constraint users_pkey primary key (id),
    constraint users_phone_key unique (phone),
    constraint users_email_change_confirm_status_check check (
      (
        (email_change_confirm_status >= 0)
        and (email_change_confirm_status <= 2)
      )
    )
  ) tablespace pg_default;

create index if not exists users_instance_id_idx on auth.users using btree (instance_id) tablespace pg_default;

create index if not exists users_instance_id_email_idx on auth.users using btree (instance_id, lower((email)::text)) tablespace pg_default;

create unique index if not exists confirmation_token_idx on auth.users using btree (confirmation_token) tablespace pg_default
where
  ((confirmation_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists recovery_token_idx on auth.users using btree (recovery_token) tablespace pg_default
where
  ((recovery_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists email_change_token_current_idx on auth.users using btree (email_change_token_current) tablespace pg_default
where
  (
    (email_change_token_current)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists email_change_token_new_idx on auth.users using btree (email_change_token_new) tablespace pg_default
where
  (
    (email_change_token_new)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists reauthentication_token_idx on auth.users using btree (reauthentication_token) tablespace pg_default
where
  (
    (reauthentication_token)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists users_email_partial_key on auth.users using btree (email) tablespace pg_default
where
  (is_sso_user = false);

create index if not exists users_is_anonymous_idx on auth.users using btree (is_anonymous) tablespace pg_default;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function create_user_profile_v2 ();

---

## Goal Type System

### Goal Type Options
1. Available Types:
   ```typescript
   const GOAL_TYPES = ['Personal', 'Career', 'Professional'] as const;
   ```
   - Defined in `types/goal-type.ts`
   - Used consistently across all goal forms
   - Type-safe implementation using TypeScript

2. UI Implementation:
   - Dropdown select component
   - Used in both new goal creation and goal editing
   - Consistent styling with other form elements
   - Clear placeholder text: "Select goal type"

3. Form Integration:
   - Required field in goal creation
   - Editable in goal details when in edit mode
   - Read-only display when not editing
   - Maintains previous value during updates

### Goal Refresh System

1. Auto-refresh Implementation:
   - Immediate refresh after any database operation
   - Uses Supabase real-time updates
   - Maintains UI consistency

2. Refresh Triggers:
   - Goal updates
   - Goal completion
   - Goal deletion
   - Milestone changes affecting goal

3. Refresh Process:
   ```typescript
   const refreshGoal = async (goalId) => {
     const { data, error } = await supabase
       .from("goals")
       .select("*")
       .eq("goal_id", goalId)
       .single();
     
     if (data) onUpdate();
   };
   ```

4. State Management:
   - Centralized update handling
   - Prevents stale data display
   - Maintains data consistency
   - Improves user experience

---

## Milestone Completion Celebration
- Confetti animation triggers when a milestone is completed
- Uses the same `triggerCelebration` utility as goal completion
- Random number of confetti bursts (2-5 times)
- Configuration:
  - Spread: 360 degrees
  - Star-shaped particles
  - Colors: Gold, Orange, Red-Orange, Purple, Royal Blue
  - Gravity and decay effects for natural animation
  - Particles originate from random positions
  - 40 particles per burst
  - 750ms delay between bursts

---

## Authentication and Password Management

### Environment Configuration
1. **Site URL Configuration**
   - Environment Variable: `NEXT_PUBLIC_SITE_URL`
   - Format: `# NEXT_PUBLIC_SITE_URL=http://your-domain.com`
   - Purpose: Enables dynamic domain handling for authentication redirects
   - Location: `.env.local`

2. **Supabase URL Configuration**
   - Required Setup: Configure redirect URLs in Supabase dashboard
   - Path: `https://supabase.com/dashboard/project/{PROJECT_ID}/auth/url-configuration`
   - Add your domain to the redirect URLs list
   - Format: `http://your-domain.com/**`
   - Note: Replace {PROJECT_ID} with your Supabase project ID

### Password Reset Flow
1. **Forgot Password Flow**
   - Route: `/auth/forgot-password`
   - Component: `ForgotPasswordForm`
   - Functionality: 
     - Allows users to request a password reset via email
     - Uses dynamic site URL for redirects
     - Non-authenticated route accessible to logged-out users

2. **Password Reset Flow**
   - Routes:
     - `/auth/confirm` - Handles OTP verification
     - `/auth/reset-password` - New password entry form
     - `/auth/error` - Error handling page
   - Components:
     - `ResetPasswordForm`
   - Implementation: 
     - Uses Supabase PKCE flow for secure password reset
     - Maintains domain consistency across redirects
     - All routes are non-authenticated and accessible to logged-out users

3. **URL Handling**
   - Utility: `url-utils.ts`
   - Functions:
     - `getBaseUrl()` - Dynamic base URL detection
       - Browser: Uses `window.location.origin`
       - Server: Uses `NEXT_PUBLIC_SITE_URL` environment variable
     - `getAuthRedirectUrl()` - Generates full auth redirect URLs
   - Fallback: Defaults to `http://localhost:3000` if environment variable is not set

4. **Public Routes**
   The following routes are accessible without authentication:
   ```typescript
   const publicRoutes = [
     '/auth/login',
     '/auth/register',
     '/auth/forgot-password',
     '/auth/reset-password',
     '/auth/confirm',
     '/auth/error',
     '/',
     '/api/stripe/webhook'
   ];
   ```

### Important Setup Steps
1. Configure `.env.local`:
   ```plaintext
   # NEXT_PUBLIC_SITE_URL=http://your-domain.com
   ```

2. Configure Supabase URL Configuration:
   - Access Supabase dashboard at: `https://supabase.com/dashboard/project/{PROJECT_ID}/auth/url-configuration`
   - Add your domain to redirect URLs
   - Format: `http://your-domain.com/**`
   - This step is crucial for the password reset flow to work correctly

3. Verify Middleware Configuration:
   - Ensure all auth-related routes are listed in `publicRoutes`
   - Check middleware.ts for proper route handling

---

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
```

### users Table (`auth.users`)
```sql
create table
  auth.users (
    instance_id uuid null,
    id uuid not null,
    aud character varying(255) null,
    role character varying(255) null,
    email character varying(255) null,
    encrypted_password character varying(255) null,
    email_confirmed_at timestamp with time zone null,
    invited_at timestamp with time zone null,
    confirmation_token character varying(255) null,
    confirmation_sent_at timestamp with time zone null,
    recovery_token character varying(255) null,
    recovery_sent_at timestamp with time zone null,
    email_change_token_new character varying(255) null,
    email_change character varying(255) null,
    email_change_sent_at timestamp with time zone null,
    last_sign_in_at timestamp with time zone null,
    raw_app_meta_data jsonb null,
    raw_user_meta_data jsonb null,
    is_super_admin boolean null,
    created_at timestamp with time zone null,
    updated_at timestamp with time zone null,
    phone text null default null::character varying,
    phone_confirmed_at timestamp with time zone null,
    phone_change text null default ''::character varying,
    phone_change_token character varying(255) null default ''::character varying,
    phone_change_sent_at timestamp with time zone null,
    confirmed_at timestamp with time zone generated always as (least(email_confirmed_at, phone_confirmed_at)) stored null,
    email_change_token_current character varying(255) null default ''::character varying,
    email_change_confirm_status smallint null default 0,
    banned_until timestamp with time zone null,
    reauthentication_token character varying(255) null default ''::character varying,
    reauthentication_sent_at timestamp with time zone null,
    is_sso_user boolean not null default false,
    deleted_at timestamp with time zone null,
    is_anonymous boolean not null default false,
    constraint users_pkey primary key (id),
    constraint users_phone_key unique (phone),
    constraint users_email_change_confirm_status_check check (
      (
        (email_change_confirm_status >= 0)
        and (email_change_confirm_status <= 2)
      )
    )
  ) tablespace pg_default;

create index if not exists users_instance_id_idx on auth.users using btree (instance_id) tablespace pg_default;

create index if not exists users_instance_id_email_idx on auth.users using btree (instance_id, lower((email)::text)) tablespace pg_default;

create unique index if not exists confirmation_token_idx on auth.users using btree (confirmation_token) tablespace pg_default
where
  ((confirmation_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists recovery_token_idx on auth.users using btree (recovery_token) tablespace pg_default
where
  ((recovery_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists email_change_token_current_idx on auth.users using btree (email_change_token_current) tablespace pg_default
where
  (
    (email_change_token_current)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists email_change_token_new_idx on auth.users using btree (email_change_token_new) tablespace pg_default
where
  (
    (email_change_token_new)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists reauthentication_token_idx on auth.users using btree (reauthentication_token) tablespace pg_default
where
  (
    (reauthentication_token)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists users_email_partial_key on auth.users using btree (email) tablespace pg_default
where
  (is_sso_user = false);

create index if not exists users_is_anonymous_idx on auth.users using btree (is_anonymous) tablespace pg_default;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function create_user_profile_v2 ();

---

## Authentication and Password Management

### URL Configuration
1. **Supabase URL Configuration (Required)**
   - Required Setup: Configure redirect URLs in Supabase dashboard
   - Path: `https://supabase.com/dashboard/project/{PROJECT_ID}/auth/url-configuration`
   - Add your domain to the redirect URLs list
   - Format: `http://your-domain.com/**`
   - Note: Replace {PROJECT_ID} with your Supabase project ID
   - This configuration is crucial for the password reset flow to work correctly

2. **URL Handling**
   - Utility: `url-utils.ts`
   - Functions:
     - `getBaseUrl()` - Dynamic base URL detection
       - Browser: Uses `window.location.origin` (automatically gets current domain)
       - Server: Falls back to localhost (server-side URL not needed for auth flows)
     - `getAuthRedirectUrl()` - Generates full auth redirect URLs

### Password Reset Flow
1. **Forgot Password Flow**
   - Route: `/auth/forgot-password`
   - Component: `ForgotPasswordForm`
   - Functionality: 
     - Allows users to request a password reset via email
     - Uses browser's current domain for redirects
     - Non-authenticated route accessible to logged-out users

2. **Password Reset Flow**
   - Routes:
     - `/auth/confirm` - Handles OTP verification
     - `/auth/reset-password` - New password entry form
     - `/auth/error` - Error handling page
   - Components:
     - `ResetPasswordForm`
   - Implementation: 
     - Uses Supabase PKCE flow for secure password reset
     - Uses browser's current domain for redirects
     - All routes are non-authenticated and accessible to logged-out users

3. **Public Routes**
   The following routes are accessible without authentication:
   ```typescript
   const publicRoutes = [
     '/auth/login',
     '/auth/register',
     '/auth/forgot-password',
     '/auth/reset-password',
     '/auth/confirm',
     '/auth/error',
     '/',
     '/api/stripe/webhook'
   ];
   ```

### Important Setup Steps
1. Configure Supabase URL Configuration:
   - Access Supabase dashboard at: `https://supabase.com/dashboard/project/{PROJECT_ID}/auth/url-configuration`
   - Add your domain to redirect URLs
   - Format: `http://your-domain.com/**`
   - This step is crucial for the password reset flow to work correctly

2. Verify Middleware Configuration:
   - Ensure all auth-related routes are listed in `publicRoutes`
   - Check middleware.ts for proper route handling

---

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
```

### users Table (`auth.users`)
```sql
create table
  auth.users (
    instance_id uuid null,
    id uuid not null,
    aud character varying(255) null,
    role character varying(255) null,
    email character varying(255) null,
    encrypted_password character varying(255) null,
    email_confirmed_at timestamp with time zone null,
    invited_at timestamp with time zone null,
    confirmation_token character varying(255) null,
    confirmation_sent_at timestamp with time zone null,
    recovery_token character varying(255) null,
    recovery_sent_at timestamp with time zone null,
    email_change_token_new character varying(255) null,
    email_change character varying(255) null,
    email_change_sent_at timestamp with time zone null,
    last_sign_in_at timestamp with time zone null,
    raw_app_meta_data jsonb null,
    raw_user_meta_data jsonb null,
    is_super_admin boolean null,
    created_at timestamp with time zone null,
    updated_at timestamp with time zone null,
    phone text null default null::character varying,
    phone_confirmed_at timestamp with time zone null,
    phone_change text null default ''::character varying,
    phone_change_token character varying(255) null default ''::character varying,
    phone_change_sent_at timestamp with time zone null,
    confirmed_at timestamp with time zone generated always as (least(email_confirmed_at, phone_confirmed_at)) stored null,
    email_change_token_current character varying(255) null default ''::character varying,
    email_change_confirm_status smallint null default 0,
    banned_until timestamp with time zone null,
    reauthentication_token character varying(255) null default ''::character varying,
    reauthentication_sent_at timestamp with time zone null,
    is_sso_user boolean not null default false,
    deleted_at timestamp with time zone null,
    is_anonymous boolean not null default false,
    constraint users_pkey primary key (id),
    constraint users_phone_key unique (phone),
    constraint users_email_change_confirm_status_check check (
      (
        (email_change_confirm_status >= 0)
        and (email_change_confirm_status <= 2)
      )
    )
  ) tablespace pg_default;

create index if not exists users_instance_id_idx on auth.users using btree (instance_id) tablespace pg_default;

create index if not exists users_instance_id_email_idx on auth.users using btree (instance_id, lower((email)::text)) tablespace pg_default;

create unique index if not exists confirmation_token_idx on auth.users using btree (confirmation_token) tablespace pg_default
where
  ((confirmation_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists recovery_token_idx on auth.users using btree (recovery_token) tablespace pg_default
where
  ((recovery_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists email_change_token_current_idx on auth.users using btree (email_change_token_current) tablespace pg_default
where
  (
    (email_change_token_current)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists email_change_token_new_idx on auth.users using btree (email_change_token_new) tablespace pg_default
where
  (
    (email_change_token_new)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists reauthentication_token_idx on auth.users using btree (reauthentication_token) tablespace pg_default
where
  (
    (reauthentication_token)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists users_email_partial_key on auth.users using btree (email) tablespace pg_default
where
  (is_sso_user = false);

create index if not exists users_is_anonymous_idx on auth.users using btree (is_anonymous) tablespace pg_default;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function create_user_profile_v2 ();

---

## Authentication and Password Management

### URL Configuration
1. **Supabase URL Configuration (Required)**
   - Required Setup: Configure redirect URLs in Supabase dashboard
   - Path: `https://supabase.com/dashboard/project/{PROJECT_ID}/auth/url-configuration`
   - Add your domain to the redirect URLs list
   - Format: `http://your-domain.com/**`
   - Note: Replace {PROJECT_ID} with your Supabase project ID
   - This configuration is crucial for the password reset flow to work correctly

2. **URL Handling**
   - Utility: `url-utils.ts`
   - Functions:
     - `getBaseUrl()` - Dynamic base URL detection
       - Browser: Uses `window.location.origin` (automatically gets current domain)
       - Server: Falls back to localhost (server-side URL not needed for auth flows)
     - `getAuthRedirectUrl()` - Generates full auth redirect URLs

### Password Reset Flow
1. **Forgot Password Flow**
   - Route: `/auth/forgot-password`
   - Component: `ForgotPasswordForm`
   - Functionality: 
     - Allows users to request a password reset via email
     - Uses browser's current domain for redirects
     - Non-authenticated route accessible to logged-out users

2. **Password Reset Flow**
   - Routes:
     - `/auth/confirm` - Handles OTP verification
     - `/auth/reset-password` - New password entry form
     - `/auth/error` - Error handling page
   - Components:
     - `ResetPasswordForm`
   - Implementation: 
     - Uses Supabase PKCE flow for secure password reset
     - Uses browser's current domain for redirects
     - All routes are non-authenticated and accessible to logged-out users

3. **Public Routes**
   The following routes are accessible without authentication:
   ```typescript
   const publicRoutes = [
     '/auth/login',
     '/auth/register',
     '/auth/forgot-password',
     '/auth/reset-password',
     '/auth/confirm',
     '/auth/error',
     '/',
     '/api/stripe/webhook'
   ];
   ```

### Important Setup Steps
1. Configure Supabase URL Configuration:
   - Access Supabase dashboard at: `https://supabase.com/dashboard/project/{PROJECT_ID}/auth/url-configuration`
   - Add your domain to redirect URLs
   - Format: `http://your-domain.com/**`
   - This step is crucial for the password reset flow to work correctly

2. Verify Middleware Configuration:
   - Ensure all auth-related routes are listed in `publicRoutes`
   - Check middleware.ts for proper route handling

---

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
```

### users Table (`auth.users`)
```sql
create table
  auth.users (
    instance_id uuid null,
    id uuid not null,
    aud character varying(255) null,
    role character varying(255) null,
    email character varying(255) null,
    encrypted_password character varying(255) null,
    email_confirmed_at timestamp with time zone null,
    invited_at timestamp with time zone null,
    confirmation_token character varying(255) null,
    confirmation_sent_at timestamp with time zone null,
    recovery_token character varying(255) null,
    recovery_sent_at timestamp with time zone null,
    email_change_token_new character varying(255) null,
    email_change character varying(255) null,
    email_change_sent_at timestamp with time zone null,
    last_sign_in_at timestamp with time zone null,
    raw_app_meta_data jsonb null,
    raw_user_meta_data jsonb null,
    is_super_admin boolean null,
    created_at timestamp with time zone null,
    updated_at timestamp with time zone null,
    phone text null default null::character varying,
    phone_confirmed_at timestamp with time zone null,
    phone_change text null default ''::character varying,
    phone_change_token character varying(255) null default ''::character varying,
    phone_change_sent_at timestamp with time zone null,
    confirmed_at timestamp with time zone generated always as (least(email_confirmed_at, phone_confirmed_at)) stored null,
    email_change_token_current character varying(255) null default ''::character varying,
    email_change_confirm_status smallint null default 0,
    banned_until timestamp with time zone null,
    reauthentication_token character varying(255) null default ''::character varying,
    reauthentication_sent_at timestamp with time zone null,
    is_sso_user boolean not null default false,
    deleted_at timestamp with time zone null,
    is_anonymous boolean not null default false,
    constraint users_pkey primary key (id),
    constraint users_phone_key unique (phone),
    constraint users_email_change_confirm_status_check check (
      (
        (email_change_confirm_status >= 0)
        and (email_change_confirm_status <= 2)
      )
    )
  ) tablespace pg_default;

create index if not exists users_instance_id_idx on auth.users using btree (instance_id) tablespace pg_default;

create index if not exists users_instance_id_email_idx on auth.users using btree (instance_id, lower((email)::text)) tablespace pg_default;

create unique index if not exists confirmation_token_idx on auth.users using btree (confirmation_token) tablespace pg_default
where
  ((confirmation_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists recovery_token_idx on auth.users using btree (recovery_token) tablespace pg_default
where
  ((recovery_token)::text !~ '^[0-9 ]*$'::text);

create unique index if not exists email_change_token_current_idx on auth.users using btree (email_change_token_current) tablespace pg_default
where
  (
    (email_change_token_current)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists email_change_token_new_idx on auth.users using btree (email_change_token_new) tablespace pg_default
where
  (
    (email_change_token_new)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists reauthentication_token_idx on auth.users using btree (reauthentication_token) tablespace pg_default
where
  (
    (reauthentication_token)::text !~ '^[0-9 ]*$'::text
  );

create unique index if not exists users_email_partial_key on auth.users using btree (email) tablespace pg_default
where
  (is_sso_user = false);

create index if not exists users_is_anonymous_idx on auth.users using btree (is_anonymous) tablespace pg_default;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function create_user_profile_v2 ();

---

## Goal Type System

### Goal Type Options
1. Available Types:
   ```typescript
   const GOAL_TYPES = ['Personal', 'Career', 'Professional'] as const;
   ```
   - Defined in `types/goal-type.ts`
   - Used consistently across all goal forms
   - Type-safe implementation using TypeScript

2. UI Implementation:
   - Dropdown select component
   - Used in both new goal creation and goal editing
   - Consistent styling with other form elements
   - Clear placeholder text: "Select goal type"

3. Form Integration:
   - Required field in goal creation
   - Editable in goal details when in edit mode
   - Read-only display when not editing
   - Maintains previous value during updates

### Goal Refresh System

1. Auto-refresh Implementation:
   - Immediate refresh after any database operation
   - Uses Supabase real-time updates
   - Maintains UI consistency

2. Refresh Triggers:
   - Goal updates
   - Goal completion
   - Goal deletion
   - Milestone changes affecting goal

3. Refresh Process:
   ```typescript
   const refreshGoal = async (goalId) => {
     const { data, error } = await supabase
       .from("goals")
       .select("*")
       .eq("goal_id", goalId)
       .single();
     
     if (data) onUpdate();
   };
   ```

4. State Management:
   - Centralized update handling
   - Prevents stale data display
   - Maintains data consistency
   - Improves user experience

---

## Milestone Completion Celebration
- Confetti animation triggers when a milestone is completed
- Uses the same `triggerCelebration` utility as goal completion
- Random number of confetti bursts (2-5 times)
- Configuration:
  - Spread: 360 degrees
  - Star-shaped particles
  - Colors: Gold, Orange, Red-Orange, Purple, Royal Blue
  - Gravity and decay effects for natural animation
  - Particles originate from random positions
  - 40 particles per burst
  - 750ms delay between bursts

---

## Authentication and Password Management

### Environment Configuration
1. **Site URL Configuration**
   - Environment Variable: `NEXT_PUBLIC_SITE_URL`
   - Format: `# NEXT_PUBLIC_SITE_URL=http://your-domain.com`
   - Purpose: Enables dynamic domain handling for authentication redirects
   - Location: `.env.local`

2. **Supabase URL Configuration**
   - Required Setup: Configure redirect URLs in Supabase dashboard
   - Path: `https://supabase.com/dashboard/project/{PROJECT_ID}/auth/url-configuration`
   - Add your domain to the redirect URLs list
   - Format: `http://your-domain.com/**`
   - Note: Replace {PROJECT_ID} with your Supabase project ID

### Password Reset Flow
1. **Forgot Password Flow**
   - Route: `/auth/forgot-password`
   - Component: `ForgotPasswordForm`
   - Functionality: 
     - Allows users to request a password reset via email
     - Uses dynamic site URL for redirects
     - Non-authenticated route accessible to logged-out users

2. **Password Reset Flow**
   - Routes:
     - `/auth/confirm` - Handles OTP verification
     - `/auth/reset-password` - New password entry form
     - `/auth/error` - Error handling page
   - Components:
     - `ResetPasswordForm`
   - Implementation: 
     - Uses Supabase PKCE flow for secure password reset
     - Maintains domain consistency across redirects
     - All routes are non-authenticated and accessible to logged-out users

3. **URL Handling**
   - Utility: `url-utils.ts`
   - Functions:
     - `getBaseUrl()` - Dynamic base URL detection
       - Browser: Uses `window.location.origin`
       - Server: Uses `NEXT_PUBLIC_SITE_URL` environment variable
     - `getAuthRedirectUrl()` - Generates full auth redirect URLs
   - Fallback: Defaults to `http://localhost:3000` if environment variable is not set

4. **Public Routes**
   The following routes are accessible without authentication:
   ```typescript
   const publicRoutes = [
     '/auth/login',
     '/auth/register',
     '/auth/forgot-password',
     '/auth/reset-password',
     '/auth/confirm',
     '/auth/error',
     '/',
     '/api/stripe/webhook'
   ];
   ```

### Important Setup Steps
1. Configure `.env.local`:
   ```plaintext
   # NEXT_PUBLIC_SITE_URL=http://your-domain.com
   
