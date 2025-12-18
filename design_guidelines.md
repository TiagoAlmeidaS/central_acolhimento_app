# TaskNote AI - Design Guidelines

## Authentication Architecture

**Auth Required**: Yes - The app requires user accounts for credit tracking, subscription management, and data synchronization.

**Implementation**:
- Use SSO (Single Sign-On) as primary authentication method
- Include Apple Sign-In (required for iOS App Store)
- Include Google Sign-In for Android users
- Add email/password as fallback option
- Mock auth flow in prototype using local state

**Auth Screens**:
- **Welcome/Landing**: Hero screen with app value proposition, "Continue with Apple" and "Continue with Google" buttons, "Sign in with Email" link below
- **Email Sign-In**: Minimalist form with email/password fields, "Forgot Password" link, submit button in header
- **Sign-Up**: Email, password, password confirmation, checkbox for terms acceptance with links to Privacy Policy & Terms of Service (placeholder URLs)
- **Account Screen**: Located in Profile tab with logout button (with confirmation alert), nested "Delete Account" option under Settings > Account > Delete (double confirmation required)

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs)
- **Home** (Tasks overview with quick stats)
- **Voice Input** (Floating Action Button - center)
- **History** (Past tasks and usage)
- **Profile** (Account, credits, subscription)

**Voice Input**: Use a prominent circular floating action button positioned above the tab bar center, not a dedicated tab. This allows for 3 actual tabs: Home, History, Profile.

## Information Architecture

### Core Screens

**1. Home Screen**
- **Purpose**: Quick overview of active tasks and daily productivity
- **Header**: Transparent, no title, left: app logo/name, right: filter icon
- **Layout**: 
  - Credit balance card at top (prominent, colorful gradient)
  - Quick stats (tasks today, completed, pending)
  - Scrollable task list grouped by priority
  - Root view: ScrollView with top inset = headerHeight + Spacing.xl, bottom inset = tabBarHeight + Spacing.xl
- **Components**: Credit balance card, filter chips (All, High Priority, Today), task cards with swipe actions

**2. Voice Input (Modal)**
- **Purpose**: Capture tasks via voice or text with AI processing
- **Presentation**: Full-screen modal from floating action button
- **Header**: Custom header with "Cancel" (left), "Voice Input" title (center), no right button
- **Layout**:
  - Large animated waveform visualization during recording
  - Record button (center, large circular with pulsing animation)
  - Transcription preview area below
  - Alternative: "Type Instead" button at bottom
  - Root view: Non-scrollable with top inset = Spacing.xl, bottom inset = insets.bottom + Spacing.xl
- **Components**: Waveform animation, record button, transcription text display, submit button

**3. Text Input (Modal)**
- **Purpose**: Manual task entry with AI enhancement
- **Presentation**: Modal sheet (70% height)
- **Header**: "Cancel" (left), "New Task" (center), "Submit" (right, enabled when text present)
- **Layout**:
  - Large text area for task description
  - AI suggestions below input (optional category/priority)
  - Bottom inset = insets.bottom + Spacing.xl
- **Components**: Multi-line text input, suggestion chips, submit button in header

**4. History Screen**
- **Purpose**: View past tasks and credit usage analytics
- **Header**: Default navigation, title "History", right: calendar filter icon
- **Layout**:
  - Month selector at top (horizontal scroll)
  - Usage chart (credits spent over time)
  - Scrollable list of completed/archived tasks
  - Root view: ScrollView with top inset = Spacing.xl, bottom inset = tabBarHeight + Spacing.xl
- **Components**: Date range picker, usage graph, task list with timestamps

**5. Profile Screen**
- **Purpose**: Manage account, subscription, and app settings
- **Header**: Default navigation, title "Profile", no buttons
- **Layout**:
  - User avatar and display name at top (tappable to edit)
  - Subscription status card
  - Scrollable settings list
  - Root view: ScrollView with top inset = Spacing.xl, bottom inset = tabBarHeight + Spacing.xl
- **Components**: Avatar (circular, 80px), subscription card, settings list items (chevron indicators)

**6. Subscription Management Screen**
- **Purpose**: View/change subscription plans
- **Header**: Back button (left), "Subscription" (center)
- **Layout**:
  - Current plan card at top with expiry date and credit balance
  - Available plans (cards with pricing, features list)
  - Bottom CTA button "Change Plan"
  - Root view: ScrollView with top inset = Spacing.xl, bottom inset = insets.bottom + Spacing.xl
- **Components**: Plan cards with checkmarks for features, pricing labels, CTA button with subtle shadow

