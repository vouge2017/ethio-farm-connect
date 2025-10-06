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
import { MediaUpload } from '@/components/media/MediaUpload';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { animalTypes, getAnimalIcon } from '@/lib/animalHelpers';

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
    photos: [] as string[],
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
          photos: formData.photos
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
                        <SelectContent className="bg-background">
                          {animalTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {getAnimalIcon(type.value)} {type.label}
                            </SelectItem>
                          ))}
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
    <div className="container mx-auto px-4 py-2 sm:p-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/marketplace')} className="self-start">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Back to Marketplace</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <div className="w-full">
          <h1 className="text-xl sm:text-2xl font-bold">Create New Listing</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Post your items for sale</p>
        </div>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-4">
          <CardTitle className="text-lg sm:text-xl">Listing Details</CardTitle>
          <CardDescription className="text-sm">Choose a category and fill in the details</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Category Selection */}
            <Tabs value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
                <TabsTrigger value="livestock" className="text-xs sm:text-sm px-2 py-2">Livestock</TabsTrigger>
                <TabsTrigger value="machinery" className="text-xs sm:text-sm px-2 py-2">Machinery</TabsTrigger>
                <TabsTrigger value="equipment" className="text-xs sm:text-sm px-2 py-2">Equipment</TabsTrigger>
                <TabsTrigger value="feed" className="text-xs sm:text-sm px-2 py-2">Feed</TabsTrigger>
                <TabsTrigger value="medicine" className="text-xs sm:text-sm px-2 py-2">Medicine</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory} className="space-y-4 mt-4 sm:mt-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Enter listing title"
                      className="text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe your item in detail"
                      rows={3}
                      className="text-base resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">Price (ETB) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="Enter price"
                      className="text-base"
                      required
                    />
                  </div>
                </div>

                {/* Category-specific fields - Made mobile responsive */}
                <div className="space-y-4">
                  {selectedCategory === 'livestock' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Select from My Barn</Label>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Animal Type</Label>
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
                              <SelectContent className="bg-background">
                                {animalTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {getAnimalIcon(type.value)} {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Breed</Label>
                            <Input
                              value={formData.attributes.breed || ''}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                attributes: { ...prev.attributes, breed: e.target.value }
                              }))}
                              placeholder="Animal breed"
                              className="text-base"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedCategory === 'machinery' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Machine Type</Label>
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
                        <Label className="text-sm font-medium">Condition</Label>
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
                  )}

                  {selectedCategory === 'feed' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Feed Type</Label>
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
                        <Label className="text-sm font-medium">Quantity (kg)</Label>
                        <Input
                          type="number"
                          value={formData.attributes.quantity || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            attributes: { ...prev.attributes, quantity: e.target.value }
                          }))}
                          placeholder="Amount available"
                          className="text-base"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Location - Mobile responsive */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location_region" className="text-sm font-medium">Region *</Label>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location_zone" className="text-sm font-medium">Zone</Label>
                        <Input
                          id="location_zone"
                          value={formData.location_zone}
                          onChange={(e) => setFormData({...formData, location_zone: e.target.value})}
                          placeholder="Zone name"
                          className="text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location_woreda" className="text-sm font-medium">Woreda</Label>
                        <Input
                          id="location_woreda"
                          value={formData.location_woreda}
                          onChange={(e) => setFormData({...formData, location_woreda: e.target.value})}
                          placeholder="Woreda name"
                          className="text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information - Mobile responsive */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone" className="text-sm font-medium">Contact Phone</Label>
                      <Input
                        id="contact_phone"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                        placeholder="+251 9xx xxx xxx"
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_telegram" className="text-sm font-medium">Telegram Username</Label>
                      <Input
                        id="contact_telegram"
                        value={formData.contact_telegram}
                        onChange={(e) => setFormData({...formData, contact_telegram: e.target.value})}
                        placeholder="@username"
                        className="text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Media Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Photos & Videos</Label>
                  <MediaUpload
                    bucket="listing-photos"
                    onUpload={(urls) => setFormData({...formData, photos: urls})}
                    maxFiles={8}
                    accept="images"
                    existingFiles={formData.photos}
                  />
                </div>

                {/* Submit Button - Mobile responsive */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="submit" className="flex-1 h-11" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Listing'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="sm:w-auto h-11"
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