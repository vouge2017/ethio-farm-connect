import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plus, MapPin, MessageSquare, Eye, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { QUERY_KEYS } from '@/lib/queryClient';

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

interface SearchFilters {
  searchTerm: string;
  category: string;
  region: string;
  priceRange: [number, number];
  distanceRadius: number;
  animalType?: string;
  breed?: string;
  ageRange?: [number, number];
  gender?: string;
  sortBy: string;
  savedSearches: SavedSearch[];
}

interface SavedSearch {
  id: string;
  name: string;
  filters: Partial<SearchFilters>;
  createdAt: string;
}

export default function Marketplace() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: 'all-categories',
    region: 'all-regions',
    priceRange: [0, 1000000],
    distanceRadius: 50,
    sortBy: 'created_at_desc',
    savedSearches: []
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.search(filters),
    queryFn: async () => {
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
      return data || [];
    }
  });

  // Filter listings based on current filters
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesSearch = !filters.searchTerm || 
        listing.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesCategory = filters.category === 'all-categories' || listing.category === filters.category;
      const matchesRegion = filters.region === 'all-regions' || listing.location_region === filters.region;
      const matchesPrice = listing.price >= filters.priceRange[0] && listing.price <= filters.priceRange[1];
      
      return matchesSearch && matchesCategory && matchesRegion && matchesPrice;
    });
  }, [listings, filters]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      category: 'all-categories',
      region: 'all-regions',
      priceRange: [0, 1000000],
      distanceRadius: 50,
      sortBy: 'created_at_desc',
      savedSearches: filters.savedSearches
    });
  };

  const handleSaveSearch = (name: string) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString()
    };
    
    setFilters(prev => ({
      ...prev,
      savedSearches: [...prev.savedSearches, newSearch]
    }));
    
    toast({
      title: "Search Saved",
      description: `"${name}" has been saved to your searches`
    });
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <SkeletonLoader type="search-results" count={8} />
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

      {/* Advanced Search */}
      <AdvancedSearch
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onSaveSearch={handleSaveSearch}
      />

      {filteredListings.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-4xl mb-3">🏪</div>
            <h3 className="text-lg font-semibold mb-2">No Listings Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filters.searchTerm || filters.region !== 'all-regions' || filters.category !== 'all-categories' 
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