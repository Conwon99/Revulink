import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="flex items-center justify-center pt-24 pb-12 bg-muted/30">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold font-inter-display font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/80 transition-colors">
          Return to Home
        </a>
      </div>
      </div>
    </div>
  );
};

export default NotFound;
