import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Eye, MessageSquare, Phone, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  date: string;
  views_count: number;
  unique_viewers: number;
  contact_clicks: number;
  message_starts: number;
}

interface ListingAnalyticsChartProps {
  listingId: string;
}

export const ListingAnalyticsChart = ({ listingId }: ListingAnalyticsChartProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    avgDailyViews: 0,
    totalContacts: 0,
    totalMessages: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [listingId]);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('listing_analytics')
        .select('*')
        .eq('listing_id', listingId)
        .order('date', { ascending: true })
        .limit(30);

      if (error) throw error;

      const formattedData: AnalyticsData[] = (data || []).map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views_count: item.views_count || 0,
        unique_viewers: item.unique_viewers || 0,
        contact_clicks: item.contact_clicks || 0,
        message_starts: item.message_starts || 0
      }));

      setAnalytics(formattedData);

      // Calculate stats
      const totalViews = formattedData.reduce((sum, item) => sum + item.views_count, 0);
      const totalContacts = formattedData.reduce((sum, item) => sum + item.contact_clicks, 0);
      const totalMessages = formattedData.reduce((sum, item) => sum + item.message_starts, 0);

      setStats({
        totalViews,
        avgDailyViews: formattedData.length > 0 ? Math.round(totalViews / formattedData.length) : 0,
        totalContacts,
        totalMessages
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (analytics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>No analytics data yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Analytics will be available once your listing receives views
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalViews}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Avg Daily</p>
            </div>
            <p className="text-2xl font-bold">{stats.avgDailyViews}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-orange-500" />
              <p className="text-xs text-muted-foreground">Contact Clicks</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalContacts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalMessages}</p>
          </CardContent>
        </Card>
      </div>

      {/* Views Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Views Over Time</CardTitle>
          <CardDescription>Daily views for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="views_count" 
                stroke="#3b82f6" 
                name="Total Views"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="unique_viewers" 
                stroke="#10b981" 
                name="Unique Viewers"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>Contact clicks and message starts</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="contact_clicks" fill="#f59e0b" name="Contact Clicks" />
              <Bar dataKey="message_starts" fill="#8b5cf6" name="Messages Started" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};