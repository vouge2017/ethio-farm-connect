import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Calendar, Edit, Camera, Trash2, Stethoscope, Milk } from 'lucide-react';
import { getAnimalIcon, calculateAge, formatDate } from '@/lib/animalHelpers';
import type { Database } from '@/integrations/supabase/types';

type Animal = Database['public']['Tables']['animals']['Row'];

interface AnimalCardProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onDelete: (animalId: string) => void;
  onPhotoUpload: (animalId: string) => void;
  onHealthRecords?: (animalId: string, animalName: string) => void;
  onMilkProduction?: (animalId: string, animalName: string) => void;
}

export const AnimalCard = ({ animal, onEdit, onDelete, onPhotoUpload, onHealthRecords, onMilkProduction }: AnimalCardProps) => {
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-primary/20 hover:border-l-primary"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getAnimalIcon(animal.type)}</span>
            <div>
              <CardTitle className="text-lg">{animal.name}</CardTitle>
              <CardDescription>{animal.animal_id}</CardDescription>
            </div>
          </div>
          <Badge 
            variant={
              animal.gender === 'male' 
                ? 'default' 
                : animal.gender === 'female' 
                ? 'secondary' 
                : 'outline'
            }
          >
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
        
        {animal.acquisition_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Acquired {formatDate(animal.acquisition_date)}</span>
          </div>
        )}
        
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
        
        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1"
              onClick={() => onEdit(animal)}
            >
              <Edit className="h-3 w-3" />
              Edit
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1"
              onClick={() => onPhotoUpload(animal.id)}
            >
              <Camera className="h-3 w-3" />
              Photos
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onDelete(animal.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex gap-2">
            {onHealthRecords && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1"
                onClick={() => onHealthRecords(animal.id, animal.name || animal.animal_id)}
              >
                <Stethoscope className="h-3 w-3" />
                Health
              </Button>
            )}
            
            {onMilkProduction && ['cow', 'cattle'].includes(animal.type) && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1"
                onClick={() => onMilkProduction(animal.id, animal.name || animal.animal_id)}
              >
                <Milk className="h-3 w-3" />
                Milk
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
