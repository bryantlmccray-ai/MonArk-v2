import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type GenderIdentity = Database['public']['Enums']['gender_identity'];
type SexualOrientation = Database['public']['Enums']['sexual_orientation'];

const GENDER_OPTIONS: GenderIdentity[] = [
  'Man', 'Woman', 'Nonbinary', 'Genderfluid', 'Agender', 
  'Demigender', 'Two-Spirit', 'Questioning', 'Custom'
];

const ORIENTATION_OPTIONS: SexualOrientation[] = [
  'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 
  'Queer', 'Asexual', 'Demisexual', 'Questioning', 'Custom'
];

export const IdentityPreferencesSettings: React.FC = () => {
  const { profile, updateProfile, loading } = useProfile();
  const { toast } = useToast();
  
  const [genderIdentity, setGenderIdentity] = useState<GenderIdentity | ''>('');
  const [genderIdentityCustom, setGenderIdentityCustom] = useState('');
  const [sexualOrientation, setSexualOrientation] = useState<SexualOrientation | ''>('');
  const [sexualOrientationCustom, setSexualOrientationCustom] = useState('');
  const [preferenceToSee, setPreferenceToSee] = useState<string[]>([]);
  const [preferenceToBeSeenBy, setPreferenceToBeSeenBy] = useState<string[]>([]);
  const [discoveryPrivacyMode, setDiscoveryPrivacyMode] = useState('open');
  const [identityVisibility, setIdentityVisibility] = useState(true);

  useEffect(() => {
    if (profile) {
      setGenderIdentity(profile.gender_identity || '');
      setGenderIdentityCustom(profile.gender_identity_custom || '');
      setSexualOrientation(profile.sexual_orientation || '');
      setSexualOrientationCustom(profile.sexual_orientation_custom || '');
      setPreferenceToSee(profile.preference_to_see || []);
      setPreferenceToBeSeenBy(profile.preference_to_be_seen_by || []);
      setDiscoveryPrivacyMode(profile.discovery_privacy_mode || 'open');
      setIdentityVisibility(profile.identity_visibility ?? true);
    }
  }, [profile]);

  const handleSave = async () => {
    const updates = {
      gender_identity: genderIdentity as GenderIdentity,
      gender_identity_custom: genderIdentity === 'Custom' ? genderIdentityCustom : null,
      sexual_orientation: sexualOrientation as SexualOrientation,
      sexual_orientation_custom: sexualOrientation === 'Custom' ? sexualOrientationCustom : null,
      preference_to_see: preferenceToSee,
      preference_to_be_seen_by: preferenceToBeSeenBy,
      discovery_privacy_mode: discoveryPrivacyMode,
      identity_visibility: identityVisibility,
    };

    const success = await updateProfile(updates);

    if (success) {
      toast({ title: "Preferences updated", description: "Your identity and discovery preferences have been saved." });
    } else {
      toast({ title: "Update failed", description: "There was an error updating your preferences. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-foreground">Identity & Discovery Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="gender">Gender Identity</Label>
          <Select value={genderIdentity} onValueChange={(value) => setGenderIdentity(value as GenderIdentity)}>
            <SelectTrigger><SelectValue placeholder="Select a gender identity" /></SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((gender) => (<SelectItem key={gender} value={gender}>{gender}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {genderIdentity === 'Custom' && (
          <div className="grid gap-2">
            <Label htmlFor="gender-custom">Custom Gender Identity</Label>
            <Input id="gender-custom" type="text" value={genderIdentityCustom} onChange={(e) => setGenderIdentityCustom(e.target.value)} placeholder="Enter your gender identity" />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="orientation">Sexual Orientation</Label>
          <Select value={sexualOrientation} onValueChange={(value) => setSexualOrientation(value as SexualOrientation)}>
            <SelectTrigger><SelectValue placeholder="Select a sexual orientation" /></SelectTrigger>
            <SelectContent>
              {ORIENTATION_OPTIONS.map((orientation) => (<SelectItem key={orientation} value={orientation}>{orientation}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {sexualOrientation === 'Custom' && (
          <div className="grid gap-2">
            <Label htmlFor="orientation-custom">Custom Sexual Orientation</Label>
            <Input id="orientation-custom" type="text" value={sexualOrientationCustom} onChange={(e) => setSexualOrientationCustom(e.target.value)} placeholder="Enter your sexual orientation" />
          </div>
        )}

        <div className="grid gap-2">
          <Label>Preference to See</Label>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((gender) => (
              <div key={gender} className="flex items-center space-x-2">
                <Checkbox id={`see-${gender}`} checked={preferenceToSee.includes(gender)} onCheckedChange={(checked) => {
                  if (checked) { setPreferenceToSee([...preferenceToSee, gender]); } else { setPreferenceToSee(preferenceToSee.filter((item) => item !== gender)); }
                }} />
                <Label htmlFor={`see-${gender}`} className="cursor-pointer">{gender}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Preference to Be Seen By</Label>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((gender) => (
              <div key={gender} className="flex items-center space-x-2">
                <Checkbox id={`seen-by-${gender}`} checked={preferenceToBeSeenBy.includes(gender)} onCheckedChange={(checked) => {
                  if (checked) { setPreferenceToBeSeenBy([...preferenceToBeSeenBy, gender]); } else { setPreferenceToBeSeenBy(preferenceToBeSeenBy.filter((item) => item !== gender)); }
                }} />
                <Label htmlFor={`seen-by-${gender}`} className="cursor-pointer">{gender}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="privacy-mode">Discovery Privacy Mode</Label>
          <Select value={discoveryPrivacyMode} onValueChange={(value) => setDiscoveryPrivacyMode(value)}>
            <SelectTrigger><SelectValue placeholder="Select privacy mode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="identity-visibility">Show Identity on Profile</Label>
          <Switch id="identity-visibility" checked={identityVisibility} onCheckedChange={(checked) => setIdentityVisibility(checked)} />
        </div>

        <Button onClick={handleSave} className="w-full">Save Preferences</Button>
      </CardContent>
    </Card>
  );
};
