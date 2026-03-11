import React, { useState } from 'react';
import { Camera, Upload, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadStepProps {
  onComplete?: () => void;
  maxPhotos?: number;
}

export const PhotoUploadStep: React.FC<PhotoUploadStepProps> = ({ 
  onComplete, 
  maxPhotos = 6 
}) => {
  const [dragOver, setDragOver] = useState(false);
  const { uploadPhoto, deletePhoto, uploading } = usePhotoUpload();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();

  const currentPhotos = profile?.photos || [];
  const canAddMore = currentPhotos.length < maxPhotos;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const photoUrl = await uploadPhoto(file);
      if (photoUrl) {
        const updatedPhotos = [...currentPhotos, photoUrl];
        await updateProfile({ photos: updatedPhotos });
        
        toast({
          title: 'Photo uploaded',
          description: 'Your photo has been added to your profile.',
        });

        if (updatedPhotos.length >= 1 && onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemovePhoto = async (photoUrl: string) => {
    try {
      const success = await deletePhoto(photoUrl);
      if (success) {
        const updatedPhotos = currentPhotos.filter(url => url !== photoUrl);
        await updateProfile({ photos: updatedPhotos });
        
        toast({
          title: 'Photo removed',
          description: 'Photo has been removed from your profile.',
        });
      }
    } catch (error) {
      toast({
        title: 'Remove failed',
        description: 'Failed to remove photo. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6 overflow-y-auto pb-24">
      {/* Header */}
      <div className="text-center space-y-2">
        <Camera className="h-12 w-12 text-goldenrod mx-auto" />
        <h2 className="text-2xl font-semibold text-white">Add Your Photos</h2>
        <p className="text-gray-300">
          Share your best photos to make a great first impression. You can add up to {maxPhotos} photos.
        </p>
      </div>

      {/* Current Photos Grid */}
      {currentPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {currentPhotos.map((photoUrl, index) => (
            <Card key={index} className="relative bg-charcoal-gray border-goldenrod/20 overflow-hidden aspect-square">
              <CardContent className="p-0 h-full">
                <img
                  src={photoUrl}
                  alt={`Profile photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={() => handleRemovePhoto(photoUrl)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-goldenrod text-jet-black px-2 py-1 rounded text-xs font-medium">
                    Primary
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <Card 
          className={`bg-charcoal-gray border-2 border-dashed transition-colors ${
            dragOver 
              ? 'border-goldenrod bg-goldenrod/10' 
              : 'border-goldenrod/30 hover:border-goldenrod/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <Plus className="h-12 w-12 text-goldenrod" />
              <h3 className="text-lg font-medium text-white">Add a Photo</h3>
              <p className="text-gray-400 text-sm">
                Drag and drop an image here, or click to select
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="photo-upload"
                disabled={uploading}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outline"
                  className="border-goldenrod text-goldenrod hover:bg-goldenrod hover:text-jet-black"
                  disabled={uploading}
                  asChild
                >
                  <span className="flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Choose Photo'}
                  </span>
                </Button>
              </label>
              
              <p className="text-xs text-gray-500">
                JPG, PNG up to 5MB
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Uploading photo...</span>
            <span className="text-goldenrod">Please wait</span>
          </div>
          <Progress value={undefined} className="h-2" />
        </div>
      )}

      {/* Photo Count */}
      <div className="text-center text-sm text-gray-400">
        {currentPhotos.length} of {maxPhotos} photos added
      </div>

      {/* Continue Button */}
      {currentPhotos.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={onComplete}
            className="bg-goldenrod-gradient text-jet-black hover:opacity-90 px-8"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};