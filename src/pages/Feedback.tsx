import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Feedback = () => {
  const { linkId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const rating = searchParams.get('rating');
  const ratingId = searchParams.get('ratingId');
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: "",
    improvements: "",
    wouldRecommend: undefined as boolean | undefined,
  });
  
  const [userLogo, setUserLogo] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>("");

  useEffect(() => {
    if (ratingId) {
      fetchUserData();
    }
  }, [ratingId]);

  const fetchUserData = async () => {
    try {
      // Get the rating data to find the review_link_id
      const { data: ratingData, error: ratingError } = await supabase
        .from('ratings')
        .select('review_link_id')
        .eq('id', ratingId)
        .single();

      if (ratingError) throw ratingError;

      // Get the review link data to find user_id and business name
      const { data: linkData, error: linkError } = await supabase
        .from('review_links')
        .select('user_id, name')
        .eq('id', ratingData.review_link_id)
        .single();

      if (linkError) throw linkError;

      setBusinessName(linkData.name);

      // Get user logo
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('logo_url')
        .eq('user_id', linkData.user_id)
        .single();
        
      if (!profileError && profileData?.logo_url) {
        setUserLogo(profileData.logo_url);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.feedback.trim()) {
      toast({
        title: "Feedback required",
        description: "Please provide your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!ratingId) {
      toast({
        title: "Invalid feedback link",
        description: "This feedback link is invalid.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Update rating with customer info
      if (formData.name || formData.email) {
        await supabase
          .from('ratings')
          .update({
            customer_name: formData.name || null,
            customer_email: formData.email || null,
          })
          .eq('id', ratingId);
      }

      // Insert feedback
      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert([{
          rating_id: ratingId,
          feedback_text: formData.feedback,
          improvement_suggestions: formData.improvements || null,
          would_recommend: formData.wouldRecommend,
        }]);

      if (feedbackError) throw feedbackError;

      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate you taking the time to help us improve.",
      });

      // Redirect to thank you page
      setTimeout(() => {
        navigate("/thank-you");
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error submitting feedback",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Business Logo - Outside card container */}
        <div className="mb-8 text-center">
          <img 
            src={userLogo || "/revulinkLogo.png"} 
            alt={userLogo ? `${businessName} logo` : "RevuLink logo"}
            className="w-24 h-24 mx-auto object-contain"
          />
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-inter-display font-bold mb-2 text-foreground">
              Sorry to hear that you're not satisfied.
            </h1>
            <p className="text-muted-foreground font-inter font-bold">
              Please provide us with your feedback and we'll do our best to improve.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium font-inter font-medium text-foreground">
                Name (optional)
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium font-inter font-medium text-foreground">
                Email (optional)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-sm font-medium text-foreground">
                Feedback *
              </Label>
              <Textarea
                id="feedback"
                placeholder="Please let us know what we can do to improve?"
                value={formData.feedback}
                onChange={(e) =>
                  setFormData({ ...formData, feedback: e.target.value })
                }
                className="min-h-[120px] resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="improvements" className="text-sm font-medium text-foreground">
                What can we improve? (optional)
              </Label>
              <Textarea
                id="improvements"
                placeholder="Specific suggestions for improvement..."
                value={formData.improvements}
                onChange={(e) =>
                  setFormData({ ...formData, improvements: e.target.value })
                }
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200">
                Would you recommend us to others?
              </Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={formData.wouldRecommend === true ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, wouldRecommend: true })}
                  className="flex-1"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={formData.wouldRecommend === false ? "destructive" : "outline"}
                  onClick={() => setFormData({ ...formData, wouldRecommend: false })}
                  className="flex-1"
                >
                  No
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;