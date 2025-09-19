import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Star, MessageSquare, Calendar, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminImpersonation } from "@/hooks/useAdminImpersonation";
import { supabase } from "@/integrations/supabase/client";

interface ReviewData {
  id: string;
  rating: number;
  created_at: string;
  feedback?: string;
  link_id: string;
}

interface AnalyticsData {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
  dailyReviews: { date: string; reviews: number; averageRating: number }[];
  weeklyReviews: { week: string; reviews: number; averageRating: number }[];
  monthlyReviews: { month: string; reviews: number; averageRating: number }[];
}

const AnalyticsPanel = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const { user } = useAuth();
  const { impersonatedUserId, isImpersonating } = useAdminImpersonation();

  const targetUserId = isImpersonating ? impersonatedUserId : user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchAnalyticsData();
    }
  }, [targetUserId, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selection
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      // Fetch reviews data
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process data for analytics
      const processedData = processAnalyticsData(reviews || []);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (reviews: ReviewData[]): AnalyticsData => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(review => review.rating === rating).length
    }));

    // Group by time periods
    const dailyReviews = groupByDay(reviews);
    const weeklyReviews = groupByWeek(reviews);
    const monthlyReviews = groupByMonth(reviews);

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
      dailyReviews,
      weeklyReviews,
      monthlyReviews
    };
  };

  const groupByDay = (reviews: ReviewData[]) => {
    const grouped = reviews.reduce((acc, review) => {
      const date = new Date(review.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { reviews: [], totalRating: 0 };
      }
      acc[date].reviews.push(review);
      acc[date].totalRating += review.rating;
      return acc;
    }, {} as Record<string, { reviews: ReviewData[]; totalRating: number }>);

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      reviews: data.reviews.length,
      averageRating: data.totalRating / data.reviews.length
    }));
  };

  const groupByWeek = (reviews: ReviewData[]) => {
    const grouped = reviews.reduce((acc, review) => {
      const date = new Date(review.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!acc[weekKey]) {
        acc[weekKey] = { reviews: [], totalRating: 0 };
      }
      acc[weekKey].reviews.push(review);
      acc[weekKey].totalRating += review.rating;
      return acc;
    }, {} as Record<string, { reviews: ReviewData[]; totalRating: number }>);

    return Object.entries(grouped).map(([week, data]) => ({
      week,
      reviews: data.reviews.length,
      averageRating: data.totalRating / data.reviews.length
    }));
  };

  const groupByMonth = (reviews: ReviewData[]) => {
    const grouped = reviews.reduce((acc, review) => {
      const date = new Date(review.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { reviews: [], totalRating: 0 };
      }
      acc[monthKey].reviews.push(review);
      acc[monthKey].totalRating += review.rating;
      return acc;
    }, {} as Record<string, { reviews: ReviewData[]; totalRating: number }>);

    return Object.entries(grouped).map(([month, data]) => ({
      month,
      reviews: data.reviews.length,
      averageRating: data.totalRating / data.reviews.length
    }));
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  if (loading) {
    return (
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-inter font-bold">Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-inter font-bold">Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground font-inter font-bold text-center py-8">
            No analytics data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-inter font-bold">Analytics</CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Performance Trend */}
        <div className="mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-inter font-medium">Performance Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-inter font-bold text-green-600">
                {analyticsData.averageRating >= 4 ? 'Excellent' : analyticsData.averageRating >= 3 ? 'Good' : 'Needs Improvement'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="h-80">
              <h3 className="text-lg font-semibold font-inter font-medium mb-4">Review Trends</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.dailyReviews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="reviews" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <div className="h-80">
              <h3 className="text-lg font-semibold font-inter font-medium mb-4">Rating Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="h-80">
              <h3 className="text-lg font-semibold font-inter font-medium mb-4">Review Timeline</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.ratingDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ rating, count }) => `${rating}★ (${count})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalyticsPanel;
