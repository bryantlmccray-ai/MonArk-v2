
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ProfileData } from './ProfileCreation';

interface PhotosStepProps {
  profileData: ProfileData;
  updateData: (data: Partial<ProfileData>) => void;
  onNext: () => void;
}

export const PhotosStep: React.FC<PhotosStepProps> = ({ profileData, updateData, onNext }) => {
  const [photos, setPhotos] = useState<string[]>(profileData.photos);

  const photoSlots = [
    { id: 0, label: 'Your main photo', subtitle: '(a clear, recent shot of you)', isMain: true },
    { id: 1, label: 'Enjoying a hobby or passion...', subtitle: '', isMain: false },
    { id: 2, label: 'With friends or family...', subtitle: '', isMain: false },
    { id: 3, label: 'A full-body photo...', subtitle: '', isMain: false },
    { id: 4, label: 'A photo that shows your personality...', subtitle: '', isMain: false },
    { id: 5, label: 'Your choice!', subtitle: '', isMain: false },
  ];

  const handlePhotoUpload = (slotIndex: number) => {
    // Simulate photo upload - in real app, this would open camera/gallery
    const placeholderPhotos = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b047?w=300&h=300&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1539571696247-f4d8e4e47f66?w=300&h=300&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face',
    ];
    
    const newPhotos = [...photos];
    newPhotos[slotIndex] = placeholderPhotos[slotIndex % placeholderPhotos.length];
    setPhotos(newPhotos);
    updateData({ photos: newPhotos });
  };

  const handlePhotoRemove = (slotIndex: number) => {
    const newPhotos = [...photos];
    newPhotos[slotIndex] = '';
    setPhotos(newPhotos);
    updateData({ photos: newPhotos.filter(photo => photo) });
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
                    className="absolute top-2 right-2 p-1 bg-jet-black/80 rounded-full text-white hover:bg-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handlePhotoUpload(slot.id)}
                  className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-goldenrod hover:border-goldenrod/50 transition-colors"
                >
                  <Plus className="h-8 w-8 mb-2" />
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
      </div>

      {/* Next Button */}
      <div className="pt-6">
        <button
          onClick={handleNext}
          disabled={!photos[0]} // Require at least main photo
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
