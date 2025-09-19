import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <img 
            src="/revulinkLogo.png" 
            alt="RevuLink Logo" 
            className="w-8 h-8 object-contain"
          />
          <h2 className="text-xl font-bold font-inter font-bold">RevuLink</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {user?.email}
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;