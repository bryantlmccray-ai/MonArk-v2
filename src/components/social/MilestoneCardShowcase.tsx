import { useState } from 'react';
import { ShareableMilestoneCard } from './ShareableMilestoneCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const MilestoneCardShowcase: React.FC = () => {
  const [variant, setVariant] = useState<'story' | 'feed'>('story');
  const [accentColor, setAccentColor] = useState<'gold' | 'linen' | 'walnut'>('gold');
  const [milestoneType, setMilestoneType] = useState<'first-match' | 'first-date' | 'connection' | 'weekly-insight'>('first-match');

  const headlines = {
    'first-match': 'MY FIRST MATCH',
    'first-date': 'MY FIRST DATE',
    'connection': 'A NEW CONNECTION',
    'weekly-insight': 'WEEKLY INSIGHT'
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-serif tracking-wide mb-2 text-foreground">
          Milestone Cards
        </h1>
        <p className="text-muted-foreground mb-8">
          Editorial-style social graphics for Instagram Stories & Feed
        </p>

        {/* Controls */}
        <div className="flex flex-wrap gap-6 mb-12 p-6 bg-muted/30 rounded-xl">
          {/* Format */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Format
            </label>
            <Tabs value={variant} onValueChange={(v) => setVariant(v as 'story' | 'feed')}>
              <TabsList>
                <TabsTrigger value="story">Story (9:16)</TabsTrigger>
                <TabsTrigger value="feed">Feed (1:1)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Accent Color — Brand-aligned */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Accent Color
            </label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={accentColor === 'gold' ? 'default' : 'outline'}
                onClick={() => setAccentColor('gold')}
                className="gap-2"
              >
                <span className="w-3 h-3 rounded-full" style={{ background: '#A08C6E' }} />
                Gold
              </Button>
              <Button
                size="sm"
                variant={accentColor === 'linen' ? 'default' : 'outline'}
                onClick={() => setAccentColor('linen')}
                className="gap-2"
              >
                <span className="w-3 h-3 rounded-full" style={{ background: '#E8DED4' }} />
                Linen
              </Button>
              <Button
                size="sm"
                variant={accentColor === 'walnut' ? 'default' : 'outline'}
                onClick={() => setAccentColor('walnut')}
                className="gap-2"
              >
                <span className="w-3 h-3 rounded-full" style={{ background: '#4A3E30' }} />
                Walnut
              </Button>
            </div>
          </div>

          {/* Milestone Type */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Milestone
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(headlines).map(([key, value]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={milestoneType === key ? 'default' : 'outline'}
                  onClick={() => setMilestoneType(key as typeof milestoneType)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Card Preview */}
        <div className="flex justify-center">
          <ShareableMilestoneCard
            variant={variant}
            milestoneType={milestoneType}
            headline={headlines[milestoneType]}
            accentColor={accentColor}
          />
        </div>

        {/* Specs note */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Story: 1080×1920px • Feed: 1080×1080px
        </p>
      </div>
    </div>
  );
};
