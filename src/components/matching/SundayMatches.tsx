import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, MessageCircle, Info } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSubscription } from '@/hooks/useSubscription';

interface Match {
  id: string;
  name: string;
  age: number;
  location: string;
  tagline: string;
  photoUrl: string;
  compatibilityScore: number;
  reason: string;
  interests: string[];
}

const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    name: 'Sophia',
    age: 28,
    location: 'River North',
    tagline: 'Strong communicator · Values depth',
    photoUrl: '/images/matches/sophia.jpg',
    compatibilityScore: 92,
    reason: 'You both value slow-building trust and direct communication.',
    interests: ['Live Jazz', 'Cooking', 'Hiking']
  },
  {
    id: '2',
    name: 'Marcus',
    age: 31,
    location: 'Lincoln Park',
    tagline: 'Intentional dater · Emotionally present',
    photoUrl: '/images/matches/marcus.jpg',
    compatibilityScore: 85,
    reason: 'Complementary conflict styles—he speaks up, you reflect first.',
    interests: ['Poetry', 'Yoga', 'Art Museums']
  },
  {
    id: '3',
    name: 'Elena',
    age: 27,
    location: 'West Loop',
    tagline: 'Curious spirit · Steady pacing',
    photoUrl: '/images/matches/elena.jpg',
    compatibilityScore: 78,
    reason: 'Shared pacing preference and aligned relationship goals.',
    interests: ['Film', 'Running', 'Travel']
  }
];

export const SundayMatches: React.FC = () => {
  const { setShowPaywall } = useSubscription();
  const [matches] = useState<Match[]>(MOCK_MATCHES);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Your 3 Options</h2>
          <p className="text-sm text-muted-foreground">Curated for you this Sunday</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
          New Matches
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {matches.map((match) => (
          <Card key={match.id} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full">
              <img 
                src={match.photoUrl} 
                alt={`${match.name}, ${match.age} — MonArk member`}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement?.classList.add('bg-[#A08C6E]', 'flex', 'items-center', 'justify-center');
                  const fallback = document.createElement('div');
                  fallback.className = 'text-white text-4xl font-serif';
                  fallback.textContent = match.name.slice(0, 2).toUpperCase();
                  target.parentElement?.appendChild(fallback);
                }}
              />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-serif">{match.name}, {match.age}</CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {match.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-primary">{match.compatibilityScore}%</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Match</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground italic">"{match.reason}"</p>
              <div className="flex flex-wrap gap-2">
                {match.interests.map((interest) => (
                  <Badge key={interest} variant="outline" className="text-[10px] font-normal">
                    {interest}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" size="sm" onClick={() => setShowPaywall(true)}>
                  <Heart className="h-4 w-4 mr-2" />
                  Connect
                </Button>
                <Button variant="ghost" size="sm" className="px-3">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
