import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DiscountCode {
  id: string;
  code: string;
  message: string;
  is_active: boolean;
}

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const [discountCode, setDiscountCode] = useState<DiscountCode | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDiscountCode = async () => {
      try {
        // Get a random active discount code
        const { data, error } = await supabase
          .from('discount_codes')
          .select('*')
          .eq('is_active', true)
          .limit(1);

        if (error) {
          // If table doesn't exist, just show thank you without discount
          if (error.code === 'PGRST116' || error.message.includes('relation "discount_codes" does not exist')) {
            console.log('Discount codes table does not exist yet');
            setDiscountCode(null);
          } else {
            throw error;
          }
        } else if (data && data.length > 0) {
          setDiscountCode(data[0]);
        }
      } catch (error) {
        console.error('Error fetching discount code:', error);
        setDiscountCode(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountCode();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Discount code copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-inter font-bold text-green-600 mb-2">
              Thank You!
            </CardTitle>
            <p className="text-muted-foreground font-inter font-bold">
              Your feedback has been submitted successfully. We appreciate you taking the time to share your experience with us.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground font-inter font-bold mt-2">Loading...</p>
              </div>
            ) : discountCode ? (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Percent className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-semibold font-inter font-semibold text-green-800">
                      Special Reward for You!
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground font-inter font-bold mb-4">
                    {discountCode.message}
                  </p>
                  
                  <div className="bg-white border-2 border-dashed border-green-300 rounded-lg p-4 mb-4">
                    <p className="text-sm text-muted-foreground font-inter font-bold mb-2">Your Discount Code:</p>
                    <code className="text-2xl font-mono font-bold text-green-600 bg-green-50 px-4 py-2 rounded">
                      {discountCode.code}
                    </code>
                  </div>
                  
                  <Button
                    onClick={() => copyToClipboard(discountCode.code)}
                    className="w-full md:w-auto"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground font-inter font-bold">
                  Thank you for your valuable feedback!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThankYou;
