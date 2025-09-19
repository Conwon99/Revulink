import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Copy, Percent } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DiscountCode {
  id: string;
  code: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

const DiscountsPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, check localStorage
        if (error.code === 'PGRST116' || error.message.includes('relation "discount_codes" does not exist')) {
          console.log('Discount codes table does not exist yet, checking localStorage');
          const localDiscounts = JSON.parse(localStorage.getItem('discount_codes') || '[]');
          setDiscounts(localDiscounts);
          return;
        }
        throw error;
      }
      setDiscounts(data || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      // Fallback to localStorage
      const localDiscounts = JSON.parse(localStorage.getItem('discount_codes') || '[]');
      setDiscounts(localDiscounts);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateDiscount = async () => {
    if (!user || !newCode.trim() || !newMessage.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both code and message",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('discount_codes')
        .insert({
          user_id: user.id,
          code: newCode.trim().toUpperCase(),
          message: newMessage.trim(),
          is_active: true
        });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "discount_codes" does not exist')) {
          // Fallback to localStorage for now
          const newDiscount = {
            id: Date.now().toString(),
            code: newCode.trim().toUpperCase(),
            message: newMessage.trim(),
            is_active: true,
            created_at: new Date().toISOString()
          };
          
          const existingDiscounts = JSON.parse(localStorage.getItem('discount_codes') || '[]');
          existingDiscounts.push(newDiscount);
          localStorage.setItem('discount_codes', JSON.stringify(existingDiscounts));
          
          toast({
            title: "Success",
            description: "Discount code created (stored locally). Please set up the database table for full functionality.",
          });
          
          setNewCode("");
          setNewMessage("");
          fetchDiscounts();
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Discount code created successfully",
      });

      setNewCode("");
      setNewMessage("");
      fetchDiscounts();
    } catch (error) {
      console.error('Error creating discount:', error);
      toast({
        title: "Error",
        description: "Failed to create discount code. Please check your database setup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Discount code ${!isActive ? 'activated' : 'deactivated'}`,
      });

      fetchDiscounts();
    } catch (error) {
      console.error('Error updating discount:', error);
      toast({
        title: "Error",
        description: "Failed to update discount code",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discount code deleted",
      });

      fetchDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast({
        title: "Error",
        description: "Failed to delete discount code",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-inter font-bold flex items-center gap-2">
            <Percent className="h-6 w-6 text-primary" />
            Discount Management
          </CardTitle>
          <p className="text-muted-foreground font-inter font-bold">
            Create discount codes to reward customers for their feedback
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create New Discount */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-inter font-semibold">Create New Discount Code</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Discount Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="e.g., SAVE20"
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setNewCode(generateCode())}
                    className="px-3"
                  >
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Thank You Message</Label>
                <Input
                  id="message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="e.g., Thank you! Use code SAVE20 for 20% off"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateDiscount} 
              disabled={loading || !newCode.trim() || !newMessage.trim()}
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Discount Code
            </Button>
          </div>

          {/* Existing Discounts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-inter font-semibold">Your Discount Codes</h3>
            {discounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No discount codes created yet</p>
                <p className="text-sm">Create your first discount code above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {discounts.map((discount) => (
                  <Card key={discount.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                            {discount.code}
                          </code>
                          <Badge variant={discount.is_active ? "default" : "secondary"}>
                            {discount.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-inter font-bold">
                          {discount.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {new Date(discount.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(discount.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(discount.id, discount.is_active)}
                        >
                          {discount.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDiscount(discount.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountsPanel;
