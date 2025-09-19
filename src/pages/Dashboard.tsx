import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, BarChart3, Settings, Shield, Users, MessageSquare, ArrowLeft, Star, LayoutDashboard, Percent, Upload, X, Image as ImageIcon, Menu, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminImpersonation } from "@/hooks/useAdminImpersonation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LinkGeneratorForm from "@/components/dashboard/LinkGeneratorForm";
import ReviewsTable from "@/components/dashboard/ReviewsTable";
import GeneratedLinksTable from "@/components/dashboard/GeneratedLinksTable";
import QuickLinksDisplay from "@/components/dashboard/QuickLinksDisplay";
import AdminReviewsTable from "@/components/dashboard/AdminReviewsTable";
import AdminUsersTable from "@/components/dashboard/AdminUsersTable";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import DiscountsPanel from "@/components/dashboard/DiscountsPanel";

const Dashboard = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { impersonatedUserId, impersonatedUserName, setImpersonation, clearImpersonation, isImpersonating } = useAdminImpersonation();
  const [activeTab, setActiveTab] = useState("analytics");
  const [adminSubTab, setAdminSubTab] = useState("reviews");
  const [reviewsSubTab, setReviewsSubTab] = useState("reviews");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);

  const handleViewUserDashboard = (userId: string, userName: string) => {
    setImpersonation(userId, userName);
    setActiveTab("reviews"); // Switch to their dashboard view
  };

  // Fetch current logo on component mount
  useEffect(() => {
    if (user?.id) {
      fetchCurrentLogo();
    }
  }, [user?.id]);

  const fetchCurrentLogo = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('logo_url')
        .eq('user_id', user?.id)
        .single();
        
      if (!error && data?.logo_url) {
        setCurrentLogo(data.logo_url);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, etc.).",
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile || !user?.id) return;
    
    setLogoLoading(true);
    try {
      // For now, we'll create a data URL and store it directly
      // In production, you'd upload to Supabase Storage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const logoUrl = e.target?.result as string;
        
        const { error } = await supabase
          .from('profiles')
          .update({ logo_url: logoUrl })
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setCurrentLogo(logoUrl);
        setLogoFile(null);
        toast({
          title: "Logo uploaded successfully!",
          description: "Your logo will now appear on review pages.",
        });
      };
      reader.readAsDataURL(logoFile);
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLogoLoading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!user?.id) return;
    
    setLogoLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ logo_url: null })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setCurrentLogo(null);
      toast({
        title: "Logo removed",
        description: "The star icon will now be shown on review pages.",
      });
    } catch (error: any) {
      console.error('Error removing logo:', error);
      toast({
        title: "Error",
        description: "Failed to remove logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLogoLoading(false);
    }
  };

  const sidebarItems = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "generate", label: "Generate", icon: Plus },
    { id: "discounts", label: "Discounts", icon: Percent },
    ...(isAdmin ? [{ id: "admin", label: "Admin", icon: Shield }] : []),
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "generate":
  return (
            <Card className="shadow-card border-0">
              <CardHeader>
              <CardTitle className="text-2xl font-inter-display font-bold">Generate New Review Link</CardTitle>
              <p className="text-muted-foreground font-inter font-bold">
                  Create a smart link that routes customers based on their rating
                </p>
              </CardHeader>
              <CardContent>
                <LinkGeneratorForm />
              </CardContent>
            </Card>
        );
      
      case "analytics":
        return <AnalyticsPanel />;
      
      case "discounts":
        return <DiscountsPanel />;
      
      case "reviews":
        return (
            <Card className="shadow-card border-0">
              <CardHeader>
              <CardTitle className="text-2xl font-inter-display font-bold">Reviews & Links</CardTitle>
              <p className="text-muted-foreground font-inter font-bold">
                  View all ratings, feedback, and manage your generated review links
                </p>
              </CardHeader>
              <CardContent>
                <Tabs value={reviewsSubTab} onValueChange={setReviewsSubTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="reviews" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Reviews
                    </TabsTrigger>
                    <TabsTrigger value="links" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Generated Links
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="reviews" className="space-y-4">
                    <ReviewsTable />
                  </TabsContent>

                  <TabsContent value="links" className="space-y-4">
                    <GeneratedLinksTable />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
        );

      case "admin":
        return (
              <Card className="shadow-card border-0">
                <CardHeader>
              <CardTitle className="text-2xl font-inter font-bold flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    Admin Dashboard
                  </CardTitle>
              <p className="text-muted-foreground font-inter font-bold">
                    Manage users and view all platform activity
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs value={adminSubTab} onValueChange={setAdminSubTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                      <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Users
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        All Reviews
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-4">
                      <AdminUsersTable onViewUserDashboard={handleViewUserDashboard} />
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-4">
                      <AdminReviewsTable />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
        );

      case "settings":
        return (
            <Card className="shadow-card border-0">
              <CardHeader>
              <CardTitle className="text-2xl font-inter-display font-bold">Account Settings</CardTitle>
              <p className="text-muted-foreground font-inter font-bold">
                  Manage your account preferences and profile
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Logo Upload Section */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg font-semibold">Business Logo</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload your business logo to replace the RevuLink logo on review pages
                      </p>
                    </div>
                    
                    {currentLogo ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={currentLogo} 
                            alt="Current logo" 
                            className="w-20 h-20 rounded-lg object-contain border border-border shadow-sm"
                          />
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Current Logo</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveLogo}
                              disabled={logoLoading}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove Logo
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">
                          No logo uploaded. The star icon will be shown on review pages.
                        </p>
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="logo-upload"
                          />
                          <Label htmlFor="logo-upload" className="cursor-pointer">
                            <Button variant="outline" asChild>
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Logo
                              </span>
                            </Button>
                          </Label>
                        </div>
                      </div>
                    )}
                    
                    {logoFile && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={URL.createObjectURL(logoFile)} 
                            alt="Preview" 
                            className="w-20 h-20 rounded-lg object-contain border border-border shadow-sm"
                          />
                          <div className="space-y-2">
                            <p className="text-sm font-medium">New Logo Preview</p>
                            <p className="text-xs text-muted-foreground">{logoFile.name}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleLogoUpload}
                            disabled={logoLoading}
                            className="flex-1"
                          >
                            {logoLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Uploading...
                              </>
                            ) : (
                              "Upload Logo"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setLogoFile(null)}
                            disabled={logoLoading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Information */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg font-semibold">Account Information</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your account details (read-only)
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input 
                          value={user?.user_metadata?.first_name || ''} 
                          readOnly 
                          className="bg-muted" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input 
                          value={user?.user_metadata?.last_name || ''} 
                          readOnly 
                          className="bg-muted" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input 
                        value={user?.email || ''} 
                        readOnly 
                        className="bg-muted" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        );
      
      default:
        return <AnalyticsPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <DashboardHeader />
      
      <div className="flex">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden fixed top-4 left-4 z-50 bg-card"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border min-h-screen transition-transform duration-300 ease-in-out`}>
          <div className="p-6">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={`w-full justify-start font-inter font-semibold ${
                      activeTab === item.id 
                        ? "bg-primary text-primary-foreground" 
                        : "text-foreground hover:bg-muted"
                    }`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 pt-16 lg:pt-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-8 space-y-6">
              {isImpersonating ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearImpersonation}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Admin
                    </Button>
                    <Badge variant="secondary" className="text-sm">
                      Admin Mode: Viewing {impersonatedUserName}'s Dashboard
                    </Badge>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold font-inter font-bold mb-2">
                      {impersonatedUserName}'s Dashboard
                    </h1>
                    <p className="text-muted-foreground font-inter font-bold mb-6">
                      You are viewing this user's review links and feedback as an administrator
                    </p>
                    <QuickLinksDisplay onCreateNew={() => setActiveTab("generate")} />
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold font-inter font-bold mb-2">
                    Welcome back, {user?.user_metadata?.first_name || 'there'}!
                  </h1>
                  <p className="text-muted-foreground font-inter font-bold mb-6">
                    Manage your review links and track customer feedback
                  </p>
                  
                  {/* Quick Stats and Review Link */}
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full lg:w-auto min-w-0">
                           <Card className="w-full sm:w-48 aspect-square bg-muted border border-gray-600 relative overflow-hidden">
                             <div className="absolute left-0 top-0 bottom-0 w-3 bg-primary"></div>
                             <CardHeader className="pl-6 pr-4 pt-4 pb-2">
                               <CardTitle className="text-sm font-medium font-inter font-medium text-gray-200">Positive Reviews Posted</CardTitle>
                             </CardHeader>
                             <CardContent className="pl-6 pr-4 pb-4">
                               <div className="text-4xl font-bold font-inter font-bold text-white">4</div>
                             </CardContent>
                             <CheckCircle className="h-16 w-16 text-primary absolute bottom-4 right-4" />
                           </Card>

                           <Card className="w-full sm:w-48 aspect-square bg-muted border border-gray-600 relative overflow-hidden">
                             <div className="absolute left-0 top-0 bottom-0 w-3 bg-primary"></div>
                             <CardHeader className="pl-6 pr-4 pt-4 pb-2">
                               <CardTitle className="text-sm font-medium font-inter font-medium text-white">Negative Reviews Captured</CardTitle>
                             </CardHeader>
                             <CardContent className="pl-6 pr-4 pb-4">
                               <div className="text-4xl font-bold font-inter font-bold text-white">2</div>
                             </CardContent>
                             <X className="h-16 w-16 text-primary absolute bottom-4 right-4" />
                           </Card>

                           <Card className="w-full sm:w-48 aspect-square bg-muted border border-gray-600 relative overflow-hidden">
                             <div className="absolute left-0 top-0 bottom-0 w-3 bg-primary"></div>
                             <CardHeader className="pl-6 pr-4 pt-4 pb-2">
                               <CardTitle className="text-sm font-medium font-inter font-medium text-gray-200">Average Reviews</CardTitle>
                             </CardHeader>
                             <CardContent className="pl-6 pr-4 pb-4">
                               <div className="text-4xl font-bold font-inter font-bold text-white">4.0</div>
                             </CardContent>
                             <BarChart3 className="h-16 w-16 text-primary absolute bottom-4 right-4" />
                           </Card>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <QuickLinksDisplay onCreateNew={() => setActiveTab("generate")} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="space-y-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;