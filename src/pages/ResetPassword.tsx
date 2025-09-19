import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import SiteHeader from "@/components/SiteHeader";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  
  const { updatePassword, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Check if user is authenticated and has a valid session for password reset
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, loading, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await updatePassword(formData.password);

    if (error) {
      toast({
        title: "Password update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } else {
      setPasswordUpdated(true);
      toast({
        title: "Password updated successfully",
        description: "Your password has been updated. You can now sign in with your new password.",
      });
    }

    setIsLoading(false);
  };

  const handleBackToSignIn = () => {
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (passwordUpdated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/revulink back.png")',
            opacity: 0.4
          }}
        ></div>
        
        <SiteHeader />
        <div className="relative flex items-center justify-center p-4 pt-24">
          <Card className="w-full max-w-md shadow-card border-0">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold font-inter-display font-bold">Password Updated!</CardTitle>
              <p className="text-muted-foreground">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleBackToSignIn}
                className="w-full"
                variant="hero"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/revulink back.png")',
          opacity: 0.4
        }}
      ></div>
      
      <SiteHeader />
      <div className="relative flex items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-md shadow-card border-0">
          <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold font-inter-display font-bold">Reset Your Password</CardTitle>
            <p className="text-muted-foreground">
              Enter your new password below
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Updating password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
