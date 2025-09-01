import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface MediaUploadProps {
  bucket: 'listing-photos' | 'listing-videos' | 'animal-photos';
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  accept?: 'images' | 'videos' | 'both';
  existingFiles?: string[];
}

export const MediaUpload = ({ 
  bucket, 
  onUpload, 
  maxFiles = 5, 
  accept = 'images',
  existingFiles = [] 
}: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(existingFiles);
  const { toast } = useToast();
  const { user } = useAuth();

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width for rural internet)
        let { width, height } = img;
        const maxWidth = 800;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob!], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          0.8 // 80% quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    // Compress images before upload
    const fileToUpload = file.type.startsWith('image/') 
      ? await compressImage(file) 
      : file;
    
    const fileExt = fileToUpload.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = acceptedFiles.map(uploadFile);
      const urls = await Promise.all(uploadPromises);
      
      const newFiles = [...uploadedFiles, ...urls];
      setUploadedFiles(newFiles);
      onUpload(newFiles);
      
      toast({
        title: "Upload Successful",
        description: `${urls.length} file(s) uploaded successfully`
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed", 
        description: error.message || "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [user, uploadedFiles, onUpload, bucket, toast]);

  const removeFile = async (url: string) => {
    const newFiles = uploadedFiles.filter(file => file !== url);
    setUploadedFiles(newFiles);
    onUpload(newFiles);
    
    // Optional: Delete from storage (implement if needed)
    toast({
      title: "File Removed",
      description: "File removed from upload"
    });
  };

  const acceptTypes = {
    images: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    videos: { 'video/*': ['.mp4', '.webm'] },
    both: { 
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm']
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptTypes[accept],
    maxFiles: maxFiles - uploadedFiles.length,
    maxSize: bucket === 'listing-videos' ? 50 * 1024 * 1024 : 5 * 1024 * 1024, // 50MB for videos, 5MB for images
    disabled: uploading || uploadedFiles.length >= maxFiles
  });

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${uploading || uploadedFiles.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          {isDragActive
            ? 'Drop files here...'
            : `Drag & drop ${accept} or click to select`}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Max {maxFiles} files, {bucket === 'listing-videos' ? '50MB' : '5MB'} each
        </p>
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {uploadedFiles.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                {url.includes('.mp4') || url.includes('.webm') ? (
                  <video 
                    src={url} 
                    className="w-full h-full object-cover"
                    controls
                    muted
                  />
                ) : (
                  <img 
                    src={url} 
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(url)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Uploading files...</p>
        </div>
      )}
    </div>
  );
};