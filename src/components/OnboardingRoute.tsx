import { useOnboarding } from "@/hooks/useOnboarding";
import { Navigate } from "react-router-dom";

interface OnboardingRouteProps {
  children: React.ReactNode;
}

export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const { needsOnboarding, loading } = useOnboarding();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}