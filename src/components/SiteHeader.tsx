import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Star, User, LogOut, LayoutDashboard } from "lucide-react";

const SiteHeader = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 font-bold text-2xl font-inter font-bold tracking-tight">
          <img 
            src="/revulinkLogo.png" 
            alt="RevuLink Logo" 
            className="w-8 h-8 object-contain"
          />
          RevuLink
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className="font-inter font-semibold text-gray-900 hover:text-gray-700 transition-colors"
            style={{ fontSize: '14px', lineHeight: '20px' }}
          >
            Home
          </Link>
          <Link 
            to="/#features" 
            className="font-inter font-semibold text-gray-900 hover:text-gray-700 transition-colors"
            style={{ fontSize: '14px', lineHeight: '20px' }}
          >
            Features
          </Link>
          <Link 
            to="/#contact" 
            className="font-inter font-semibold text-gray-900 hover:text-gray-700 transition-colors"
            style={{ fontSize: '14px', lineHeight: '20px' }}
          >
            Contact
          </Link>
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline font-inter font-semibold" style={{ fontSize: '14px', lineHeight: '20px' }}>Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2 font-inter font-semibold" style={{ fontSize: '14px', lineHeight: '20px' }}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 font-inter font-semibold" style={{ fontSize: '14px', lineHeight: '20px' }}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="hero" size="sm" style={{ fontFamily: 'sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: 'normal', color: 'rgb(255, 255, 255)' }}>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;