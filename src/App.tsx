
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
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";
import DataProcessing from "./pages/DataProcessing";
import ResetPassword from "./pages/ResetPassword";
import { Admin } from "./pages/Admin";
import AdminWaitlist from "./pages/AdminWaitlist";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminMatchCuration from "./pages/AdminMatchCuration";
import { MilestoneCardShowcase } from "./components/social/MilestoneCardShowcase";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <DemoProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin" element={<AdminMFAGate><Admin /></AdminMFAGate>} />
                <Route path="/admin/waitlist" element={<AdminMFAGate><AdminWaitlist /></AdminMFAGate>} />
                <Route path="/admin/analytics" element={<AdminMFAGate><AdminAnalytics /></AdminMFAGate>} />
                <Route path="/admin/curation" element={<AdminMFAGate><AdminMatchCuration /></AdminMFAGate>} />
                <Route path="/milestone-cards" element={<MilestoneCardShowcase />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <CookieConsent />
          </TooltipProvider>
        </AuthProvider>
      </DemoProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
