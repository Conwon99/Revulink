import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, ExternalLink, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminImpersonation } from "@/hooks/useAdminImpersonation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReviewLinkData {
  id: string;
  link_id: string;
  name: string;
  google_review_url: string;
  full_url: string;
  created_at: string;
}

interface QuickLinksDisplayProps {
  onCreateNew: () => void;
}

const QuickLinksDisplay = ({ onCreateNew }: QuickLinksDisplayProps) => {
  const [links, setLinks] = useState<ReviewLinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { impersonatedUserId, isImpersonating } = useAdminImpersonation();
  const { toast } = useToast();

  // Use impersonated user ID if admin is impersonating, otherwise use current user
  const targetUserId = isImpersonating ? impersonatedUserId : user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchRecentLinks();
    }
  }, [targetUserId]);

  const fetchRecentLinks = async () => {
    try {
      const { data: linksData, error } = await supabase
        .from('review_links')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      const linksWithUrls = linksData.map(link => ({
        ...link,
        full_url: `${window.location.origin}/rate/${link.link_id}`
      }));

      setLinks(linksWithUrls);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (fullUrl: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLinkId(linkId);
      toast({
        title: "Link copied!",
        description: "The review link has been copied to your clipboard.",
      });
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return null;
  }

  if (links.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No review links generated yet</p>
            <Button onClick={onCreateNew} variant="hero" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Link
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-0 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-primary"></div>
      <CardHeader className="pl-6 pr-4 pt-4 pb-2">
        <CardTitle className="text-lg text-gray-200">Your Review Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pl-6 pr-4 pb-4">
        {links.map((link) => (
          <div 
            key={link.id} 
            className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {link.name || "Unnamed Link"}
              </div>
              <div className="text-xs text-muted-foreground font-mono truncate">
                {link.full_url}
              </div>
            </div>
            <div className="flex gap-2 ml-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(link.google_review_url, '_blank')}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                variant={copiedLinkId === link.id ? "secondary" : "hero"}
                size="sm"
                onClick={() => handleCopyLink(link.full_url, link.id)}
                className="h-8 px-3"
              >
                {copiedLinkId === link.id ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        ))}
        
        {links.length >= 3 && (
          <div className="pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCreateNew}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Another Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickLinksDisplay;