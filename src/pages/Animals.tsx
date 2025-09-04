import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Heart, Activity, Calendar, MapPin, Camera, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaUpload } from '@/components/media/MediaUpload';

interface Animal {
  id: string;
  animal_id: string;
  name: string;
  type: string;
  breed?: string;
  gender: string;
  birth_date?: string;
  acquisition_date: string;
  photos?: string[];
  notes?: string;
  is_active: boolean;
  created_at: string;
}

type AnimalType = 'cattle' | 'goat' | 'sheep' | 'chicken' | 'camel' | 'donkey' | 'horse';
type Gender = 'male' | 'female' | 'unknown';

export default function Animals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cattle' as AnimalType,
    breed: '',
    gender: 'unknown' as Gender,
    birth_date: '',
    notes: ''
  });
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAnimals();
    }
  }, [user]);

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('owner_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
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
    if (!formData.name || !formData.type) return;

    try {
      if (editingAnimal) {
        // Update existing animal
        const { error } = await supabase
          .from('animals')
          .update({
            name: formData.name,
            type: formData.type,
            breed: formData.breed || null,
            gender: formData.gender,
            birth_date: formData.birth_date || null,
            notes: formData.notes || null
          })
          .eq('id', editingAnimal.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Animal updated successfully!"
        });
      } else {
        // Create new animal
        const { data: animalData, error } = await supabase.rpc('generate_animal_id', {
          owner_name: profile?.display_name || 'User',
          animal_type_param: formData.type
        });

        if (error) throw error;

        const { error: insertError } = await supabase
          .from('animals')
          .insert({
            animal_id: animalData,
            owner_id: user?.id!,
            name: formData.name,
            type: formData.type,
            breed: formData.breed || null,
            gender: formData.gender,
            birth_date: formData.birth_date || null,
            notes: formData.notes || null
          });

        if (insertError) throw insertError;

        toast({
          title: "Success",
          description: "Animal registered successfully!"
        });
      }

      setFormData({
        name: '',
        type: 'cattle' as AnimalType,
        breed: '',
        gender: 'unknown',
        birth_date: '',
        notes: ''
      });
      setEditingAnimal(null);
      setShowForm(false);
      fetchAnimals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setFormData({
      name: animal.name,
      type: animal.type as AnimalType,
      breed: animal.breed || '',
      gender: animal.gender as Gender,
      birth_date: animal.birth_date || '',
      notes: animal.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (animalId: string) => {
    try {
      const { error } = await supabase
        .from('animals')
        .update({ is_active: false })
        .eq('id', animalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Animal removed successfully!"
      });

      fetchAnimals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePhotoUpload = async (urls: string[], animalId: string) => {
    try {
      const { error } = await supabase
        .from('animals')
        .update({ photos: urls })
        .eq('id', animalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Photos uploaded successfully!"
      });

      fetchAnimals();
      setShowPhotoUpload(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const animalTypes = [
    { value: 'cattle', label: 'Cattle' },
    { value: 'goat', label: 'Goat' },
    { value: 'sheep', label: 'Sheep' },
    { value: 'chicken', label: 'Chicken' },
    { value: 'camel', label: 'Camel' },
    { value: 'donkey', label: 'Donkey' },
    { value: 'horse', label: 'Horse' }
  ];

  const getAnimalIcon = (type: string) => {
    switch (type) {
      case 'cattle': return '🐄';
      case 'goat': return '🐐';
      case 'sheep': return '🐑';
      case 'chicken': return '🐔';
      case 'camel': return '🐪';
      case 'donkey': return '🫏';
      case 'horse': return '🐎';
      default: return '🐾';
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
    
    if (months < 12) {
      return `${months} months`;
    }
    return `${Math.floor(months / 12)} years`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
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
          <h1 className="text-3xl font-bold text-primary">Digital Barn</h1>
          <p className="text-muted-foreground">Manage your livestock inventory</p>
        </div>
        
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setEditingAnimal(null);
            setFormData({
              name: '',
              type: 'cattle' as AnimalType,
              breed: '',
              gender: 'unknown',
              birth_date: '',
              notes: ''
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Register Animal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAnimal ? 'Edit Animal' : 'Register New Animal'}</DialogTitle>
              <DialogDescription>
                {editingAnimal ? 'Update animal information' : 'Add a new animal to your digital barn'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Animal Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter animal name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Animal Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: AnimalType) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select animal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {animalTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {getAnimalIcon(type.value)} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => setFormData({...formData, breed: e.target.value})}
                    placeholder="e.g., Holstein"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value: Gender) => setFormData({...formData, gender: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Birth Date</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about the animal"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingAnimal ? 'Update Animal' : 'Register Animal'}
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
      </div>

      {animals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🐄</div>
            <h3 className="text-xl font-semibold mb-2">No Animals Registered</h3>
            <p className="text-muted-foreground mb-4">
              Start building your digital barn by registering your first animal
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Register First Animal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {animals.map((animal) => (
            <Card key={animal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getAnimalIcon(animal.type)}</span>
                    <div>
                      <CardTitle className="text-lg">{animal.name}</CardTitle>
                      <CardDescription>{animal.animal_id}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={animal.gender === 'male' ? 'default' : animal.gender === 'female' ? 'secondary' : 'outline'}>
                    {animal.gender}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span className="capitalize">{animal.type}</span>
                  {animal.breed && <span>• {animal.breed}</span>}
                </div>
                
                {animal.birth_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{calculateAge(animal.birth_date)} old</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Acquired {new Date(animal.acquisition_date).toLocaleDateString()}</span>
                </div>
                
                {animal.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {animal.notes}
                  </p>
                )}
                
                {animal.photos && animal.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {animal.photos.slice(0, 2).map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${animal.name} photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                    ))}
                    {animal.photos.length > 2 && (
                      <div className="w-full h-20 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                        +{animal.photos.length - 2} more
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1"
                    onClick={() => handleEdit(animal)}
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => setShowPhotoUpload(animal.id)}
                  >
                    <Camera className="h-3 w-3" />
                    Photos
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Animal</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {animal.name} from your barn? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(animal.id)}>
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Photo Upload Dialog */}
      <Dialog open={!!showPhotoUpload} onOpenChange={() => setShowPhotoUpload(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photos</DialogTitle>
            <DialogDescription>
              Upload photos for {animals.find(a => a.id === showPhotoUpload)?.name}
            </DialogDescription>
          </DialogHeader>
          <MediaUpload
            bucket="animal-photos"
            onUpload={(urls) => handlePhotoUpload(urls, showPhotoUpload!)}
            maxFiles={5}
            accept="images"
            existingFiles={animals.find(a => a.id === showPhotoUpload)?.photos || []}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}