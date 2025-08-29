import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plus, MapPin, MessageSquare, Eye, Search, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Listing {
  id: string;
  listing_id: string;
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

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all-categories');
  const [selectedRegion, setSelectedRegion] = useState('all-regions');
  const [selectedType, setSelectedType] = useState('all-animals');
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const ethiopianRegions = [
    'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa',
    'Gambela', 'Harari', 'Oromia', 'Sidama', 'SNNP', 'Somali', 'Tigray'
  ];

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          seller:profiles!seller_id(display_name, location_region),
          animal:animals(type, breed, gender)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all-categories' || listing.category === selectedCategory;
    const matchesRegion = selectedRegion === 'all-regions' || listing.location_region === selectedRegion;
    const matchesType = selectedType === 'all-animals' || 
                       (listing.category === 'livestock' && listing.animal?.type === selectedType) ||
                       (listing.category !== 'livestock' && listing.attributes?.type === selectedType);
    
    return matchesSearch && matchesCategory && matchesRegion && matchesType;
  });

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'livestock':
        return '🐄';
      case 'machinery':
        return '🚜';
      case 'equipment':
        return '🔧';
      case 'feed':
        return '🌾';
      case 'medicine':
        return '💊';
      default:
        return '🏪';
    }
  };

  const getItemIcon = (listing: Listing) => {
    if (listing.category === 'livestock') {
      return listing.animal?.type === 'cattle' ? '🐄' :
             listing.animal?.type === 'goat' ? '🐐' :
             listing.animal?.type === 'sheep' ? '🐑' :
             listing.animal?.type === 'chicken' ? '🐔' : '🐾';
    }
    return getCategoryIcon(listing.category);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-t"></div>
              <CardHeader className="p-3">
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-2 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary">Marketplace</h1>
          <p className="text-sm text-muted-foreground">Buy and sell across categories</p>
        </div>
        
        {user && (
          <Button className="gap-2" onClick={() => navigate('/marketplace/create')}>
            <Plus className="h-4 w-4" />
            Create Listing
          </Button>
        )}
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all-categories">All</TabsTrigger>
          <TabsTrigger value="livestock">Livestock</TabsTrigger>
          <TabsTrigger value="machinery">Machinery</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="medicine">Medicine</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-regions">All Regions</SelectItem>
            {ethiopianRegions.map((region) => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCategory === 'livestock' && (
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="All Animals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-animals">All Animals</SelectItem>
              <SelectItem value="cattle">Cattle</SelectItem>
              <SelectItem value="goat">Goat</SelectItem>
              <SelectItem value="sheep">Sheep</SelectItem>
              <SelectItem value="chicken">Chicken</SelectItem>
              <SelectItem value="camel">Camel</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {filteredListings.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-4xl mb-3">🏪</div>
            <h3 className="text-lg font-semibold mb-2">No Listings Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm || selectedRegion || selectedType 
                ? "Try adjusting your search criteria"
                : "Be the first to post a listing in the marketplace"
              }
            </p>
            {user && (
              <Button onClick={() => navigate('/marketplace/create')} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Listing
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
              <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <div className="text-4xl">
                  {getItemIcon(listing)}
                </div>
              </div>
              
              <CardHeader className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm line-clamp-1 font-medium">{listing.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <MapPin className="h-2.5 w-2.5" />
                      {listing.location_region}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs ml-1">
                    {listing.category}
                  </Badge>
                </div>
                
                <div className="text-lg font-bold text-primary">
                  {listing.price.toLocaleString()} ETB
                </div>
              </CardHeader>
              
              <CardContent className="p-3 pt-0 space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {listing.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{listing.seller?.display_name}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-2.5 w-2.5" />
                    {listing.view_count}
                  </div>
                </div>
                
                <div className="flex gap-1.5 pt-1">
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1">
                    <MessageSquare className="h-2.5 w-2.5" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 px-2">
                    <Heart className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}