import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Eye } from 'lucide-react';

interface ListingAnalyticsProps {
  listingId: string;
}

export const ListingAnalytics = ({ listingId }: ListingAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      setAnalytics(data || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Analytics
        </CardTitle>
        <CardDescription>Listing performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        {analytics.length === 0 ? (
          <p className="text-muted-foreground">No analytics data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views_count" stroke="hsl(var(--primary))" name="Views" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
