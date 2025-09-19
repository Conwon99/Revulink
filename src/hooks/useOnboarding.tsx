import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useOnboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || authLoading) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error checking onboarding status:", error);
          setNeedsOnboarding(true); // Default to needing onboarding if we can't check
        } else {
          setNeedsOnboarding(!data?.onboarding_completed);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setNeedsOnboarding(true);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading]);

  return { needsOnboarding, loading };
};