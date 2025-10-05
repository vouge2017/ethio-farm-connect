import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AnimalCard } from '@/components/animals/AnimalCard';
import { AnimalForm } from '@/components/animals/AnimalForm';
import { AnimalPhotoDialog } from '@/components/animals/AnimalPhotoDialog';
import { useAnimals, useCreateAnimal, useUpdateAnimal, useDeleteAnimal, useUpdateAnimalPhotos } from '@/hooks/useAnimals';
import type { AnimalFormData } from '@/hooks/useAnimals';
import type { Database } from '@/integrations/supabase/types';

type Animal = Database['public']['Tables']['animals']['Row'];

export default function Animals() {
  const [showForm, setShowForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [showPhotoDialog, setShowPhotoDialog] = useState<{ animalId: string; photos: string[] } | null>(null);
  const [deleteDialogAnimalId, setDeleteDialogAnimalId] = useState<string | null>(null);

  const { data: animals = [], isLoading } = useAnimals();
  const createAnimal = useCreateAnimal();
  const updateAnimal = useUpdateAnimal();
  const deleteAnimal = useDeleteAnimal();
  const updatePhotos = useUpdateAnimalPhotos();

  const handleSubmit = (data: AnimalFormData) => {
    if (editingAnimal) {
      updateAnimal.mutate(
        { id: editingAnimal.id, data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingAnimal(null);
          },
        }
      );
    } else {
      createAnimal.mutate(data, {
        onSuccess: () => {
          setShowForm(false);
        },
      });
    }
  };

  const handleEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setShowForm(true);
  };

  const handleDelete = (animalId: string) => {
    setDeleteDialogAnimalId(animalId);
  };

  const confirmDelete = () => {
    if (deleteDialogAnimalId) {
      deleteAnimal.mutate(deleteDialogAnimalId, {
        onSuccess: () => {
          setDeleteDialogAnimalId(null);
        },
      });
    }
  };

  const handlePhotoUpload = (animalId: string) => {
    const animal = animals.find(a => a.id === animalId);
    if (animal) {
      setShowPhotoDialog({
        animalId: animal.id,
        photos: animal.photos || [],
      });
    }
  };

  const handlePhotosUploaded = (urls: string[]) => {
    if (showPhotoDialog) {
      updatePhotos.mutate(
        { animalId: showPhotoDialog.animalId, photos: urls },
        {
          onSuccess: () => {
            setShowPhotoDialog(null);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="p-6 space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            🐄 My Digital Barn
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Manage your livestock and track their health digitally
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>🐾 {animals.length} animals registered</span>
            <span>📊 Digital records</span>
            <span>🇪🇹 Ethiopian farming innovation</span>
          </div>
        </div>
        
        <Button 
          onClick={() => {
            setEditingAnimal(null);
            setShowForm(true);
          }} 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Register Animal
        </Button>
      </div>

      {animals.length === 0 ? (
        <Card className="text-center py-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-dashed border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-6xl mb-4">🐄</div>
            <h3 className="text-xl font-semibold mb-2 text-primary">No Animals Registered</h3>
            <p className="text-muted-foreground mb-4">
              Start building your digital barn by registering your first animal
            </p>
            <Button 
              onClick={() => setShowForm(true)} 
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <Plus className="h-4 w-4" />
              Register First Animal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {animals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPhotoUpload={handlePhotoUpload}
            />
          ))}
        </div>
      )}

      <AnimalForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingAnimal(null);
        }}
        editingAnimal={editingAnimal}
        onSubmit={handleSubmit}
        isLoading={createAnimal.isPending || updateAnimal.isPending}
      />

      {showPhotoDialog && (
        <AnimalPhotoDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setShowPhotoDialog(null);
          }}
          animalId={showPhotoDialog.animalId}
          currentPhotos={showPhotoDialog.photos}
          onPhotosUploaded={handlePhotosUploaded}
        />
      )}

      <AlertDialog open={!!deleteDialogAnimalId} onOpenChange={(open) => !open && setDeleteDialogAnimalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the animal from your digital barn. This action can be undone by contacting support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
