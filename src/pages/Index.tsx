import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGuestMode } from '@/hooks/useGuestMode';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Store, MessageCircle, TrendingUp, Users, Award, Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading, profile } = useAuth();
  const { isGuestMode } = useGuestMode();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show welcome screen for both authenticated users and guests

  const quickStats = [
    { label: 'My Animals', value: '0', icon: Heart, color: 'text-primary' },
    { label: 'Active Listings', value: '0', icon: Store, color: 'text-secondary' },
    { label: 'Messages', value: '0', icon: MessageCircle, color: 'text-accent' },
  ];

  const quickActions = [
    {
      title: 'Add New Animal',
      description: 'Register a new animal to your digital barn',
      icon: Heart,
      href: '/barn/add',
      color: 'bg-primary/10 text-primary border-primary/20'
    },
    {
      title: 'Create Listing',
      description: 'Sell your animals in the marketplace',
      icon: Store,
      href: '/marketplace/create',
      color: 'bg-secondary/10 text-secondary border-secondary/20'
    },
    {
      title: 'Ask Question',
      description: 'Get expert advice from veterinarians',
      icon: MessageCircle,
      href: '/community/ask',
      color: 'bg-accent/10 text-accent border-accent/20'
    }
  ];

  return (
    <MainLayout activeTab={undefined}>
      <div className="space-y-6 p-3">
        {/* Welcome Section - Compact */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            እንኳን በደህና መጡ!
          </h1>
          <p className="text-base text-muted-foreground mb-1">
            {isGuestMode ? 'Welcome to Yegebere Gebeya!' : `Welcome back, ${profile?.display_name}`}
          </p>
          <p className="text-xs text-muted-foreground">
            Manage your livestock with Ethiopia's most trusted platform
          </p>
        </div>

        {/* Quick Stats - 2 column grid on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickStats.map((stat, index) => (
            <Card key={index} className="border-2">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions - Horizontal buttons on mobile */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickActions.map((action, index) => (
              <Card key={index} className={`border-2 ${action.color} hover:shadow-md transition-shadow cursor-pointer`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <action.icon className="h-5 w-5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                      <p className="text-xs opacity-80 line-clamp-1">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Daily Tip - Compact */}
        <Card className="border-2 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader className="p-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">የዕለቱ ምክር - Daily Tip</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
              Clean water is essential for healthy livestock. Ensure your animals have access to fresh, clean water at all times.
            </p>
            <p className="text-xs text-muted-foreground opacity-75 line-clamp-1">
              ንፁህ ውሃ ለጤናማ እንስሳት ወሳኝ ነው። እንስሳትዎ ሁልጊዜ ንፁህ እና ንፁህ ውሃ እንዲያገኙ ያረጋግጡ።
            </p>
          </CardContent>
        </Card>

        {/* Platform Stats - Compact grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3">
            <div className="text-xl font-bold text-primary">1,000+</div>
            <div className="text-xs text-muted-foreground">Farmers</div>
          </div>
          <div className="text-center p-3">
            <div className="text-xl font-bold text-secondary">5,000+</div>
            <div className="text-xs text-muted-foreground">Animals</div>
          </div>
          <div className="text-center p-3">
            <div className="text-xl font-bold text-accent">500+</div>
            <div className="text-xs text-muted-foreground">Listings</div>
          </div>
          <div className="text-center p-3">
            <div className="text-xl font-bold text-primary">50+</div>
            <div className="text-xs text-muted-foreground">Veterinarians</div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;