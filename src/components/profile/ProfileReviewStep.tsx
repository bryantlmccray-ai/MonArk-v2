
import React from 'react';
import { Edit } from 'lucide-react';
import { ProfileData } from './ProfileCreation';

interface ProfileReviewStepProps {
  profileData: ProfileData;
  onEdit: (step: number) => void;
  onComplete: () => void;
}

export const ProfileReviewStep: React.FC<ProfileReviewStepProps> = ({ profileData, onEdit, onComplete }) => {
  return (
    <div className="min-h-screen bg-jet-black p-6 flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-light text-white">Profile Review</h1>
          <p className="text-gray-400">Here's how others will see your profile</p>
        </div>

        {/* Profile Preview */}
        <div className="bg-charcoal-gray rounded-xl p-6 space-y-6">
          {/* Photos Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Photos</h3>
              <button
                onClick={() => onEdit(2)}
                className="p-2 text-gray-400 hover:text-goldenrod transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {profileData.photos.slice(0, 6).map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">About Me</h3>
              <button
                onClick={() => onEdit(0)}
                className="p-2 text-gray-400 hover:text-goldenrod transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-300">{profileData.bio || 'No bio added yet'}</p>
          </div>

          {/* Interests Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Interests</h3>
              <button
                onClick={() => onEdit(1)}
                className="p-2 text-gray-400 hover:text-goldenrod transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileData.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-goldenrod/20 text-goldenrod rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Date Palette Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Date Preferences</h3>
              <button
                onClick={() => onEdit(3)}
                className="p-2 text-gray-400 hover:text-goldenrod transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <p><span className="text-goldenrod">Vibe:</span> {profileData.vibe.join(', ') || 'None selected'}</p>
              <p><span className="text-goldenrod">Budget:</span> {profileData.budget}</p>
              <p><span className="text-goldenrod">Time:</span> {profileData.timeOfDay.join(', ') || 'None selected'}</p>
              <p><span className="text-goldenrod">Activities:</span> {profileData.activityType.join(', ') || 'None selected'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div className="pt-6">
        <button
          onClick={onComplete}
          className="w-full py-4 bg-goldenrod-gradient text-jet-black font-semibold rounded-xl transition-all duration-300 hover:shadow-golden-glow"
        >
          My Profile is Ready
        </button>
      </div>
    </div>
  );
};
