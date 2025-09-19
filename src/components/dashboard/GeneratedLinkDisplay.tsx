import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedLinkDisplayProps {
  linkData: {
    linkId: string;
    fullUrl: string;
    name: string;
    googleReviewUrl: string;
  };
  onBack: () => void;
}

const GeneratedLinkDisplay = ({ linkData, onBack }: GeneratedLinkDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkData.fullUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The review link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center shadow-glow">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Your Review Link is Ready!</h3>
        <p className="text-muted-foreground">
          Share this link with your customers to collect reviews
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Link Name</Label>
          <Input value={linkData.name} readOnly className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Review Destination</Label>
          <div className="flex gap-2">
            <Input value={linkData.googleReviewUrl} readOnly className="bg-muted flex-1" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(linkData.googleReviewUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium font-inter font-medium">Generated Review Link</Label>
        <div className="flex gap-3">
          <Input
            value={linkData.fullUrl}
            readOnly
            className="bg-accent text-sm font-mono"
          />
          <Button
            variant={copied ? "secondary" : "hero"}
            onClick={handleCopyLink}
            className="px-6"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-accent/50 rounded-lg p-4 border border-border">
        <h4 className="font-semibold font-inter font-medium mb-2">How it works:</h4>
        <ul className="text-sm text-muted-foreground font-inter font-bold space-y-1">
          <li>• Customers click your link and rate their experience</li>
          <li>• Happy customers (4-5 stars) go directly to Google Reviews</li>
          <li>• Unsatisfied customers (1-3 stars) provide private feedback</li>
          <li>• You get more positive reviews and actionable feedback</li>
        </ul>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Create Another Link
        </Button>
        <Button variant="hero" onClick={handleCopyLink} className="flex-1">
          <Copy className="h-4 w-4" />
          Copy & Share Link
        </Button>
      </div>
    </div>
  );
};

export default GeneratedLinkDisplay;