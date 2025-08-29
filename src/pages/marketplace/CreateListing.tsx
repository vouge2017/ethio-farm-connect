import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Animal {
  id: string;
  animal_id: string;
  name: string;
  type: string;
  breed?: string;
  gender: string;
  photos: string[];
}

export default function CreateListing() {
  const [selectedCategory, setSelectedCategory] = useState<'livestock' | 'machinery' | 'equipment' | 'feed' | 'medicine'>('livestock');
  const [myAnimals, setMyAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location_region: '',
    location_zone: '',
    location_woreda: '',
    contact_phone: '',
    contact_telegram: '',
    attributes: {} as any
  });

  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const ethiopianRegions = [
    'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa',
    'Gambela', 'Harari', 'Oromia', 'Sidama', 'SNNP', 'Somali', 'Tigray'
  ];

  useEffect(() => {
    if (selectedCategory === 'livestock') {
      fetchMyAnimals();
    }
  }, [selectedCategory]);

  const fetchMyAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('id, animal_id, name, type, breed, gender, photos')
        .eq('owner_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyAnimals(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAnimalSelect = (animalId: string) => {
    const animal = myAnimals.find(a => a.id === animalId);
    if (animal) {
      setSelectedAnimal(animalId);
      setFormData(prev => ({
        ...prev,
        title: `${animal.type} - ${animal.name || animal.animal_id}`,
        attributes: {
          breed: animal.breed,
          gender: animal.gender,
          type: animal.type
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.price) return;
    
    setLoading(true);
    try {
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
          category: selectedCategory,
          attributes: formData.attributes,
          animal_id: selectedAnimal || null,
          location_region: formData.location_region,
          location_zone: formData.location_zone || null,
          location_woreda: formData.location_woreda || null,
          contact_phone: formData.contact_phone || null,
          contact_telegram: formData.contact_telegram || null,
          photos: []
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing created successfully!"
      });

      navigate('/marketplace');
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

  const renderCategoryFields = () => {
    switch (selectedCategory) {
      case 'livestock':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select from My Barn</Label>
              <Select value={selectedAnimal} onValueChange={handleAnimalSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an animal from your barn" />
                </SelectTrigger>
                <SelectContent>
                  {myAnimals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name || animal.animal_id} - {animal.type} ({animal.breed || 'No breed'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {!selectedAnimal && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Animal Type</Label>
                  <Select 
                    value={formData.attributes.type || ''} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      attributes: { ...prev.attributes, type: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cattle">Cattle</SelectItem>
                      <SelectItem value="goat">Goat</SelectItem>
                      <SelectItem value="sheep">Sheep</SelectItem>
                      <SelectItem value="chicken">Chicken</SelectItem>
                      <SelectItem value="camel">Camel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Breed</Label>
                  <Input
                    value={formData.attributes.breed || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      attributes: { ...prev.attributes, breed: e.target.value }
                    }))}
                    placeholder="Animal breed"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'machinery':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Machine Type</Label>
              <Select 
                value={formData.attributes.machineType || ''} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  attributes: { ...prev.attributes, machineType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tractor">Tractor</SelectItem>
                  <SelectItem value="harvester">Harvester</SelectItem>
                  <SelectItem value="plowing">Plowing Equipment</SelectItem>
                  <SelectItem value="irrigation">Irrigation System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select 
                value={formData.attributes.condition || ''} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  attributes: { ...prev.attributes, condition: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'feed':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Feed Type</Label>
              <Select 
                value={formData.attributes.feedType || ''} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  attributes: { ...prev.attributes, feedType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hay">Hay</SelectItem>
                  <SelectItem value="grain">Grain</SelectItem>
                  <SelectItem value="pellets">Pellets</SelectItem>
                  <SelectItem value="supplements">Supplements</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity (kg)</Label>
              <Input
                type="number"
                value={formData.attributes.quantity || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  attributes: { ...prev.attributes, quantity: e.target.value }
                }))}
                placeholder="Amount available"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/marketplace')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Listing</h1>
          <p className="text-muted-foreground">Post your items for sale in the marketplace</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
          <CardDescription>Choose a category and fill in the details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <Tabs value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="livestock">Livestock</TabsTrigger>
                <TabsTrigger value="machinery">Machinery</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="medicine">Medicine</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory} className="space-y-4 mt-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Enter listing title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe your item in detail"
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
                      placeholder="Enter price"
                      required
                    />
                  </div>
                </div>

                {/* Category-specific fields */}
                {renderCategoryFields()}

                {/* Location */}
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

                {/* Contact Information */}
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

                {/* Media Upload Placeholder */}
                <div className="space-y-2">
                  <Label>Photos & Videos</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Click to upload photos and videos</p>
                    <p className="text-xs text-muted-foreground">Support for images and longer videos</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Listing'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/marketplace')}
                  >
                    Cancel
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}