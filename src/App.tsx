
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DemoProvider } from "@/contexts/DemoContext";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AdminMFAGate } from "@/components/auth/AdminMFAGate";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-load routes that are NOT on the critical path
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const DataProcessing = lazy(() => import("./pages/DataProcessing"));
const Waitlist = lazy(() => import("./pages/Waitlist"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Admin = lazy(() => import("./pages/Admin").then(m => ({ default: m.Admin })));
const AdminWaitlist = lazy(() => import("./pages/AdminWaitlist"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminMatchCuration = lazy(() => import("./pages/AdminMatchCuration"));
const MilestoneCardShowcase = lazy(() => import("./components/social/MilestoneCardShowcase").then(m => ({ default: m.MilestoneCardShowcase })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,      // 30s before refetch
      gcTime: 5 * 60_000,     // 5m garbage collection
      retry: 1,               // Single retry on failure
      refetchOnWindowFocus: true, // Sync when user returns to tab
    },
  },
});

const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-foreground text-lg">Loading...</div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <DemoProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/data-processing" element={<DataProcessing />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/admin" element={<AdminMFAGate><Admin /></AdminMFAGate>} />
                  <Route path="/admin/waitlist" element={<AdminMFAGate><AdminWaitlist /></AdminMFAGate>} />
                  <Route path="/admin/analytics" element={<AdminMFAGate><AdminAnalytics /></AdminMFAGate>} />
                  <Route path="/admin/curation" element={<AdminMFAGate><AdminMatchCuration /></AdminMFAGate>} />
                  <Route path="/milestone-cards" element={<MilestoneCardShowcase />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            <CookieConsent />
          </TooltipProvider>
        </AuthProvider>
      </DemoProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
