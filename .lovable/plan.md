

# BroYouFree - Deep Dive Assessment

## What Is This App?

BroYouFree is a social coordination app for scheduling hangouts with friends. The core loop: sign up, add friends, send hangout invites, coordinate times, track your social activity.

---

## WHAT'S WORKING WELL

### Architecture & Code Quality
- Clean React + TypeScript + Supabase stack
- Well-organized service layer (`friendsService`, `hangoutsService`, `availabilityService`)
- Good separation of concerns with custom hooks (`useDatabase.ts` has 20+ hooks)
- Proper error boundaries and loading fallbacks
- React Query for data fetching with retry logic
- Comprehensive TypeScript types in `src/types/database.ts`

### Database Design
- Solid schema: profiles, friendships (bidirectional), friend_invitations, hangouts, hangout_invitations, user_presence, user_availability
- RLS enabled on all tables with appropriate policies
- `handle_new_user` trigger auto-creates profiles and presence on signup
- User roles system with `has_role()` security definer function (no recursion issues)

### UI/UX
- Polished glassmorphism design with consistent brand (navy + orange)
- Comprehensive design system in CSS (typography, buttons, cards, spacing tokens)
- Mobile-first with bottom navigation
- Good empty states with CTAs guiding users to next action
- Welcome banner for new users
- Loading skeletons throughout

### Auth Flow
- Dedicated Login + Signup + Auth pages (3 auth entry points)
- Protected routes with redirect-back-to-origin
- Profile loaded in AuthContext

### Edge Functions
- `send-friend-invitation` with email (Resend) + SMS (Twilio) support and retry logic
- `send-hangout-invitation` and `send-hangout-notification` deployed

---

## WHAT'S BROKEN OR INCOMPLETE

### Critical Issues (Blocks Core Functionality)

1. **No landing page** - Route `/` redirects to `/login`, Header logout navigates to `/landing` (doesn't exist). No public-facing page explaining what the app is.

2. **Duplicate auth pages** - Three auth entry points (`/login`, `/signup`, `/auth`) doing the same thing. Confusing routing.

3. **NotificationCenter is orphaned** - The component exists and works but is NOT rendered anywhere in the app. Users have no way to see/respond to incoming hangout invitations from within the app.

4. **Hangout invitations have no linked hangout data** - `NotificationCenter` references `invitation.hangout?.activity_name` but `useHangoutInvitations` only fetches the invitation row, not the joined hangout. Hangout notifications will show "Hangout" with no details.

5. **Calendar page has hardcoded stats** - `broPoints: 485` is hardcoded on the Calendar page (line 31).

6. **"Import Contacts" button does nothing** - In `QuickActionsSection`, the "Import Contacts" button has no onClick handler.

7. **Activity Feed is static placeholder** - `ActivityFeed.tsx` shows static text, never fetches or displays real activity data. Just says "Your Activity Will Appear Here" forever.

### Medium Issues (Degraded Experience)

8. **No profile editing UI** - Users can't update their name, username, avatar, or phone after signup. The `profileService.updateProfile` exists but no UI calls it.

9. **No notification bell in header** - The Header has no way to access notifications. The `NotificationCenter` component is built but never mounted.

10. **QuickActionsSection inconsistent styling** - Uses raw Tailwind (`bg-white/80`, `text-gray-800`) instead of the design system tokens used everywhere else (`glass-surface`, `text-primary-navy`, etc.).

11. **BroModePanel hardcoded challenges** - "Week Warrior", "Response Rocket", "Activity Explorer" challenges are static with fake progress values (70%, 90%, 40%).

12. **BroModePanel layout issues** - Uses `w-80` fixed width sidebar layout that doesn't work well on mobile, despite the page wrapper trying to be responsive.

13. **CalendarSidebar may be empty/broken** - Not inspected in detail but it receives hangouts prop without clear rendering logic visible.

14. **No username collected at signup** - The signup form collects `full_name` but not `username`. Profile `username` is always null, making user search by username ineffective.

15. **Edge function email sends from `onboarding@resend.dev`** - This is a Resend sandbox domain. Emails likely go to spam or are undeliverable to non-verified addresses.

### Minor Issues

16. **Excessive console.log statements** - Debug logs throughout production code (emoji-prefixed logs in every service call).

17. **`src/data/` directory still exists** - Contains only `activities.ts` now, but the activities data is also in the database (10 rows in `activities` table). Dual source of truth.

18. **Three edge functions with similar patterns** - Could be consolidated but functional as-is.

19. **No "forgot password" flow** - Common feature missing from auth.

20. **friendships table has no DELETE RLS policy** - Users can't unfriend (the `removeFriend` service method exists but will fail due to missing DELETE policy).

---

## WHAT WE CAN FIX WITH AGENT MODE

### Phase 1: Fix Critical Flow (make it actually work end-to-end)

1. **Create a landing page** (`/`) - Public page explaining the app with CTA to sign up
2. **Consolidate auth** - Remove `/auth` page, keep `/login` and `/signup` with proper routing
3. **Add notification bell to Header** - Mount `NotificationCenter` as a dropdown/popover from the header
4. **Fix hangout invitation data** - Update `useHangoutInvitations` to join hangout details
5. **Fix Calendar hardcoded stats** - Use real data like Home/Friends pages do
6. **Add DELETE policy to friendships** - So unfriending actually works

### Phase 2: Complete Core Features

7. **Build profile settings page** - Edit name, username, avatar, phone, timezone
8. **Build real Activity Feed** - Query recent hangouts, friend additions, completed events
9. **Fix username collection at signup** - Add username field or auto-generate from email
10. **Remove "Import Contacts" dead button** or implement basic contact import

### Phase 3: Polish & Consistency

11. **Fix QuickActionsSection styling** - Align with design system
12. **Fix BroModePanel** - Make responsive, calculate real challenge progress
13. **Clean up console logs** - Remove or gate behind dev mode
14. **Resolve activities dual source** - Use DB activities or local data, not both
15. **Add forgot password flow**

### Phase 4: Production Readiness

16. **Configure Resend with real domain** - So invitation emails actually deliver
17. **Admin dashboard** - Leverage the user_roles system that's already built
18. **Add real-time updates** - Use Supabase realtime subscriptions for presence and notifications

---

## Recommended Priority

Start with Phase 1 (items 1-6). This gets the core user journey working:

```text
Landing Page --> Sign Up --> Home (with notifications) --> Add Friend --> Send Hangout --> Calendar shows it
```

Estimated effort: Phase 1 is ~2-3 sessions. Phase 2 is ~2 sessions. Phase 3-4 as time permits.

Shall I start with Phase 1?

