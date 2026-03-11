import React, { useState, useRef } from 'react';
import { Plus, X, Upload, Camera } from 'lucide-react';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useToast } from '@/hooks/use-toast';

interface SimplifiedPhotosStepProps {
  onNext: (photos: string[]) => void;
  onSkip?: () => void;
}

export const SimplifiedPhotosStep: React.FC<SimplifiedPhotosStepProps> = ({ onNext, onSkip }) => {
  const [photos, setPhotos] = useState<string[]>(['', '', '']);
  const { uploadPhoto, deletePhoto, uploading } = usePhotoUpload();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSlot, setCurrentSlot] = useState<number>(0);

  const photoSlots = [
    { id: 0, label: 'Main photo', subtitle: 'A clear shot of your face', required: true },
    { id: 1, label: 'Full body or activity', subtitle: 'Show your personality', required: true },
    { id: 2, label: 'Your choice', subtitle: 'Friends, hobby, travel...', required: true },
  ];

  const filledPhotos = photos.filter(p => p).length;
  const canProceed = filledPhotos >= 3;

  const handlePhotoUpload = (slotIndex: number) => {
    setCurrentSlot(slotIndex);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const photoUrl = await uploadPhoto(file);
      if (photoUrl) {
        const newPhotos = [...photos];
        newPhotos[currentSlot] = photoUrl;
        setPhotos(newPhotos);
        toast({
          title: "Photo uploaded!",
          description: `${filledPhotos + 1}/3 photos added`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoRemove = async (slotIndex: number) => {
    const photoUrl = photos[slotIndex];
    if (!photoUrl) return;

    try {
      await deletePhoto(photoUrl);
      const newPhotos = [...photos];
      newPhotos[slotIndex] = '';
      setPhotos(newPhotos);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleNext = () => {
    onNext(photos.filter(p => p));
  };

  return (
    <div className="bg-background p-6 pb-16">
      <div className="flex-1 max-w-md mx-auto w-full space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`h-1.5 w-6 rounded-full ${step === 1 ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">Add Your Photos</h1>
          <p className="text-muted-foreground">3 photos minimum to get started</p>
        </div>

        {/* Photo Grid */}
        <div className="space-y-4">
          {photoSlots.map((slot) => (
            <div
              key={slot.id}
              className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed overflow-hidden transition-all ${
                photos[slot.id] 
                  ? 'border-primary/50 bg-primary/5' 
                  : 'border-border hover:border-primary/50 bg-card'
              }`}
            >
              {photos[slot.id] ? (
                <>
                  <img
                    src={photos[slot.id]}
                    alt={`Photo ${slot.id + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handlePhotoRemove(slot.id)}
                    disabled={uploading}
                    className="absolute top-3 right-3 p-2 bg-background/90 rounded-full text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-background/90 rounded-full">
                    <span className="text-sm text-foreground font-medium">{slot.label}</span>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => handlePhotoUpload(slot.id)}
                  disabled={uploading}
                  className="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                >
                  {uploading && currentSlot === slot.id ? (
                    <Upload className="h-10 w-10 mb-3 animate-pulse" />
                  ) : (
                    <Plus className="h-10 w-10 mb-3" />
                  )}
                  <p className="font-medium">{slot.label}</p>
                  <p className="text-sm opacity-70">{slot.subtitle}</p>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Photo count */}
        <div className="text-center">
          <span className={`text-sm font-medium ${canProceed ? 'text-primary' : 'text-muted-foreground'}`}>
            {filledPhotos}/3 photos added
          </span>
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-6 max-w-md mx-auto w-full space-y-3">
        <button
          onClick={handleNext}
          disabled={!canProceed || uploading}
          className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Continue'}
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};
