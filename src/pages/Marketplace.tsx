import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plus, MapPin, Phone, MessageSquare, Eye, Search, Filter, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    animal_id: '',
    location_region: '',
    location_zone: '',
    location_woreda: '',
    contact_phone: '',
    contact_telegram: ''
  });
  const { user, profile } = useAuth();
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.price) return;

    try {
      // Generate listing ID using database function
      const { data: listingId, error: idError } = await supabase.rpc('generate_listing_id');
      
      if (idError) throw idError;

      const { error } = await supabase
        .from('listings')
        .insert({
          listing_id: listingId,
          seller_id: user?.id!,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          animal_id: formData.animal_id || null,
          location_region: formData.location_region,
          location_zone: formData.location_zone || null,
          location_woreda: formData.location_woreda || null,
          contact_phone: formData.contact_phone || null,
          contact_telegram: formData.contact_telegram || null,
          photos: [] // Will be handled separately
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing created successfully!"
      });

      setFormData({
        title: '',
        description: '',
        price: '',
        animal_id: '',
        location_region: '',
        location_zone: '',
        location_woreda: '',
        contact_phone: '',
        contact_telegram: ''
      });
      setShowForm(false);
      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || listing.location_region === selectedRegion;
    const matchesType = !selectedType || listing.animal?.type === selectedType;
    
    return matchesSearch && matchesRegion && matchesType;
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t"></div>
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Marketplace</h1>
          <p className="text-muted-foreground">Buy and sell livestock across Ethiopia</p>
        </div>
        
        {user && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Listing</DialogTitle>
                <DialogDescription>
                  Post your livestock for sale to farmers across Ethiopia
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Healthy Holstein Cow for Sale"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your animal's health, age, productivity, etc."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETB) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="e.g., 25000"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location_region">Region *</Label>
                    <Select 
                      value={formData.location_region} 
                      onValueChange={(value) => setFormData({...formData, location_region: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {ethiopianRegions.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location_zone">Zone</Label>
                    <Input
                      id="location_zone"
                      value={formData.location_zone}
                      onChange={(e) => setFormData({...formData, location_zone: e.target.value})}
                      placeholder="Zone name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location_woreda">Woreda</Label>
                    <Input
                      id="location_woreda"
                      value={formData.location_woreda}
                      onChange={(e) => setFormData({...formData, location_woreda: e.target.value})}
                      placeholder="Woreda name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      placeholder="+251 9xx xxx xxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_telegram">Telegram Username</Label>
                    <Input
                      id="contact_telegram"
                      value={formData.contact_telegram}
                      onChange={(e) => setFormData({...formData, contact_telegram: e.target.value})}
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Create Listing
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
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
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Regions</SelectItem>
            {ethiopianRegions.map((region) => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Animals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Animals</SelectItem>
            <SelectItem value="cattle">Cattle</SelectItem>
            <SelectItem value="goat">Goat</SelectItem>
            <SelectItem value="sheep">Sheep</SelectItem>
            <SelectItem value="chicken">Chicken</SelectItem>
            <SelectItem value="camel">Camel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredListings.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold mb-2">No Listings Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedRegion || selectedType 
                ? "Try adjusting your search criteria"
                : "Be the first to post a listing in the marketplace"
              }
            </p>
            {user && (
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Listing
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <div className="text-6xl">
                  {listing.animal?.type === 'cattle' ? '🐄' :
                   listing.animal?.type === 'goat' ? '🐐' :
                   listing.animal?.type === 'sheep' ? '🐑' :
                   listing.animal?.type === 'chicken' ? '🐔' : '🐾'}
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{listing.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.location_region}
                      {listing.location_zone && `, ${listing.location_zone}`}
                    </CardDescription>
                  </div>
                  {getVerificationBadge(listing.verification_tier)}
                </div>
                
                <div className="text-2xl font-bold text-primary">
                  {listing.price.toLocaleString()} ETB
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {listing.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>By {listing.seller?.display_name}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {listing.view_count}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Heart className="h-3 w-3" />
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