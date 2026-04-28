/**
 * src/components/landing/LandingPage.tsx
 *
 * Canonical landing-page barrel for MonArk.
 *
 * The source component lives in components/demo/EnhancedLandingPage.tsx
 * (legacy location from early Lovable scaffolding). This file is the
 * authoritative import path going forward — all new code should import
 * from here. The /demo folder import is kept alive only for backward
 * compat with any existing references in the demo shell.
 *
 * TODO (low-priority): Move EnhancedLandingPage.tsx physically into this
 * folder and delete the old path once all references are updated.
 */
export { EnhancedLandingPage } from '@/components/demo/EnhancedLandingPage';
