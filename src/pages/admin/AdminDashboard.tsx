import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  ShoppingBag, 
  AlertCircle, 
  CheckCircle, 
  Eye,
  Ban,
  MessageSquare 
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  reportedContent: number;
}

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalListings: 0,
    pendingListings: 0,
    reportedContent: 0
  });
  const [listings, setListings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      navigate('/');
      return;
    }
    
    if (user && profile?.role === 'admin') {
      fetchAdminData();
    }
  }, [user, profile, loading, navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const [usersResult, listingsResult, pendingResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('listings').select('*', { count: 'exact' }),
        supabase.from('listings').select('*', { count: 'exact' }).eq('status', 'pending_sale')
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalListings: listingsResult.count || 0,
        pendingListings: pendingResult.count || 0,
        reportedContent: 0 // TODO: Add reports table
      });

      // Fetch recent listings for review
      const { data: recentListings } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_seller_id_fkey(display_name, phone_number)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      setListings(recentListings || []);

      // Fetch recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setUsers(recentUsers || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    }
  };

  const handleListingAction = async (listingId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          status: action === 'approve' ? 'active' : 'unavailable',
          verified_at: action === 'approve' ? new Date().toISOString() : null
        })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: `Listing ${action}d`,
        description: `The listing has been ${action}d successfully`
      });

      fetchAdminData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${action} listing`,
        variant: "destructive"
      });
    }
  };

  const handleUserAction = async (userId: string, action: 'ban' | 'unban') => {
    try {
      // TODO: Add user status field to profiles table
      toast({
        title: "Feature Coming Soon",
        description: "User moderation features are being developed"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user || profile?.role !== 'admin') {
    return <div className="flex items-center justify-center h-screen">Access Denied</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage marketplace content and users</p>
        </div>
        <Button onClick={() => navigate('/')}>
          Back to App
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingListings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.reportedContent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Management Tabs */}
      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="listings">Listings Review</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Listings</CardTitle>
              <CardDescription>Review and moderate marketplace listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{listing.title}</h3>
                        <Badge variant={
                          listing.status === 'active' ? 'default' : 
                          listing.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {listing.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {listing.description?.substring(0, 100)}...
                      </p>
                      <p className="text-sm font-medium">
                        Price: {new Intl.NumberFormat('en-ET', {
                          style: 'currency',
                          currency: 'ETB'
                        }).format(listing.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        By: {listing.profiles?.display_name} • {new Date(listing.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {listing.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleListingAction(listing.id, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleListingAction(listing.id, 'reject')}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{user.display_name}</h3>
                      <p className="text-sm text-muted-foreground">{user.phone_number}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{user.role}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction(user.id, 'ban')}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Reports</CardTitle>
              <CardDescription>Review reported content and take action</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                No reports to review at this time.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}