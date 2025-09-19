import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star, MessageSquare, TrendingUp, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

const Index = () => {

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SiteHeader />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/revulink back.png")',
            opacity: 0.4
          }}
        ></div>
        
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 overflow-x-hidden">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-inter-display font-extrabold mb-6 leading-tight" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', lineHeight: 'clamp(2.5rem, 7vw, 5rem)', letterSpacing: '-0.05em' }}>
              The <span className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 bg-clip-text text-transparent">5-star</span><br />
              review machine
            </h1>
            <p className="font-inter font-normal text-white max-w-3xl mx-auto mb-8" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', lineHeight: 'clamp(1.5rem, 3vw, 1.875rem)' }}>
              Automatically redirect happy customers to Google Reviews while capturing valuable feedback from unsatisfied customers.
            </p>
            
            {/* Five Stars */}
            <div className="flex justify-center space-x-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            
            <Link to="/auth">
              <Button variant="hero" size="lg" className="px-8 py-6 h-auto" style={{ fontFamily: 'sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: 'normal', color: 'rgb(255, 255, 255)' }}>
                Get Started Today
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-inter-display font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground font-inter font-bold max-w-2xl mx-auto">
              Our intelligent system routes customers based on their satisfaction level, 
              protecting your online reputation while gathering valuable feedback.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center shadow-soft">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold font-inter-display font-medium mb-2">Customer Rates Experience</h3>
              <p className="text-muted-foreground font-inter font-bold">
                Customers click your link and provide a 1-5 star rating of their experience.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-4 flex items-center justify-center shadow-soft">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold font-inter-display font-medium mb-2">Smart Routing</h3>
              <p className="text-muted-foreground font-inter font-bold">
                Happy customers (4-5 stars) go to Google Reviews. Others provide private feedback.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent border-2 border-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold font-inter-display font-medium mb-2">Actionable Insights</h3>
              <p className="text-muted-foreground font-inter font-bold">
                Get more positive reviews online while receiving constructive feedback privately.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Section */}
      <div id="contact" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-inter-display font-bold mb-4">Get In Touch</h2>
          <p className="text-muted-foreground font-inter font-bold max-w-2xl mx-auto mb-8">
            Ready to boost your online reputation? Contact us to learn more about how RevuLink can help your business.
          </p>
          <Link to="/auth">
            <Button variant="hero" size="lg" style={{ fontFamily: 'sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: 'normal', color: 'rgb(255, 255, 255)' }}>
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;