**7. Task Detail Screen**
- **Purpose**: View and edit individual task
- **Header**: Back (left), task title (center), "Edit" (right)
- **Layout**:
  - Task metadata (created date, category, priority)
  - Task description
  - AI-generated notes section
  - Action buttons at bottom (Mark Complete, Delete)
  - Root view: ScrollView with top inset = Spacing.xl, bottom inset = insets.bottom + Spacing.xl
- **Components**: Metadata badges, text content, action buttons

**8. Checkout Screen (Stripe)**
- **Purpose**: Process subscription payment
- **Presentation**: Full-screen modal
- **Header**: "Cancel" (left), "Checkout" (center)
- **Layout**:
  - Plan summary at top
  - Stripe payment form (embedded)
  - "Subscribe" button below form
  - Root view: ScrollView with top inset = Spacing.xl, bottom inset = insets.bottom + Spacing.xl
- **Components**: Stripe payment element, summary card, submit button

## Design System

### Color Palette
- **Primary**: Deep Blue (#2563EB) - CTAs, active states
- **Primary Light**: Sky Blue (#3B82F6) - Accents
- **Success**: Emerald (#10B981) - Completed tasks, positive actions
- **Warning**: Amber (#F59E0B) - Low credits, important notices
- **Danger**: Red (#EF4444) - Delete actions, errors
- **Background**: White (#FFFFFF) for light mode
- **Surface**: Light Gray (#F9FAFB) - Cards, elevated elements
- **Text Primary**: Charcoal (#1F2937)
- **Text Secondary**: Gray (#6B7280)
- **Border**: Light Gray (#E5E7EB)

### Typography
- **Large Title**: 34px, Bold - Screen headers
- **Title**: 28px, Semibold - Section headers
- **Headline**: 20px, Semibold - Card titles
- **Body**: 16px, Regular - Main content
- **Subheading**: 14px, Medium - Metadata, labels
- **Caption**: 12px, Regular - Timestamps, hints

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Component Specifications

**Task Cards**:
- White background with 1px border (#E5E7EB)
- 12px border radius
- Padding: 16px
- No shadow (flat design)
- Active press state: reduce opacity to 0.7

**Credit Balance Card**:
- Gradient background (Primary to Primary Light)
- White text
- 16px border radius
- Padding: 20px
- Floating shadow specifications:
  - shadowOffset: { width: 0, height: 2 }
  - shadowOpacity: 0.10
  - shadowRadius: 2

**Floating Action Button** (Voice Input):
- 64px circular button
- Primary color background
- White microphone icon (32px)
- Positioned center-bottom, 16px above tab bar
- Floating shadow specifications:
  - shadowOffset: { width: 0, height: 4 }
  - shadowOpacity: 0.15
  - shadowRadius: 8
- Active press state: scale down to 0.95

**Buttons**:
- Primary: Solid Primary color, white text, 12px radius
- Secondary: Transparent with Primary border, Primary text
- Height: 48px for primary actions
- Press feedback: reduce opacity to 0.8 (no shadow)

**Input Fields**:
- 1px border (#E5E7EB), 8px radius
- Padding: 12px
- Focus state: Primary border color
- 48px minimum height for single-line inputs

### Icons
- Use Feather icons from @expo/vector-icons
- Standard size: 24px for tab bar and headers
- Action icons: 20px
- Never use emojis

### Required Assets
1. **App Logo**: Simple, modern wordmark (TaskNote AI)
2. **Avatar Presets** (6 options):
   - Minimalist geometric patterns with productivity theme
   - Gradient circles with initials
   - Abstract productivity symbols (checkmark, lightning, star, etc.)
   - Color palette should match app colors
3. **Empty States**:
   - No tasks illustration (simple line art of completed checklist)
   - No history illustration (calendar with checkmark)
4. **Waveform Animation**: Dynamic bars for voice recording (generate programmatically)

### Accessibility Requirements
- Minimum touch target size: 44x44px
- Color contrast ratio: 4.5:1 for text
- Support Dynamic Type (iOS)
- VoiceOver labels for all interactive elements
- Haptic feedback for voice recording start/stop
- Error states with clear messaging

### Visual Feedback
- All buttons: opacity reduction on press (0.7-0.8)
- Swipe actions: reveal action buttons with color coding (green = complete, red = delete)
- Loading states: skeleton screens for lists, spinner for AI processing
- Success/error toasts: slide down from top, auto-dismiss in 3 seconds
- Pull-to-refresh: standard iOS behavior with activity indicator