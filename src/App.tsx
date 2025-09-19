import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminImpersonationProvider } from "@/hooks/useAdminImpersonation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OnboardingRoute } from "@/components/OnboardingRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Rating from "./pages/Rating";
import Feedback from "./pages/Feedback";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminImpersonationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <OnboardingRoute>
                    <Dashboard />
                  </OnboardingRoute>
                </ProtectedRoute>
              } />
              <Route path="/rate/:linkId" element={<Rating />} />
              <Route path="/feedback/:linkId" element={<Feedback />} />
              <Route path="/thank-you" element={<ThankYou />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AdminImpersonationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
