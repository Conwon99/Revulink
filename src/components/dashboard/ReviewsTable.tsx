import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Download, Star, MessageSquare, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminImpersonation } from "@/hooks/useAdminImpersonation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReviewData {
  id: string;
  link_name: string;
  customer_name?: string;
  customer_email?: string;
  rating: number;
  redirected_to_google: boolean;
  feedback_text?: string;
  created_at: string;
}

const ReviewsTable = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  const { user } = useAuth();
  const { impersonatedUserId, isImpersonating } = useAdminImpersonation();
  const { toast } = useToast();

  // Use impersonated user ID if admin is impersonating, otherwise use current user
  const targetUserId = isImpersonating ? impersonatedUserId : user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchReviews();
    }
  }, [targetUserId]);

  useEffect(() => {
    filterAndSortReviews();
  }, [reviews, searchTerm, ratingFilter, sortBy]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          id,
          customer_name,
          customer_email,
          rating,
          redirected_to_google,
          created_at,
          review_links!inner (
            name
          ),
          feedback (
            feedback_text
          )
        `)
        .eq('review_links.user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReviews = data?.map(review => ({
        id: review.id,
        link_name: review.review_links.name || 'Unnamed Link',
        customer_name: review.customer_name,
        customer_email: review.customer_email,
        rating: review.rating,
        redirected_to_google: review.redirected_to_google,
        feedback_text: review.feedback?.[0]?.feedback_text,
        created_at: review.created_at,
      })) || [];

      setReviews(formattedReviews);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error loading reviews",
        description: error.message || "Failed to load reviews data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortReviews = () => {
    let filtered = reviews;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(review => 
        review.link_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply rating filter
    if (ratingFilter !== "all") {
      if (ratingFilter === "high") {
        filtered = filtered.filter(review => review.rating >= 4);
      } else if (ratingFilter === "low") {
        filtered = filtered.filter(review => review.rating <= 3);
      } else {
        filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Date", "Link Name", "Customer Name", "Email", "Rating", "Feedback", "Redirected to Google"],
      ...filteredReviews.map(review => [
        new Date(review.created_at).toLocaleDateString(),
        review.link_name,
        review.customer_name || "",
        review.customer_email || "",
        review.rating,
        review.feedback_text || "",
        review.redirected_to_google ? "Yes" : "No"
      ])
    ].map(row => row.map(field => `"${field}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reviews-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Reviews data has been exported to CSV.",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-star-active text-star-active" : "text-star-inactive"
        }`}
      />
    ));
  };

  // Calculate summary statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="high">High (4-5 stars)</SelectItem>
              <SelectItem value="low">Low (1-3 stars)</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4 stars</SelectItem>
              <SelectItem value="3">3 stars</SelectItem>
              <SelectItem value="2">2 stars</SelectItem>
              <SelectItem value="1">1 star</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredReviews.length} of {reviews.length} reviews
      </p>

      {/* Reviews Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Action Taken</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No reviews found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    {new Date(review.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {review.customer_name && (
                        <div className="font-medium">{review.customer_name}</div>
                      )}
                      {review.customer_email && (
                        <div className="text-sm text-muted-foreground">
                          {review.customer_email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm font-medium">
                        {review.rating}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {review.feedback_text ? (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">
                          {review.feedback_text}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.redirected_to_google ? "default" : "secondary"}>
                      {review.redirected_to_google ? "Google Reviews" : "Feedback Form"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReviewsTable;