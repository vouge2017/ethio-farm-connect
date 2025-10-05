import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MediaUpload } from '@/components/media/MediaUpload';

interface AnimalPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  currentPhotos: string[];
  onPhotosUploaded: (urls: string[]) => void;
}

export const AnimalPhotoDialog = ({ 
  open, 
  onOpenChange, 
  animalId, 
  currentPhotos,
  onPhotosUploaded 
}: AnimalPhotoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Animal Photos</DialogTitle>
          <DialogDescription>
            Upload or manage photos for this animal
          </DialogDescription>
        </DialogHeader>
        <MediaUpload
          bucket="animal-photos"
          maxFiles={10}
          existingFiles={currentPhotos}
          onUpload={onPhotosUploaded}
        />
      </DialogContent>
    </Dialog>
  );
};
