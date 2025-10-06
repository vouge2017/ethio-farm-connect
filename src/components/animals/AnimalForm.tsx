import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { animalTypes, getAnimalIcon, breedsByAnimalType } from '@/lib/animalHelpers';
import type { AnimalFormData } from '@/hooks/useAnimals';
import type { AnimalType, AnimalGender } from '@/lib/animalHelpers';
import type { Database } from '@/integrations/supabase/types';

type Animal = Database['public']['Tables']['animals']['Row'];

interface AnimalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAnimal: Animal | null;
  onSubmit: (data: AnimalFormData) => void;
  isLoading?: boolean;
}

export const AnimalForm = ({ 
  open, 
  onOpenChange, 
  editingAnimal, 
  onSubmit,
  isLoading = false 
}: AnimalFormProps) => {
  const [formData, setFormData] = useState<AnimalFormData>({
    name: '',
    type: 'ox' as AnimalType,
    breed: '',
    gender: 'unknown' as AnimalGender,
    birth_date: '',
    notes: ''
  });

  useEffect(() => {
    if (editingAnimal) {
      setFormData({
        name: editingAnimal.name || '',
        type: editingAnimal.type as AnimalType,
        breed: editingAnimal.breed || '',
        gender: editingAnimal.gender as AnimalGender,
        birth_date: editingAnimal.birth_date || '',
        notes: editingAnimal.notes || ''
      });
    } else {
      setFormData({
        name: '',
        type: 'ox' as AnimalType,
        breed: '',
        gender: 'unknown' as AnimalGender,
        birth_date: '',
        notes: ''
      });
    }
  }, [editingAnimal, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type) return;
    onSubmit(formData);
  };

  const availableBreeds = breedsByAnimalType[formData.type] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingAnimal ? 'Edit Animal' : 'Register New Animal'}</DialogTitle>
          <DialogDescription>
            {editingAnimal ? 'Update animal information' : 'Add a new animal to your digital barn'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Animal Name (Optional)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter animal name (optional)"
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
              <Select 
                value={formData.breed} 
                onValueChange={(value) => setFormData({...formData, breed: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select breed" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {availableBreeds.map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value: AnimalGender) => setFormData({...formData, gender: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
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
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading 
                ? 'Saving...' 
                : editingAnimal ? 'Update Animal' : 'Register Animal'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
