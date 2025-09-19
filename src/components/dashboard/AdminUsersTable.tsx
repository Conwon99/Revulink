import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, Users, Link, Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserStats {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  created_at: string;
  total_links: number;
  total_reviews: number;
  average_rating: number;
}

interface AdminUsersTableProps {
  onViewUserDashboard: (userId: string, userName: string) => void;
}

const AdminUsersTable = ({ onViewUserDashboard }: AdminUsersTableProps) => {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchAllUsers = async () => {
    try {
      // Get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get review link counts per user
      const { data: linkCounts, error: linkError } = await supabase
        .from('review_links')
        .select('user_id')
        .eq('status', 'active');

      if (linkError) throw linkError;

      // Get ratings with review links to calculate stats per user
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select(`
          rating,
          review_links!inner (
            user_id
          )
        `);

      if (ratingsError) throw ratingsError;

      // Process the data to calculate stats
      const linkCountMap = new Map();
      linkCounts?.forEach(link => {
        linkCountMap.set(link.user_id, (linkCountMap.get(link.user_id) || 0) + 1);
      });

      const ratingStatsMap = new Map();
      ratingsData?.forEach(rating => {
        const userId = rating.review_links.user_id;
        if (!ratingStatsMap.has(userId)) {
          ratingStatsMap.set(userId, { total: 0, sum: 0, count: 0 });
        }
        const stats = ratingStatsMap.get(userId);
        stats.sum += rating.rating;
        stats.count += 1;
        stats.total += 1;
      });

      const userStats: UserStats[] = profilesData?.map(profile => {
        const linkCount = linkCountMap.get(profile.user_id) || 0;
        const ratingStats = ratingStatsMap.get(profile.user_id);
        const reviewCount = ratingStats?.count || 0;
        const averageRating = reviewCount > 0 ? ratingStats.sum / reviewCount : 0;

        return {
          user_id: profile.user_id,
          email: profile.email,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
          created_at: profile.created_at,
          total_links: linkCount,
          total_reviews: reviewCount,
          average_rating: averageRating,
        };
      }) || [];

      setUsers(userStats);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error loading users",
        description: error.message || "Failed to load user data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const renderStars = (rating: number) => {
    const roundedRating = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < roundedRating ? "fill-star-active text-star-active" : "text-star-inactive"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Review Links</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((sum, user) => sum + user.total_links, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((sum, user) => sum + user.total_reviews, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </p>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Review Links</TableHead>
              <TableHead>Total Reviews</TableHead>
              <TableHead>Avg Rating</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="font-medium">{user.full_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {user.total_links}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {user.total_reviews}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.total_reviews > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {renderStars(user.average_rating)}
                        </div>
                        <span className="text-sm font-medium">
                          {user.average_rating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewUserDashboard(user.user_id, user.full_name)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Dashboard
                    </Button>
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

export default AdminUsersTable;