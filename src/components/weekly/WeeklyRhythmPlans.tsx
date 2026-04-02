import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sparkles, Compass, Clock, MapPin, Shield, 
  Heart, Users, Check, ArrowRight, Calendar, 
  MessageCircle, AlertTriangle, Ghost, Zap, Coffee, X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface MatchedPerson {
  id: string;
  name: string;
  age: number;
  photo: string;
  rhythm: 'reset' | 'spark' | 'stretch';
  rifScore: number;
  sharedInterests: string[];
  availability: string;
}

interface DatePlan {
  id: string;
  rhythm: 'reset' | 'spark' | 'stretch';
  title: string;
  tagline: string;
  venue: {
    name: string;
    address: string;
    type: string;
  };
  timeWindow: {
    day: string;
    start: string;
    end: string;
    duration: string;
  };
  matchedPeople: MatchedPerson[];
  careFeatures: string[];
  energyLevel: number;
}

// Demo data for the three rhythm plans
const DEMO_PLANS: DatePlan[] = [
  {
    id: 'reset-1',
    rhythm: 'reset',
    title: 'Slow Morning at The Alcove',
    tagline: 'Coffee, quiet corners, and genuine conversation',
    venue: {
      name: 'The Alcove Coffee House',
      address: '231 Maple Street, Arts District',
      type: 'Café & Bookshop'
    },
    timeWindow: {
      day: 'Saturday',
      start: '10:00 AM',
      end: '11:30 AM',
      duration: '90 min'
    },
    matchedPeople: [
      {
        id: 'p1',
        name: 'Maya',
        age: 29,
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        rhythm: 'reset',
        rifScore: 87,
        sharedInterests: ['Reading', 'Art', 'Mindfulness'],
        availability: 'Saturday mornings'
      },
      {
        id: 'p2',
        name: 'Elena',
        age: 31,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        rhythm: 'reset',
        rifScore: 82,
        sharedInterests: ['Photography', 'Journaling'],
        availability: 'Weekends'
      }
    ],
    careFeatures: ['Clear end time', 'Public venue', 'Quiet setting'],
    energyLevel: 25
  },
  {
    id: 'spark-1',
    rhythm: 'spark',
    title: 'Gallery Walk & Wine',
    tagline: 'Art, easy laughs, and a glass of something nice',
    venue: {
      name: 'Artisan Gallery District',
      address: '45 Gallery Row, Downtown',
      type: 'Art Gallery'
    },
    timeWindow: {
      day: 'Friday',
      start: '6:30 PM',
      end: '8:30 PM',
      duration: '2 hours'
    },
    matchedPeople: [
      {
        id: 'p3',
        name: 'Jordan',
        age: 28,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        rhythm: 'spark',
        rifScore: 91,
        sharedInterests: ['Art', 'Wine', 'Live Music'],
        availability: 'Friday evenings'
      },
      {
        id: 'p4',
        name: 'Ava',
        age: 27,
        photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
        rhythm: 'spark',
        rifScore: 85,
        sharedInterests: ['Culture', 'Cocktails', 'Design'],
        availability: 'Evenings'
      },
      {
        id: 'p5',
        name: 'Marcus',
        age: 32,
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        rhythm: 'spark',
        rifScore: 79,
        sharedInterests: ['Art', 'Conversation'],
        availability: 'Weekends'
      }
    ],
    careFeatures: ['Walkable area', 'Multiple venues', 'Easy exit'],
    energyLevel: 55
  },
  {
    id: 'stretch-1',
    rhythm: 'stretch',
    title: 'Sunset Kayak & Bonfire',
    tagline: 'A little adventure, new perspectives, shared wonder',
    venue: {
      name: 'Harbor Bay Outfitters',
      address: '1200 Shoreline Dr, Marina',
      type: 'Outdoor Adventure'
    },
    timeWindow: {
      day: 'Sunday',
      start: '4:00 PM',
      end: '7:00 PM',
      duration: '3 hours'
    },
    matchedPeople: [
      {
        id: 'p6',
        name: 'Kai',
        age: 30,
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
        rhythm: 'stretch',
        rifScore: 88,
        sharedInterests: ['Outdoors', 'Adventure', 'Sunsets'],
        availability: 'Sunday afternoons'
      }
    ],
    careFeatures: ['Safety briefing', 'Group activity', 'Visible SOS'],
    energyLevel: 80
  }
];

