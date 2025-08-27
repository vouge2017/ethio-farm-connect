import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Store, MessageCircle, TrendingUp, Users, Award, Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  if (!user) {
    return null; // Will redirect to auth
  }

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
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            እንኳን በደህና መጡ!
          </h1>
          <p className="text-lg text-muted-foreground mb-1">
            Welcome back, {profile?.display_name}
          </p>
          <p className="text-sm text-muted-foreground">
            Manage your livestock with Ethiopia's most trusted platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className={`border-2 ${action.color} hover:shadow-lg transition-shadow cursor-pointer`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <action.icon className="h-6 w-6 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm opacity-80 mb-3">{action.description}</p>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        Get Started →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Daily Tip */}
        <Card className="border-2 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">የዕለቱ ምክር - Daily Tip</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">
              Clean water is essential for healthy livestock. Ensure your animals have access to fresh, clean water at all times.
            </p>
            <p className="text-sm text-muted-foreground">
              ንፁህ ውሃ ለጤናማ እንስሳት ወሳኝ ነው። እንስሳትዎ ሁልጊዜ ንፁህ እና ንፁህ ውሃ እንዲያገኙ ያረጋግጡ።
            </p>
          </CardContent>
        </Card>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-primary">1,000+</div>
            <div className="text-sm text-muted-foreground">Farmers</div>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-secondary">5,000+</div>
            <div className="text-sm text-muted-foreground">Animals</div>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-accent">500+</div>
            <div className="text-sm text-muted-foreground">Listings</div>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-primary">50+</div>
            <div className="text-sm text-muted-foreground">Veterinarians</div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;