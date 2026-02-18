

# Phase 2: Core Features Implementation

## Overview
Three deliverables: a Profile Settings page, a real Activity Feed, and username collection at signup. This completes the core user experience loop.

---

## 1. Profile Settings Page

**New file: `src/pages/Profile.tsx`**

A dedicated page where users can edit their profile information. Fields:
- Full Name (text input)
- Username (text input, with availability hint)
- Phone (text input)
- Timezone (dropdown, reuse existing `TimezoneSelector` component)
- Avatar URL (text input for now -- Supabase Storage bucket can come later)

Uses `profileService.updateProfile()` which already exists in `src/services/database.ts`. On save, also refresh the profile in AuthContext so the Header updates immediately.

**Add `refreshProfile()` to AuthContext** so after saving profile changes, the app reflects them without a page reload.

**Add route** `/profile` in `App.tsx` as a protected route.

**Add "Profile" option** to the user dropdown menu in `Header.tsx` (currently only has "Sign Out").

**Add Profile link** to `MobileNavigation.tsx` -- replace or add a 5th nav item, or add it as an option accessible from the Header avatar menu (keeping 4 nav items is cleaner for mobile).

---

## 2. Real Activity Feed

**Rewrite `src/components/ActivityFeed.tsx`** to query actual data:

- Fetch recent hangouts (last 10, ordered by `created_at` desc) from the existing `useHangouts` hook
- Fetch recent friendships (last 5, ordered by `created_at` desc) from `useFriends` hook  
- Merge and sort by timestamp to create a unified activity timeline
- Each item shows: emoji icon, description ("You scheduled Basketball with Alex"), and relative time ("2 hours ago")

Activity types to display:
- Hangout created: "You planned {emoji} {activity} with {friend}"
- Hangout confirmed: "{emoji} {activity} with {friend} is confirmed!"  
- Hangout completed: "You hung out with {friend} -- {emoji} {activity}"
- Friend added: "You and {friend} are now friends"

Uses data already available from `useHangouts` and `useFriends` -- no new database queries needed. The parent `Home.tsx` already passes `friends` as a prop and has `hangouts` available.

**Update `Home.tsx`** to pass `hangouts` to `ActivityFeed` as well.

---

## 3. Fix Username at Signup

**Update `src/pages/Signup.tsx`**:
- Add a "Username" input field between Full Name and Email
- Auto-generate a suggestion from the email prefix as the user types their email (e.g., `john` from `john@gmail.com`)
- Pass `username` in the metadata: `signUp(email, password, { full_name: fullName, username })`

The `handle_new_user` database trigger already reads `username` from `raw_user_meta_data` and inserts it into the profiles table, so no DB changes needed.

---

## 4. Remove Dead "Import Contacts" Button

In `QuickActionsSection.tsx`, remove the "Import Contacts" button that has no handler. Replace with a "Schedule Hangout" CTA that navigates to `/invite`.

Also fix the inconsistent styling in this component to use the design system tokens (`glass-surface`, `text-primary-navy`, etc.) instead of raw Tailwind (`bg-white/80`, `text-gray-800`).

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/pages/Profile.tsx` | Profile settings page with form |

### Files to Modify
| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/profile` route |
| `src/contexts/AuthContext.tsx` | Add `refreshProfile()` method |
| `src/components/Header.tsx` | Add "Profile" link in user menu |
| `src/pages/Signup.tsx` | Add username field |
| `src/components/ActivityFeed.tsx` | Rewrite with real data |
| `src/pages/Home.tsx` | Pass hangouts to ActivityFeed |
| `src/components/QuickActionsSection.tsx` | Fix styling, remove dead button |

### No Database Changes Required
- `profileService.updateProfile()` already exists
- `handle_new_user` trigger already handles `username` from metadata
- Activity feed uses existing hangouts/friends data

