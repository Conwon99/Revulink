import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ExternalLink, Search, Link, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminImpersonation } from "@/hooks/useAdminImpersonation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReviewLinkData {
  id: string;
  link_id: string;
  name: string;
  google_review_url: string;
  status: string;
  created_at: string;
  full_url: string;
  review_count: number;
}

const GeneratedLinksTable = () => {
  const [links, setLinks] = useState<ReviewLinkData[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<ReviewLinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { impersonatedUserId, isImpersonating } = useAdminImpersonation();
  const { toast } = useToast();

  // Use impersonated user ID if admin is impersonating, otherwise use current user
  const targetUserId = isImpersonating ? impersonatedUserId : user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchLinks();
    }
  }, [targetUserId]);

  useEffect(() => {
    filterLinks();
  }, [links, searchTerm]);

  const fetchLinks = async () => {
    try {
      // First get the review links
      const { data: linksData, error: linksError } = await supabase
        .from('review_links')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;

      // For each link, get the review count
      const linksWithCounts = await Promise.all(
        linksData.map(async (link) => {
          const { count } = await supabase
            .from('ratings')
            .select('*', { count: 'exact', head: true })
            .eq('review_link_id', link.id);

          return {
            ...link,
            full_url: `${window.location.origin}/rate/${link.link_id}`,
            review_count: count || 0
          };
        })
      );

      setLinks(linksWithCounts);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast({
        title: "Error",
        description: "Failed to fetch generated links.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLinks = () => {
    let filtered = links;

    if (searchTerm) {
      filtered = filtered.filter(link =>
        link.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.link_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLinks(filtered);
  };

  const handleCopyLink = async (fullUrl: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLinkId(linkId);
      toast({
        title: "Link copied!",
        description: "The review link has been copied to your clipboard.",
      });
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate summary statistics
  const totalLinks = links.length;
  const totalReviews = links.reduce((sum, link) => sum + link.review_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading generated links...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-inter font-medium">Generated Links</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-inter font-bold">{totalLinks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-inter font-medium">Total Reviews Collected</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-inter font-bold">{totalReviews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by link name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Links Table */}
      {filteredLinks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-muted-foreground">
              {searchTerm ? "No links match your search." : "No review links generated yet."}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link Name</TableHead>
                <TableHead>Link ID</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="font-medium">{link.name || "Unnamed Link"}</div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {link.link_id}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {link.review_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={link.status === 'active' ? 'default' : 'secondary'}>
                      {link.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(link.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link.google_review_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={copiedLinkId === link.id ? "secondary" : "hero"}
                        size="sm"
                        onClick={() => handleCopyLink(link.full_url, link.id)}
                      >
                        {copiedLinkId === link.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default GeneratedLinksTable;