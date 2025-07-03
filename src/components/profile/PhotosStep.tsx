
import React, { useState, useRef } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { ProfileData } from './ProfileCreation';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useToast } from '@/hooks/use-toast';

interface PhotosStepProps {
  profileData: ProfileData;
  updateData: (data: Partial<ProfileData>) => void;
  onNext: () => void;
}

export const PhotosStep: React.FC<PhotosStepProps> = ({ profileData, updateData, onNext }) => {
  const [photos, setPhotos] = useState<string[]>(profileData.photos);
  const { uploadPhoto, deletePhoto, uploading } = usePhotoUpload();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSlot, setCurrentSlot] = useState<number>(0);

  const photoSlots = [
    { id: 0, label: 'Your main photo', subtitle: '(a clear, recent shot of you)', isMain: true },
    { id: 1, label: 'Enjoying a hobby or passion...', subtitle: '', isMain: false },
    { id: 2, label: 'With friends or family...', subtitle: '', isMain: false },
    { id: 3, label: 'A full-body photo...', subtitle: '', isMain: false },
    { id: 4, label: 'A photo that shows your personality...', subtitle: '', isMain: false },
    { id: 5, label: 'Your choice!', subtitle: '', isMain: false },
  ];

  const handlePhotoUpload = (slotIndex: number) => {
    setCurrentSlot(slotIndex);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
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
        updateData({ photos: newPhotos });
        
        toast({
          title: "Photo uploaded successfully!",
          description: "Your photo has been added to your profile.",
        });
      } else {
        toast({
          title: "Upload failed",
          description: "There was an error uploading your photo. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your photo. Please try again.",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoRemove = async (slotIndex: number) => {
    const photoUrl = photos[slotIndex];
    if (!photoUrl) return;

    try {
      const deleted = await deletePhoto(photoUrl);
      if (deleted) {
        const newPhotos = [...photos];
        newPhotos[slotIndex] = '';
        setPhotos(newPhotos);
        updateData({ photos: newPhotos.filter(photo => photo) });
        
        toast({
          title: "Photo removed",
          description: "Your photo has been removed from your profile.",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "There was an error removing your photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="min-h-screen bg-jet-black p-6 flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-light text-white">Curate Your Photos</h1>
          <p className="text-gray-400">Add up to 6 photos. We recommend a variety of shots to best tell your story.</p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 gap-4">
          {photoSlots.map((slot) => (
            <div
              key={slot.id}
              className={`relative aspect-square rounded-xl border-2 border-dashed border-gray-600 overflow-hidden ${
                slot.isMain ? 'col-span-2 aspect-[3/2]' : ''
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
                    className="absolute top-2 right-2 p-1 bg-jet-black/80 rounded-full text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handlePhotoUpload(slot.id)}
                  disabled={uploading}
                  className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-goldenrod hover:border-goldenrod/50 transition-colors disabled:opacity-50"
                >
                  {uploading && currentSlot === slot.id ? (
                    <Upload className="h-8 w-8 mb-2 animate-pulse" />
                  ) : (
                    <Plus className="h-8 w-8 mb-2" />
                  )}
                  <div className="text-center px-2">
                    <p className="text-sm font-medium">{slot.label}</p>
                    {slot.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">{slot.subtitle}</p>
                    )}
                  </div>
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
      </div>

      {/* Next Button */}
      <div className="pt-6">
        <button
          onClick={handleNext}
          disabled={!photos[0] || uploading} // Require at least main photo
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};
