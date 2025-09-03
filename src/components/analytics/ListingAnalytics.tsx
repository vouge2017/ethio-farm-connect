import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageCircle, Heart, TrendingUp, Calendar, MapPin } from 'lucide-react';

interface AnalyticsData {
  views: number;
  inquiries: number;
  favorites: number;
  viewsThisWeek: number;
  topRegions: { region: string; count: number }[];
  peakHours: string[];
  conversionRate: number;
}

interface ListingAnalyticsProps {
  listingId: string;
  analytics: AnalyticsData;
}

export function ListingAnalytics({ listingId, analytics }: ListingAnalyticsProps) {
  const {
    views,
    inquiries,
    favorites,
    viewsThisWeek,
    topRegions,
    peakHours,
    conversionRate
  } = analytics;

  const stats = [
    {
      title: 'ጠቅላላ እይታዎች',
      value: views.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'ጥያቄዎች',
      value: inquiries.toLocaleString(),
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'ተወዳጅነት',
      value: favorites.toLocaleString(),
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'የህዳር ሳምንት እይታዎች',
      value: viewsThisWeek.toLocaleString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conversion Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            የመለወጫ መጠን
          </CardTitle>
          <CardDescription>
            ከእይታ ወደ ጥያቄ የመቀየር መጠን
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">የመለወጫ መጠን</span>
              <span className="font-semibold">{conversionRate.toFixed(1)}%</span>
            </div>
            <Progress value={conversionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {inquiries} ጥያቄዎች ከ {views} እይታዎች
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regional Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            በክልል አፈጻጸም
          </CardTitle>
          <CardDescription>
            ይህ ማስታወቂያ በየትኛው ክልል በጣም ታዋቂ ነው
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRegions.map((region, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{region.region}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {region.count} እይታዎች
                  </span>
                  <div className="w-20">
                    <Progress 
                      value={(region.count / views) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            የመጨረሻ እንቅስቃሴ ሰዓቶች
          </CardTitle>
          <CardDescription>
            ብዙ ሰዎች የሚመለከቱባቸው ሰዓቶች
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {peakHours.map((hour, index) => (
              <Badge key={index} variant="secondary">
                {hour}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            በእነዚህ ሰዓቶች ማስታወቂያዎን ማሻሻል የተሻለ ውጤት ያመጣል
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Sample analytics data for demo
export const sampleAnalytics: AnalyticsData = {
  views: 2847,
  inquiries: 156,
  favorites: 89,
  viewsThisWeek: 420,
  topRegions: [
    { region: 'አዲስ አበባ', count: 1200 },
    { region: 'ኦሮሚያ', count: 800 },
    { region: 'አማራ', count: 520 },
    { region: 'ትግራይ', count: 327 }
  ],
  peakHours: ['ጠዋት 8:00-10:00', 'ምሽት 6:00-8:00', 'ቅዳሜ ጠዋት'],
  conversionRate: 5.5
};