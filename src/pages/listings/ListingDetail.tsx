import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MapPin, Phone, MessageSquare, Eye, Heart, Calendar, User, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ListingAnalyticsChart } from '@/components/analytics/ListingAnalyticsChart';
import { VerificationRequestDialog } from '@/components/verification/VerificationRequestDialog';

interface ListingDetail {
  id: string;
  listing_id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  photos: string[];
  location_region: string;
  location_zone?: string;
  location_woreda?: string;
  contact_phone?: string;
  contact_telegram?: string;
  status: string;
  category: string;
  attributes: any;
  verification_tier: string;
  view_count: number;
  created_at: string;
  seller: {
    display_name: string;
    location_region?: string;
  };
  animal?: {
    type: string;
    breed?: string;
    gender: string;
    age_months?: number;
  };
}

export default function ListingDetail() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isOwner = user && listing && user.id === listing.seller_id;

  useEffect(() => {
    if (listingId) {
      fetchListing();
      incrementViewCount();
    }
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          seller:public_profiles!seller_id(display_name, location_region),
          animal:animals(type, breed, gender)
        `)
        .eq('listing_id', listingId)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Listing not found",
        variant: "destructive"
      });
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      const { data } = await supabase
        .from('listings')
        .select('view_count')
        .eq('listing_id', listingId)
        .single();
      
      if (data) {
        await supabase
          .from('listings')
          .update({ view_count: data.view_count + 1 })
          .eq('listing_id', listingId);
      }
    } catch (error) {
      // Silently fail view count increment
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'livestock': return '🐄';
      case 'machinery': return '🚜';
      case 'equipment': return '🔧';
      case 'feed': return '🌾';
      case 'medicine': return '💊';
      default: return '🏪';
    }
  };

  const getVerificationBadge = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Badge className="bg-yellow-500">⭐ Premium</Badge>;
      case 'verified':
        return <Badge className="bg-green-500">✓ Verified</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderListingContent = () => (
    <>
      {/* Images */}
      <Card>
        <CardContent className="p-0">
          <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center rounded-t-lg">
            <div className="text-6xl">
              {getCategoryIcon(listing!.category)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{listing!.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4" />
                {listing!.location_region}
                {listing!.location_zone && `, ${listing!.location_zone}`}
                {listing!.location_woreda && `, ${listing!.location_woreda}`}
              </CardDescription>
            </div>
            {getVerificationBadge(listing!.verification_tier)}
          </div>
          
          <div className="text-3xl font-bold text-primary">
            {listing!.price.toLocaleString()} ETB
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{listing!.description}</p>
          </div>

          {/* Category-specific attributes */}
          {listing!.category === 'livestock' && listing!.animal && (
            <div>
              <h3 className="font-semibold mb-2">Animal Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {listing!.animal.type}
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {listing!.animal.gender}
                </div>
                {listing!.animal.breed && (
                  <div>
                    <span className="font-medium">Breed:</span> {listing!.animal.breed}
                  </div>
                )}
              </div>
            </div>
          )}

          {listing!.attributes && Object.keys(listing!.attributes).length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Additional Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(listing!.attributes).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {value as string}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Posted on {formatDate(listing!.created_at)}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {listing!.view_count} views
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderSidebar = () => (
    <div className="space-y-4">
      {/* Seller Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Seller Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="font-semibold">{listing!.seller.display_name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {listing!.seller.location_region}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            {listing!.contact_phone && (
              <Button variant="outline" className="w-full justify-start gap-2">
                <Phone className="h-4 w-4" />
                {listing!.contact_phone}
              </Button>
            )}
            
            {listing!.contact_telegram && (
              <Button variant="outline" className="w-full justify-start gap-2">
                <MessageSquare className="h-4 w-4" />
                @{listing!.contact_telegram}
              </Button>
            )}
            
            <Button className="w-full gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact Seller
            </Button>
            
            <Button variant="outline" className="w-full gap-2">
              <Heart className="h-4 w-4" />
              Save to Favorites
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Safety Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>• Meet in a public place for transactions</p>
          <p>• Inspect the item before payment</p>
          <p>• Be cautious of unusually low prices</p>
          <p>• Report suspicious listings</p>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
        <Button onClick={() => navigate('/marketplace')}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
          <Badge variant="secondary">{listing.category}</Badge>
        </div>
        {isOwner && listing.verification_tier === 'free' && (
          <Button onClick={() => setVerificationDialogOpen(true)} className="gap-2">
            <Shield className="h-4 w-4" />
            Request Verification
          </Button>
        )}
      </div>

      {isOwner ? (
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Listing Details</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {renderListingContent()}
              </div>
              {/* Sidebar */}
              {renderSidebar()}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <ListingAnalyticsChart listingId={listing.id} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {renderListingContent()}
          </div>
          {/* Sidebar */}
          {renderSidebar()}
        </div>
      )}

      <VerificationRequestDialog
        open={verificationDialogOpen}
        onOpenChange={setVerificationDialogOpen}
        listingId={listing.id}
        currentTier={listing.verification_tier}
      />
    </div>
  );
}