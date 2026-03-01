
import React from 'react';
import { Edit, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';
import { ProfileData, StepCompletionStatus, StepRequirements } from './ProfileCreation';

interface ProfileReviewStepProps {
  profileData: ProfileData;
  stepCompletion: StepCompletionStatus;
  stepRequirements: StepRequirements;
  onEdit: (step: number) => void;
  onComplete: () => void;
  onCancel?: () => void;
}

export const ProfileReviewStep: React.FC<ProfileReviewStepProps> = ({ profileData, stepCompletion, stepRequirements, onEdit, onComplete, onCancel }) => {
  
  const getStepIcon = (stepKey: keyof StepCompletionStatus, stepRequirement: 'critical' | 'important' | 'optional') => {
    const isCompleted = stepCompletion[stepKey];
    if (isCompleted) return <CheckCircle className="h-5 w-5 text-primary" />;
    if (stepRequirement === 'critical') return <AlertTriangle className="h-5 w-5 text-destructive" />;
    if (stepRequirement === 'important') return <Clock className="h-5 w-5 text-accent" />;
    return <Clock className="h-5 w-5 text-muted-foreground" />;
  };
  
  const getStepStatus = (stepKey: keyof StepCompletionStatus, stepRequirement: 'critical' | 'important' | 'optional') => {
    const isCompleted = stepCompletion[stepKey];
    if (isCompleted) return { text: 'Completed', color: 'text-primary' };
    if (stepRequirement === 'critical') return { text: 'Required', color: 'text-destructive' };
    if (stepRequirement === 'important') return { text: 'Recommended', color: 'text-accent' };
    return { text: 'Skipped', color: 'text-muted-foreground' };
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col relative">
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Exit profile review"
        >
          <X className="h-6 w-6" />
        </button>
      )}
      
      <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-light text-foreground">Profile Review</h1>
          <p className="text-muted-foreground">Here's how others will see your profile</p>
        </div>

        <div className="bg-card rounded-xl p-6 space-y-6 border border-border">
          {/* Photos Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-foreground">Photos</h3>
                {getStepIcon('photos', stepRequirements.photos)}
                <span className={`text-sm ${getStepStatus('photos', stepRequirements.photos).color}`}>
                  {getStepStatus('photos', stepRequirements.photos).text}
                </span>
              </div>
              <button onClick={() => onEdit(2)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
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
              <div className="text-muted-foreground text-sm italic">No photos added yet</div>
            )}
          </div>

          {/* Bio Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-foreground">About Me</h3>
                {getStepIcon('bio', stepRequirements.bio)}
                <span className={`text-sm ${getStepStatus('bio', stepRequirements.bio).color}`}>
                  {getStepStatus('bio', stepRequirements.bio).text}
                </span>
              </div>
              <button onClick={() => onEdit(0)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <p className="text-secondary-foreground">
              {stepCompletion.bio ? profileData.bio : 'No bio added yet'}
            </p>
          </div>

          {/* Interests Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-foreground">Interests</h3>
                {getStepIcon('interests', stepRequirements.interests)}
                <span className={`text-sm ${getStepStatus('interests', stepRequirements.interests).color}`}>
                  {getStepStatus('interests', stepRequirements.interests).text}
                </span>
              </div>
              <button onClick={() => onEdit(1)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            {stepCompletion.interests ? (
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest, index) => (
                  <span key={index} className="px-3 py-1 bg-primary/15 text-primary rounded-full text-sm">
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm italic">No interests selected yet</div>
            )}
          </div>

          {/* Date Palette Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-foreground">Date Preferences</h3>
                {getStepIcon('datePalette', stepRequirements.datePalette)}
                <span className={`text-sm ${getStepStatus('datePalette', stepRequirements.datePalette).color}`}>
                  {getStepStatus('datePalette', stepRequirements.datePalette).text}
                </span>
              </div>
              <button onClick={() => onEdit(4)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            {stepCompletion.datePalette ? (
              <div className="space-y-2 text-sm text-secondary-foreground">
                <p><span className="text-primary">Vibe:</span> {profileData.vibe.join(', ') || 'None selected'}</p>
                <p><span className="text-primary">Budget:</span> {profileData.budget}</p>
                <p><span className="text-primary">Time:</span> {profileData.timeOfDay.join(', ') || 'None selected'}</p>
                <p><span className="text-primary">Activities:</span> {profileData.activityType.join(', ') || 'None selected'}</p>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm italic">Date preferences not set yet</div>
            )}
          </div>
          
          {/* Lifestyle Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-foreground">Lifestyle Details</h3>
                {getStepIcon('lifestyle', stepRequirements.lifestyle)}
                <span className={`text-sm ${getStepStatus('lifestyle', stepRequirements.lifestyle).color}`}>
                  {getStepStatus('lifestyle', stepRequirements.lifestyle).text}
                </span>
              </div>
              <button onClick={() => onEdit(3)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            {stepCompletion.lifestyle ? (
              <div className="space-y-2 text-sm text-secondary-foreground">
                <p><span className="text-primary">Occupation:</span> {profileData.occupation || 'Not specified'}</p>
                <p><span className="text-primary">Education:</span> {profileData.education_level || 'Not specified'}</p>
                <p><span className="text-primary">Relationship Goals:</span> {profileData.relationship_goals?.join(', ') || 'Not specified'}</p>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm italic">Lifestyle details not completed yet</div>
            )}
          </div>
          
          {/* Identity Preferences Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-foreground">Identity & Preferences</h3>
                {getStepIcon('identityPreferences', stepRequirements.identityPreferences)}
                <span className={`text-sm ${getStepStatus('identityPreferences', stepRequirements.identityPreferences).color}`}>
                  {getStepStatus('identityPreferences', stepRequirements.identityPreferences).text}
                </span>
              </div>
              <button onClick={() => onEdit(5)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            {stepCompletion.identityPreferences ? (
              <div className="space-y-2 text-sm text-secondary-foreground">
                <p><span className="text-primary">Gender Identity:</span> {profileData.identityPreferences?.genderIdentity || 'Not specified'}</p>
                <p><span className="text-primary">Sexual Orientation:</span> {profileData.identityPreferences?.sexualOrientation || 'Not specified'}</p>
              </div>
            ) : (
              <div className="text-destructive text-sm italic">Identity preferences required to continue</div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={onComplete}
          className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90"
        >
          My Profile is Ready
        </button>
      </div>
    </div>
  );
};
