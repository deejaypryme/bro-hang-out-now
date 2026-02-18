

# Phase 3: Polish and Consistency

## Overview
Five deliverables: fix BroModePanel responsiveness with real data, clean up all console.log statements, resolve the activities dual data source, add a forgot password flow, and QuickActionsSection is already fixed from Phase 2.

---

## 1. BroModePanel -- Responsive + Real Data

**Problem:** The panel has a hardcoded `w-80` fixed width, uses non-design-system classes, and shows fake challenge progress (70%, 90%, 40%).

**Fix in `src/components/BroModePanel.tsx`:**
- Remove the `w-80` fixed width -- make it `w-full` so it fills its parent container
- Replace raw Tailwind classes (`bg-bg-primary`, `border-l`, `p-6`) with design system tokens (`glass-surface`, `p-bro-lg`, `rounded-bro-xl`, etc.)
- Calculate real challenge progress from `userStats`:
  - "Week Warrior" -- progress based on `totalHangouts` toward 5
  - "Badge Collector" -- progress based on earned achievements count
  - "Streak Builder" -- progress based on `currentStreak` toward 7
- Remove the static `recentChallenges` array, generate dynamically from data

**Fix in `src/pages/BroMode.tsx`:**
- Already responsive with `max-w-md mx-auto md:max-w-2xl` -- no changes needed here since the panel is wrapped in a Card

---

## 2. Clean Up Console Logs

**Problem:** 570+ `console.log` matches across 18 files. These are debug emoji-prefixed logs that clutter the browser console in production.

**Approach:** Remove all `console.log` statements from production code. Keep `console.error` calls (those are valuable for debugging real issues). Keep `console.warn` if any exist.

**Files to clean (all `console.log` removals):**
- `src/App.tsx` -- remove 2 logs
- `src/main.tsx` -- remove 1 log
- `src/contexts/AuthContext.tsx` -- remove ~12 logs (keep `console.error` lines)
- `src/services/notificationService.ts` -- remove ~6 logs
- `src/services/smartSuggestionsService.ts` -- remove 1 log
- `src/lib/calendarExport.ts` -- remove 1 log
- `src/services/retryUtils.ts` -- remove 1 log
- Any other files found in the search (18 files total)

The render-time log in AuthContext (`Rendering with state:`) is particularly bad as it fires on every re-render.

---

## 3. Resolve Activities Dual Source

**Problem:** Activities exist in two places:
1. `src/data/activities.ts` -- rich data with 30+ activities, categories, durations, types, emotional signals
2. Database `activities` table -- 10 rows with only name, emoji, category (no duration, no type)

The local file is the real source of truth used by `ActivitySelection.tsx` and `Invite.tsx`. The DB table appears unused in application code.

**Decision:** Keep the local `src/data/activities.ts` file as the single source of truth. It has richer data and is what the UI actually uses. No code changes needed -- just document this decision. The DB `activities` table can stay for potential future use (e.g., user-created custom activities) but won't be referenced by the UI.

No files to change for this item -- it's already correctly using local data.

---

## 4. Add Forgot Password Flow

**New file: `src/pages/ForgotPassword.tsx`**
- Simple form: email input + "Send Reset Link" button
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`
- Success message: "Check your email for a password reset link"
- Styled consistently with Login/Signup (glassmorphism card, same layout)

**New file: `src/pages/ResetPassword.tsx`**
- Listens for `type=recovery` in URL hash (Supabase redirects here after clicking email link)
- Form: new password + confirm password
- Calls `supabase.auth.updateUser({ password })`
- On success, redirects to `/home`
- Must be a public route (not behind ProtectedRoute)

**Update `src/pages/Login.tsx`:**
- Add "Forgot password?" link below the password field, linking to `/forgot-password`

**Update `src/App.tsx`:**
- Add `/forgot-password` route (public)
- Add `/reset-password` route (public)

---

## 5. QuickActionsSection (Already Done)

QuickActionsSection was already fixed in Phase 2 -- it now uses design system tokens and the dead "Import Contacts" button was removed. No further changes needed.

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/components/BroModePanel.tsx` | Responsive layout, real challenge data, design system tokens |
| `src/App.tsx` | Add 2 new routes, remove console.logs |
| `src/main.tsx` | Remove console.log |
| `src/contexts/AuthContext.tsx` | Remove ~12 console.logs |
| `src/services/notificationService.ts` | Remove ~6 console.logs |
| `src/services/smartSuggestionsService.ts` | Remove console.log |
| `src/lib/calendarExport.ts` | Remove console.log |
| `src/services/retryUtils.ts` | Remove console.log |
| `src/pages/Login.tsx` | Add "Forgot password?" link |
| `src/pages/ForgotPassword.tsx` | New -- forgot password form |
| `src/pages/ResetPassword.tsx` | New -- reset password form |

No database changes required.
