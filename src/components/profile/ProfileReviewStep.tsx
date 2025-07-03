
import React from 'react';
import { Edit, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { ProfileData, StepCompletionStatus, StepRequirements } from './ProfileCreation';

interface ProfileReviewStepProps {
  profileData: ProfileData;
  stepCompletion: StepCompletionStatus;
  stepRequirements: StepRequirements;
  onEdit: (step: number) => void;
  onComplete: () => void;
}

export const ProfileReviewStep: React.FC<ProfileReviewStepProps> = ({ profileData, stepCompletion, stepRequirements, onEdit, onComplete }) => {
  
  const getStepIcon = (stepKey: keyof StepCompletionStatus, stepRequirement: 'critical' | 'important' | 'optional') => {
    const isCompleted = stepCompletion[stepKey];
    
    if (isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (stepRequirement === 'critical') {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    } else if (stepRequirement === 'important') {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    } else {
      return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStepStatus = (stepKey: keyof StepCompletionStatus, stepRequirement: 'critical' | 'important' | 'optional') => {
    const isCompleted = stepCompletion[stepKey];
    
    if (isCompleted) {
      return { text: 'Completed', color: 'text-green-500' };
    } else if (stepRequirement === 'critical') {
      return { text: 'Required', color: 'text-red-500' };
    } else if (stepRequirement === 'important') {
      return { text: 'Recommended', color: 'text-yellow-500' };
    } else {
      return { text: 'Skipped', color: 'text-gray-500' };
    }
  };
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
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-white">Photos</h3>
                {getStepIcon('photos', stepRequirements.photos)}
                <span className={`text-sm ${getStepStatus('photos', stepRequirements.photos).color}`}>
                  {getStepStatus('photos', stepRequirements.photos).text}
                </span>
              </div>
              <button
                onClick={() => onEdit(2)}
                className="p-2 text-gray-400 hover:text-goldenrod transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            {stepCompletion.photos ? (
              <div className="grid grid-cols-3 gap-2">
                {profileData.photos.slice(0, 6).map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm italic">No photos added yet</div>
            )}
          </div>

          {/* Bio Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-white">About Me</h3>
                {getStepIcon('bio', stepRequirements.bio)}
                <span className={`text-sm ${getStepStatus('bio', stepRequirements.bio).color}`}>
                  {getStepStatus('bio', stepRequirements.bio).text}
                </span>
              </div>
              <button
                onClick={() => onEdit(0)}
                className="p-2 text-gray-400 hover:text-goldenrod transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-300">
              {stepCompletion.bio ? profileData.bio : 'No bio added yet'}
            </p>
          </div>

          {/* Interests Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-white">Interests</h3>
                {getStepIcon('interests', stepRequirements.interests)}
                <span className={`text-sm ${getStepStatus('interests', stepRequirements.interests).color}`}>
                  {getStepStatus('interests', stepRequirements.interests).text}
                </span>
              </div>
              <button
                onClick={() => onEdit(1)}
                className="p-2 text-gray-400 hover:text-goldenrod transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            {stepCompletion.interests ? (
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
            ) : (
              <div className="text-gray-400 text-sm italic">No interests selected yet</div>
            )}
          </div>

          {/* Date Palette Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-white">Date Preferences</h3>
                {getStepIcon('datePalette', stepRequirements.datePalette)}
                <span className={`text-sm ${getStepStatus('datePalette', stepRequirements.datePalette).color}`}>
                  {getStepStatus('datePalette', stepRequirements.datePalette).text}
                </span>
              </div>
              <button
                onClick={() => onEdit(4)}
                className="p-2 text-gray-400 hover:text-goldenrod transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            {stepCompletion.datePalette ? (
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="text-goldenrod">Vibe:</span> {profileData.vibe.join(', ') || 'None selected'}</p>
                <p><span className="text-goldenrod">Budget:</span> {profileData.budget}</p>
                <p><span className="text-goldenrod">Time:</span> {profileData.timeOfDay.join(', ') || 'None selected'}</p>
                <p><span className="text-goldenrod">Activities:</span> {profileData.activityType.join(', ') || 'None selected'}</p>
              </div>
            ) : (
              <div className="text-gray-400 text-sm italic">Date preferences not set yet</div>
            )}
          </div>
          
          {/* Lifestyle Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-white">Lifestyle Details</h3>
                {getStepIcon('lifestyle', stepRequirements.lifestyle)}
                <span className={`text-sm ${getStepStatus('lifestyle', stepRequirements.lifestyle).color}`}>
                  {getStepStatus('lifestyle', stepRequirements.lifestyle).text}
                </span>
              </div>
              <button
                onClick={() => onEdit(3)}
                className="p-2 text-gray-400 hover:text-goldenrod transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            {stepCompletion.lifestyle ? (
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="text-goldenrod">Occupation:</span> {profileData.occupation || 'Not specified'}</p>
                <p><span className="text-goldenrod">Education:</span> {profileData.education_level || 'Not specified'}</p>
                <p><span className="text-goldenrod">Relationship Goals:</span> {profileData.relationship_goals?.join(', ') || 'Not specified'}</p>
              </div>
            ) : (
              <div className="text-gray-400 text-sm italic">Lifestyle details not completed yet</div>
            )}
          </div>
          
          {/* Identity Preferences Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-white">Identity & Preferences</h3>
                {getStepIcon('identityPreferences', stepRequirements.identityPreferences)}
                <span className={`text-sm ${getStepStatus('identityPreferences', stepRequirements.identityPreferences).color}`}>
                  {getStepStatus('identityPreferences', stepRequirements.identityPreferences).text}
                </span>
              </div>
              <button
                onClick={() => onEdit(5)}
                className="p-2 text-gray-400 hover:text-goldenrod transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            {stepCompletion.identityPreferences ? (
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="text-goldenrod">Gender Identity:</span> {profileData.identityPreferences?.genderIdentity || 'Not specified'}</p>
                <p><span className="text-goldenrod">Sexual Orientation:</span> {profileData.identityPreferences?.sexualOrientation || 'Not specified'}</p>
              </div>
            ) : (
              <div className="text-red-400 text-sm italic">Identity preferences required to continue</div>
            )}
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
