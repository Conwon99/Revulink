import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, ChevronRight, ChevronLeft, Search, LogIn, Building, Star, Copy } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleReviewLink, setGoogleReviewLink] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 8);
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleReviewLink) {
      toast.error("Please enter your Google Review link");
      return;
    }

    setLoading(true);
    try {
      // Save to profiles and create a review link
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ google_review_link: googleReviewLink })
        .eq("user_id", user?.id);

      if (profileError) throw profileError;

      // Create the actual review link
      const linkId = generateUniqueId();
      const { error: linkError } = await supabase
        .from("review_links")
        .insert({
          user_id: user?.id,
          link_id: linkId,
          name: "My Business Review Link",
          google_review_url: googleReviewLink,
          status: "active"
        });

      if (linkError) throw linkError;
      
      setStep(2);
      toast.success("Review link created successfully!");
    } catch (error: any) {
      toast.error("Error saving link: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (skipLogo = false) => {
    setLoading(true);
    try {
      let logoUrl = null;

      if (logoFile && !skipLogo) {
        // For now, we'll skip file upload and just mark onboarding as complete
        // In a real implementation, you'd upload to Supabase Storage
        toast.success("Logo upload feature coming soon!");
      }

      const { error } = await supabase
        .from("profiles")
        .update({ 
          logo_url: logoUrl,
          onboarding_completed: true 
        })
        .eq("user_id", user?.id);

      if (error) throw error;
      
      toast.success("Onboarding completed!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Error completing onboarding: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setLogoFile(file);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <SiteHeader />
        <div className="flex items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold font-inter-display font-bold">Welcome! Let's Get Started</CardTitle>
            <CardDescription className="font-inter font-bold">Step 1 of 2: Set up your Google Review link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-lg border border-primary/10">
              <h3 className="font-semibold font-inter-display font-medium mb-6 text-center">How to Get Your Google Business Review Link</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Search className="h-4 w-4 text-primary" />
                      <span className="font-medium text-gray-900">Search for Google Business Profile</span>
                    </div>
                    <p className="text-sm text-gray-600">Type "Google Business Profile" into Google, or click this link: <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">business.google.com</a></p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <LogIn className="h-4 w-4 text-primary" />
                      <span className="font-medium text-gray-900">Sign in to your account</span>
                    </div>
                    <p className="text-sm text-gray-600">Use the same Google account that manages your business</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Building className="h-4 w-4 text-primary" />
                      <span className="font-medium text-gray-900">Select your business</span>
                    </div>
                    <p className="text-sm text-gray-600">Choose the business you want to generate a review link for</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="font-medium text-gray-900">Click "Ask for reviews"</span>
                    </div>
                    <p className="text-sm text-gray-600">This will generate your Google review link</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Copy className="h-4 w-4 text-primary" />
                      <span className="font-medium text-gray-900">Copy the review link</span>
                    </div>
                    <p className="text-sm text-gray-600">Copy the generated link and paste it in the field below</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <Label htmlFor="google-link">Google Business Review Link</Label>
                <Input
                  id="google-link"
                  type="url"
                  placeholder="https://g.page/r/..."
                  value={googleReviewLink}
                  onChange={(e) => setGoogleReviewLink(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                {loading ? "Saving..." : "Continue to Step 2"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteHeader />
      <div className="flex items-center justify-center p-4 pt-24">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold font-inter-display font-bold">Almost Done!</CardTitle>
          <CardDescription className="font-inter font-bold">Step 2 of 2: Upload your business logo (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="space-y-2">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <span className="text-sm font-medium">Click to upload your logo</span>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 2MB
                </p>
              </div>
              {logoFile && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {logoFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
              className="flex-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleStep2Submit(true)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Finishing..." : "Skip for Now"}
            </Button>
            <Button 
              onClick={() => handleStep2Submit(false)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Finishing..." : "Complete Setup"}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Onboarding;