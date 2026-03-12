import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Download, 
  X, 
  Heart, 
  MessageCircle,
  Calendar,
  TrendingUp,
  Zap,
  Star,
  Clock
} from 'lucide-react';
import { useMonthlyAnalytics, MonthlyInsights } from '@/hooks/useMonthlyAnalytics';
import { format } from 'date-fns';

interface MonthlyRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  month?: number;
  year?: number;
}

export const MonthlyRecapModal: React.FC<MonthlyRecapModalProps> = ({
  isOpen,
  onClose,
  month,
  year
}) => {
  const { insights, loading, generateMonthlyInsights } = useMonthlyAnalytics();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateMonthlyInsights(month, year);
      setCurrentSlide(0);
    }
  }, [isOpen, month, year]);

  useEffect(() => {
    if (!autoPlay || !insights) return;

    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        const totalSlides = 8;
        return prev >= totalSlides - 1 ? 0 : prev + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [autoPlay, insights]);

  if (!insights && !loading) {
    return null;
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md h-[600px] p-0 bg-card border-2 border-border shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.15)]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <TrendingUp className="h-8 w-8 text-primary animate-bounce" />
              </div>
              <h3 className="text-foreground text-lg font-semibold mb-2">Creating Your MonArk Moments</h3>
              <p className="text-muted-foreground text-sm">Analyzing your journey...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!insights) return null;

  const slides = [
    { id: 'welcome', title: `Your ${insights.month} Journey`, content: <WelcomeSlide insights={insights} /> },
    { id: 'connections', title: 'Connections Made', content: <ConnectionsSlide insights={insights} /> },
    { id: 'dating', title: 'Dating Adventures', content: <DatingSlide insights={insights} /> },
    { id: 'growth', title: 'Personal Growth', content: <GrowthSlide insights={insights} /> },
    { id: 'energy', title: 'Relationship Energy', content: <EnergySlide insights={insights} /> },
    { id: 'persona', title: 'Your Dating Persona', content: <PersonaSlide insights={insights} /> },
    { id: 'insights', title: 'Key Insights', content: <InsightsSlide insights={insights} /> },
    { id: 'share', title: 'Share Your Journey', content: <ShareSlide insights={insights} /> }
  ];

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] p-0 bg-card border-2 border-border shadow-[0_8px_40px_-4px_hsl(var(--foreground)/0.15)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground text-xs ml-2">
              {currentSlide + 1} of {slides.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setAutoPlay(!autoPlay)}
              variant="ghost"
              size="sm"
              className={`text-xs ${autoPlay ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {autoPlay ? 'Pause' : 'Auto'}
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              <div className="flex">
                {slides.map((slide) => (
                  <div key={slide.id} className="w-full h-full flex-shrink-0 p-6 flex flex-col justify-center" style={{ minWidth: '100%' }}>
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-light text-foreground mb-2">{slide.title}</h2>
                    </div>
                    {slide.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <Button onClick={prevSlide} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" disabled={currentSlide === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button onClick={nextSlide} variant="ghost" size="sm" className="text-primary" disabled={currentSlide === slides.length - 1}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const WelcomeSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="text-center space-y-6">
    <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
      <Calendar className="h-10 w-10 text-primary-foreground" />
    </div>
    <div>
      <h3 className="text-xl text-foreground mb-2">Welcome to Your MonArk Moments</h3>
      <p className="text-muted-foreground text-sm">Here's how you showed up in your dating journey during {insights.month} {insights.year}</p>
    </div>
    <div className="bg-muted/50 rounded-xl p-4">
      <p className="text-primary text-lg font-semibold">{insights.monthHighlight}</p>
    </div>
  </div>
);

const ConnectionsSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-foreground">{insights.chatsInitiated}</div>
        <div className="text-xs text-muted-foreground">Chats Started</div>
      </div>
      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <div className="text-2xl font-bold text-foreground">{insights.totalMessages}</div>
        <div className="text-xs text-muted-foreground">Messages Sent</div>
      </div>
    </div>
    {insights.topConnection && (
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
        <h4 className="text-foreground font-semibold mb-2">Top Connection</h4>
        <p className="text-primary">{insights.topConnection.name}</p>
        <p className="text-muted-foreground text-sm">{insights.topConnection.messageCount} messages exchanged</p>
      </div>
    )}
  </div>
);

const DatingSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-foreground">{insights.datesAttended}</div>
        <div className="text-xs text-muted-foreground">Dates Attended</div>
      </div>
      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
        <div className="text-2xl font-bold text-foreground">{insights.avgDateRating.toFixed(1)}</div>
        <div className="text-xs text-muted-foreground">Avg Date Rating</div>
      </div>
    </div>
    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
      <h4 className="text-foreground font-semibold mb-2">Date Proposals</h4>
      <div className="flex justify-between text-sm">
        <span className="text-foreground/70 font-medium">Sent: {insights.dateProposalsSent}</span>
        <span className="text-foreground/70 font-medium">Received: {insights.dateProposalsReceived}</span>
      </div>
    </div>
  </div>
);

const GrowthSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-foreground">{insights.journalEntriesWritten}</div>
        <div className="text-xs text-muted-foreground">Journal Entries</div>
      </div>
      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
        <div className="text-2xl font-bold text-foreground">{insights.rifReflectionsCompleted}</div>
        <div className="text-xs text-muted-foreground">Reflections</div>
      </div>
    </div>
    {insights.personalGrowthMilestones.length > 0 && (
      <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
        <h4 className="text-foreground font-semibold mb-2">Growth Milestones</h4>
        {insights.personalGrowthMilestones.map((milestone, index) => (
          <div key={index} className="text-sm text-foreground/70 mb-1 font-medium">• {milestone}</div>
        ))}
      </div>
    )}
  </div>
);

const EnergySlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="space-y-6">
    <div className="bg-muted/50 rounded-xl p-4">
      <h4 className="text-foreground font-semibold mb-4">Conversation Energy</h4>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground/70 font-medium">Initiated</span>
            <span className="text-primary font-semibold">{insights.energyMetrics.initiatedVsReceived.initiated}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ 
              width: `${(insights.energyMetrics.initiatedVsReceived.initiated / Math.max(insights.energyMetrics.initiatedVsReceived.initiated + insights.energyMetrics.initiatedVsReceived.received, 1)) * 100}%` 
            }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground/70 font-medium">Responsiveness</span>
            <span className="text-green-600 font-semibold">{Math.round(insights.energyMetrics.responsiveness * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${insights.energyMetrics.responsiveness * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
    {insights.dominantMoods.length > 0 && (
      <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
        <h4 className="text-foreground font-semibold mb-2">Dominant Moods</h4>
        {insights.dominantMoods.slice(0, 3).map((mood, index) => (
          <div key={index} className="text-sm text-foreground/70 mb-1 font-medium">
            {index + 1}. {mood.mood} ({mood.count} times)
          </div>
        ))}
      </div>
    )}
  </div>
);

const PersonaSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="text-center space-y-6">
    <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
      <Heart className="h-10 w-10 text-primary-foreground" />
    </div>
    <div>
      <h3 className="text-xl text-primary mb-2">Your Dating Persona</h3>
      <p className="text-2xl font-light text-foreground">{insights.datingPersona}</p>
    </div>
    <div className="bg-muted/50 rounded-xl p-4">
      <p className="text-foreground/70 text-sm leading-relaxed font-medium">{insights.topLessonLearned}</p>
    </div>
    <div className="flex justify-center">
      <Clock className="h-5 w-5 text-muted-foreground mr-2" />
      <span className="text-muted-foreground text-sm">Most active at {insights.mostActiveHour}:00</span>
    </div>
  </div>
);

const InsightsSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="space-y-6">
    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
      <h4 className="text-primary font-semibold mb-2">Big Lesson Learned</h4>
      <p className="text-foreground text-sm font-medium">{insights.topLessonLearned}</p>
    </div>
    {insights.growthAreas.length > 0 && (
      <div className="bg-muted/50 rounded-xl p-4">
        <h4 className="text-foreground font-semibold mb-2">Areas for Growth</h4>
        {insights.growthAreas.map((area, index) => (
          <div key={index} className="text-sm text-foreground/70 mb-1 font-medium">• {area}</div>
        ))}
      </div>
    )}
    <div className="text-center">
      <div className="text-lg text-foreground mb-2 font-medium">{insights.shareableStats.milestonesReached} milestones reached</div>
      <p className="text-muted-foreground text-sm">Keep building meaningful connections!</p>
    </div>
  </div>
);

const ShareSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="text-center space-y-6">
    <div>
      <h3 className="text-xl text-foreground mb-2">Share Your Growth</h3>
      <p className="text-muted-foreground text-sm">Celebrate your journey with others</p>
    </div>
    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
      <div className="text-lg font-medium text-foreground mb-2">
        "I made {insights.shareableStats.connectionsGrown} new connections and reached {insights.shareableStats.milestonesReached} growth milestones on MonArk this month!"
      </div>
      <div className="text-sm text-primary font-semibold">
        #{insights.datingPersona.replace(/\s+/g, '')} #MonArkMoments
      </div>
    </div>
    <div className="flex space-x-3">
      <Button className="flex-1">
        <Share2 className="h-4 w-4 mr-2" /> Share
      </Button>
      <Button variant="outline" className="flex-1">
        <Download className="h-4 w-4 mr-2" /> Save
      </Button>
    </div>
  </div>
);
