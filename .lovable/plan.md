

# Fix Password Reset Redirect URL

## Problem
The forgot password flow uses `window.location.origin` for the redirect URL. When triggered from localhost or the preview URL, the recovery email link points to the wrong origin, causing "Email link is invalid or has expired" errors.

## Immediate Workaround (Manual)
1. Go to the Supabase Dashboard > Authentication > Users
2. Find `mrdavidmonroe@gmail.com`
3. Either delete the user and re-sign up from the live preview, or manually set a new password via the Supabase dashboard

## Code Fix

### `src/pages/ForgotPassword.tsx`
Replace `window.location.origin` with a reliable redirect URL that always works:

```typescript
const redirectUrl = window.location.origin.includes('localhost')
  ? 'https://bro-hang-out-now.lovable.app/reset-password'
  : `${window.location.origin}/reset-password`;
```

This ensures the recovery email always links to the published app URL, even if the reset was triggered from localhost or a preview URL.

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/ForgotPassword.tsx` | Use published URL as redirect fallback instead of raw `window.location.origin` |

No database changes required.
