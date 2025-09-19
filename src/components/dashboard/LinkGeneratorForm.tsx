import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminImpersonation } from "@/hooks/useAdminImpersonation";
import GeneratedLinkDisplay from "./GeneratedLinkDisplay";

const LinkGeneratorForm = () => {
  const [name, setName] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<{
    linkId: string;
    fullUrl: string;
    name: string;
    googleReviewUrl: string;
  } | null>(null);
  
  const { user } = useAuth();
  const { impersonatedUserId, isImpersonating } = useAdminImpersonation();
  const { toast } = useToast();

  // Use impersonated user ID if admin is impersonating, otherwise use current user
  const targetUserId = isImpersonating ? impersonatedUserId : user?.id;

  const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !googleReviewUrl) {
      toast({
        title: "All fields required",
        description: "Please fill in both the link name and Google review URL.",
        variant: "destructive",
      });
      return;
    }

    if (!targetUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate links.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const linkId = generateUniqueId();
      const fullUrl = `${window.location.origin}/rate/${linkId}`;
      
      const { error } = await supabase
        .from('review_links')
        .insert([{
          user_id: targetUserId,
          link_id: linkId,
          name: name,
          google_review_url: googleReviewUrl,
        }]);

      if (error) throw error;

      setGeneratedLink({
        linkId,
        fullUrl,
        name,
        googleReviewUrl,
      });

      toast({
        title: "Link generated successfully!",
        description: "Your review collection link is ready to share.",
      });
    } catch (error: any) {
      console.error('Error generating link:', error);
      toast({
        title: "Generation failed",
        description: error.message || "There was an error generating your link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setGeneratedLink(null);
    setName("");
    setGoogleReviewUrl("");
  };

  if (generatedLink) {
    return (
      <GeneratedLinkDisplay 
        linkData={generatedLink}
        onBack={handleBack}
      />
    );
  }

  return (
    <form onSubmit={handleGenerateLink} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Link Name *
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g., Restaurant Feedback"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          Give your review link a descriptive name for easy identification
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="googleReviewUrl" className="text-sm font-medium">
          Google My Business Review Link *
        </Label>
        <Input
          id="googleReviewUrl"
          type="url"
          placeholder="https://g.page/r/your-business-reviews"
          value={googleReviewUrl}
          onChange={(e) => setGoogleReviewUrl(e.target.value)}
          required
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          Happy customers (4-5 stars) will be redirected here
        </p>
      </div>

      <Button
        type="submit"
        variant="hero"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Generating Link...
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            Generate Review Link
          </>
        )}
      </Button>
    </form>
  );
};

export default LinkGeneratorForm;