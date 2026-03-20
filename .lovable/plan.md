

## Problem Analysis

The splash screen code already has the text removed and shows only the animated hero image + Enter button. However, there are two issues preventing the changes from appearing:

1. **Stale session cache**: The `sessionStorage` key `monark-splash-seen-v3` from the previous version causes the splash to be instantly skipped for anyone who already viewed it.
2. **Unused import**: The `monarkLogoHorizontal` import on line 4 is still present (dead code), though this doesn't affect rendering.

## Plan

### Step 1: Bump the session storage key to v4
Change `monark-splash-seen-v3` → `monark-splash-seen-v4` in both the `useEffect` check and the `handleEnter` function inside `SplashScreen.tsx`. This forces the splash to replay so users can see the updated version.

### Step 2: Remove unused logo import
Delete the `import monarkLogoHorizontal` line since the logo is no longer displayed.

### Step 3: Sync Index.tsx session key
Update the `handleSplashComplete` function in `Index.tsx` (line 30) to also use the `monark-splash-seen-v4` key for consistency.

**Files modified**: `src/components/splash/SplashScreen.tsx`, `src/pages/Index.tsx`

