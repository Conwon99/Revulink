import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StarRating from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Rating = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [linkData, setLinkData] = useState<{
    id: string;
    google_review_url: string;
    name: string;
    user_id: string;
  } | null>(null);
  
  const [userLogo, setUserLogo] = useState<string | null>(null);

  useEffect(() => {
    if (linkId) {
      fetchLinkData();
    }
  }, [linkId]);

  const fetchLinkData = async () => {
    try {
      const { data, error } = await supabase
        .from('review_links')
        .select('id, google_review_url, name, user_id')
        .eq('link_id', linkId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      
      setLinkData(data);
      
      // Fetch user logo
      if (data.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('logo_url')
          .eq('user_id', data.user_id)
          .single();
          
        if (!profileError && profileData?.logo_url) {
          setUserLogo(profileData.logo_url);
        }
      }
    } catch (error: any) {
      console.error('Error fetching link data:', error);
      toast({
        title: "Link not found",
        description: "This review link may be invalid or expired.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) return;
    
    setSubmitting(true);

    try {
      // Create rating record
      const redirectedToGoogle = rating >= 4;
      
      const { data: ratingData, error: ratingError } = await supabase
        .from('ratings')
        .insert([{
          review_link_id: linkData!.id,
          rating,
          redirected_to_google: redirectedToGoogle,
        }])
        .select()
        .single();

      if (ratingError) throw ratingError;

      if (redirectedToGoogle) {
        // Redirect to Google Reviews
        toast({
          title: "Thank you!",
          description: "You'll be redirected to leave a Google review.",
        });
        setTimeout(() => {
          window.location.href = linkData!.google_review_url;
        }, 1000);
      } else {
        // Redirect to feedback form
        navigate(`/feedback/${linkId}?rating=${rating}&ratingId=${ratingData.id}`);
      }
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error submitting rating",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Link Not Found</h1>
          <p className="text-muted-foreground">This review link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Business Logo - Outside card container */}
        <div className="mb-8 text-center">
          <img 
            src={userLogo || "/revulinkLogo.png"} 
            alt={userLogo ? `${linkData.name} logo` : "RevuLink logo"}
            className="w-24 h-24 mx-auto object-contain"
          />
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-inter-display font-bold mb-4 text-foreground">
              How did we do?
            </h1>
            <p className="text-muted-foreground font-inter font-bold">
              Your feedback helps us improve our service
            </p>
          </div>

          <div className="mb-8">
            <p className="text-muted-foreground text-sm mb-4 font-inter font-medium">
              Click on a star to rate your experience
            </p>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
              className="justify-center"
            />
          </div>

          <Button
            variant="hero"
            size="lg"
            onClick={handleRatingSubmit}
            disabled={rating === 0 || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Rating;