const rhythmConfig = {
  reset: {
    icon: Moon,
    label: 'Reset',
    description: 'Calm & restorative',
    gradient: 'from-indigo-500/20 via-purple-500/10 to-blue-500/20',
    accent: 'text-indigo-400',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10'
  },
  spark: {
    icon: Sparkles,
    label: 'Spark',
    description: 'Light & social',
    gradient: 'from-amber-500/20 via-orange-500/10 to-rose-500/20',
    accent: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10'
  },
  stretch: {
    icon: Compass,
    label: 'Stretch',
    description: 'Adventurous',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/20',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10'
  }
};

export const WeeklyRhythmPlans = () => {
  const [selectedRhythm, setSelectedRhythm] = useState<'reset' | 'spark' | 'stretch' | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DatePlan | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSelectPlan = (plan: DatePlan) => {
    setSelectedPlan(plan);
    setShowConfirmation(true);
  };

  const handleConfirmPlan = () => {
    // In real app, this would call the API
    setShowConfirmation(false);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative px-6 pt-8 pb-12"
      >
        {/* Ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative max-w-2xl mx-auto text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold tracking-wider uppercase mb-4"
          >
            <Calendar className="w-3 h-3" />
            Your Weekly Rhythm
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            How are you feeling?
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-lg"
          >
            Pick your rhythm. We'll match you with people on the same wavelength.
          </motion.p>
        </div>
      </motion.div>

      {/* Rhythm Selector */}
      <div className="px-6 pb-8">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          {(['reset', 'spark', 'stretch'] as const).map((rhythm, idx) => {
            const config = rhythmConfig[rhythm];
            const Icon = config.icon;
            const isSelected = selectedRhythm === rhythm;
            
            return (
              <motion.button
                key={rhythm}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                onClick={() => setSelectedRhythm(isSelected ? null : rhythm)}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-300
                  ${isSelected 
                    ? `${config.border} bg-gradient-to-br ${config.gradient}` 
                    : 'border-border/50 hover:border-border bg-card/50'
                  }
                `}
              >
                <div className={`
                  w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center
                  ${isSelected ? config.bg : 'bg-muted/50'}
                `}>
                  <Icon className={`w-6 h-6 ${isSelected ? config.accent : 'text-muted-foreground'}`} />
                </div>
                <div className={`font-semibold text-lg ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {config.label}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {config.description}
                </div>
                
                {isSelected && (
                  <motion.div
                    layoutId="rhythm-check"
                    className={`absolute top-3 right-3 w-6 h-6 rounded-full ${config.bg} flex items-center justify-center`}
                  >
                    <Check className={`w-4 h-4 ${config.accent}`} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Clear CTA after mood selection */}
        <AnimatePresence>
          {selectedRhythm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-muted-foreground mb-2">
                Showing <span className="font-medium text-foreground">{rhythmConfig[selectedRhythm].label}</span> date plans ↓
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Plans Display */}
      <AnimatePresence mode="wait">
        {selectedRhythm && (
          <motion.div
            key={selectedRhythm}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 pb-12"
          >
            <div className="max-w-4xl mx-auto">
              {DEMO_PLANS.filter(p => p.rhythm === selectedRhythm).map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  onSelect={() => handleSelectPlan(plan)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Plans Preview (when nothing selected) */}
      {!selectedRhythm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="px-6 pb-12"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-xl font-semibold text-center text-muted-foreground">
              Your three plans for the week
            </h2>
            
            <div className="grid gap-6">
              {DEMO_PLANS.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.15 }}
                >
                  <PlanCard plan={plan} onSelect={() => handleSelectPlan(plan)} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="border-primary/20 bg-card">
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${rhythmConfig[selectedPlan.rhythm].bg} flex items-center justify-center`}>
                      {(() => {
                        const Icon = rhythmConfig[selectedPlan.rhythm].icon;
                        return <Icon className={`w-8 h-8 ${rhythmConfig[selectedPlan.rhythm].accent}`} />;
                      })()}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {selectedPlan.title}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {selectedPlan.timeWindow.day} · {selectedPlan.timeWindow.start}
                    </p>
                  </div>

                  {/* Care Features */}
                  <div className="p-4 rounded-xl bg-secondary border-2 border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-foreground" />
                      <span className="font-semibold text-foreground">Wrapped in care</span>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-foreground/70 font-medium">
                        <Check className="w-4 h-4 text-primary" />
                        Shared itinerary with your safety contact
                      </li>
                      <li className="flex items-center gap-2 text-sm text-foreground/70 font-medium">
                        <Check className="w-4 h-4 text-primary" />
                        Visible SOS throughout the date
                      </li>
                      <li className="flex items-center gap-2 text-sm text-foreground/70 font-medium">
                        <Check className="w-4 h-4 text-primary" />
                        Clear {selectedPlan.timeWindow.duration} window ({selectedPlan.timeWindow.start} - {selectedPlan.timeWindow.end})
                      </li>
                    </ul>
                  </div>

                  {/* Post-Date Promise */}
                  <div className="p-4 rounded-xl bg-secondary border-2 border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-foreground" />
                      <span className="font-semibold text-foreground">After the meet</span>
                    </div>
                    <p className="text-sm text-foreground/70 font-medium">
                      We'll close the loop — next step if it clicked, kind close if it didn't. No limbo. No ghosting.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowConfirmation(false)}
                    >
                      Back
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleConfirmPlan}
                    >
                      Confirm Plan
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anti-Ghosting Feature Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="px-6 pb-12"
      >
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-2 border-border bg-card shadow-elevated rounded-2xl">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-secondary border-2 border-border flex items-center justify-center">
                  <Ghost className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground bg-secondary border border-border rounded-full px-3 py-1 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Anti-Ghosting
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground bg-card border border-border rounded-full px-2 py-0.5">
                      Built-in
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mt-1">
                    Close the Loop
                  </h3>
                </div>
              </div>

              <p className="text-foreground/70 font-medium mb-6">
                After every meet, we help both people move forward — no awkward drift, no wondering what happened.
              </p>

              {/* Demo Flow */}
              <div className="space-y-4">
                {/* Step 1: How did it feel? */}
                <div className="p-4 rounded-xl bg-secondary border-2 border-border">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
                    <span className="w-5 h-5 rounded-full bg-card border border-border text-foreground flex items-center justify-center text-xs font-bold">1</span>
                    After-Action Check-in
                  </div>
                  <p className="text-foreground font-semibold mb-3">How did it feel?</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-card border-2 border-border rounded-xl px-4 py-2 text-sm font-semibold text-foreground cursor-pointer hover:shadow-md transition-all flex items-center gap-2">
                      <Zap className="w-4 h-4 text-rosegold-deep" />
                      Great energy
                    </span>
                    <span className="bg-card border-2 border-border rounded-xl px-4 py-2 text-sm font-semibold text-foreground cursor-pointer hover:shadow-md transition-all">
                      Neutral
                    </span>
                    <span className="bg-card border-2 border-border rounded-xl px-4 py-2 text-sm font-semibold text-foreground/70 cursor-pointer hover:shadow-md transition-all">
                      Not a fit
                    </span>
                  </div>
                </div>

                {/* Step 2: Micro-prompts */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Advance */}
                  <div className="p-4 rounded-xl bg-secondary border-2 border-border">
                    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                      <span className="w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold">2A</span>
                      If it clicked...
                    </div>
                    <p className="text-foreground font-semibold mb-2">Micro-prompt (Advance)</p>
                    <div className="p-3 rounded-xl bg-card border-2 border-border">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Coffee className="w-4 h-4 text-foreground" />
                        <span className="font-semibold">Next step:</span>
                      </div>
                      <p className="text-foreground/60 text-sm mt-1 italic font-medium">
                        "Coffee Sunday 11:00?"
                      </p>
                    </div>
                    <Button size="sm" className="w-full mt-3 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Keep it going
                    </Button>
                  </div>

                  {/* Graceful Close */}
                  <div className="p-4 rounded-xl bg-secondary border-2 border-border">
                    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground/70">
                      <span className="w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-foreground">2B</span>
                      If not a match...
                    </div>
                    <p className="text-foreground font-semibold mb-2">Micro-prompt (Close Kindly)</p>
                    <div className="p-3 rounded-xl bg-card border-2 border-border">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Heart className="w-4 h-4 text-foreground/60" />
                        <span className="font-semibold">Kind close:</span>
                      </div>
                      <p className="text-foreground/60 text-sm mt-1 italic font-medium">
                        "Thanks for meeting, not a match for me but wishing you well!"
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-3 border-2 border-border font-semibold text-foreground hover:bg-secondary">
                      <Check className="w-4 h-4 mr-2" />
                      End gracefully
                    </Button>
                  </div>
                </div>

                {/* Result */}
                <div className="p-4 rounded-xl bg-secondary border-2 border-border text-center">
                  <p className="text-sm text-foreground font-semibold">
                    Two taps. Everyone knows where they stand.
                  </p>
                  <p className="text-xs text-foreground/60 font-medium mt-1">
                    No limbo. No ghosting. Just clarity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

// Plan Card Component
const PlanCard = ({ plan, onSelect }: { plan: DatePlan; onSelect: () => void }) => {
  const config = rhythmConfig[plan.rhythm];
  const Icon = config.icon;

  return (
    <Card className={`overflow-hidden border-2 ${config.border} bg-gradient-to-br ${config.gradient}`}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Left: Plan Info */}
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${config.accent}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${config.bg} ${config.accent} border-0`}>
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {plan.timeWindow.duration}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mt-1">
                  {plan.title}
                </h3>
                <p className="text-muted-foreground text-sm italic mt-1">
                  "{plan.tagline}"
                </p>
              </div>
            </div>

            {/* Venue & Time */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">{plan.venue.name}</div>
                  <div className="text-muted-foreground">{plan.venue.address}</div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">{plan.timeWindow.day}</div>
                  <div className="text-muted-foreground">
                    {plan.timeWindow.start} – {plan.timeWindow.end}
                  </div>
                </div>
              </div>
            </div>

            {/* Energy Level */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Energy level:</span>
              <Progress value={plan.energyLevel} className="h-2 flex-1 max-w-32" />
              <span className="text-xs text-muted-foreground">{plan.energyLevel}%</span>
            </div>

            {/* Care Features */}
            <div className="flex flex-wrap gap-2">
              {plan.careFeatures.map((feature, idx) => (
                <Badge key={idx} variant="outline" className="bg-background/50 text-xs">
                  <Shield className="w-3 h-3 mr-1 text-primary" />
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {/* Right: Matched People */}
          <div className="lg:w-72 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="w-4 h-4" />
              People on your wavelength
            </div>
            
            <div className="space-y-2">
              {plan.matchedPeople.map((person) => (
                <div 
                  key={person.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50"
                >
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={person.photo} alt={person.name} />
                    <AvatarFallback>{person.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{person.name}, {person.age}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rosegold-deep" />
                        <span className="text-xs text-foreground/60 font-medium">{person.rifScore}%</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {person.sharedInterests.slice(0, 2).join(' · ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={onSelect} className="w-full mt-4">
              Choose this plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
