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

  // Load insights when modal opens
  useEffect(() => {
    if (isOpen) {
      generateMonthlyInsights(month, year);
      setCurrentSlide(0);
    }
  }, [isOpen, month, year]);

  // Auto-play functionality
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
        <DialogContent className="max-w-md h-[600px] p-0 bg-gradient-to-br from-jet-black via-charcoal-gray to-jet-black border-goldenrod/30">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-goldenrod/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <TrendingUp className="h-8 w-8 text-goldenrod animate-bounce" />
              </div>
              <h3 className="text-white text-lg font-medium mb-2">Creating Your MonArk Moments</h3>
              <p className="text-gray-400 text-sm">Analyzing your journey...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!insights) return null;

  const slides = [
    {
      id: 'welcome',
      title: `Your ${insights.month} Journey`,
      content: <WelcomeSlide insights={insights} />
    },
    {
      id: 'connections',
      title: 'Connections Made',
      content: <ConnectionsSlide insights={insights} />
    },
    {
      id: 'dating',
      title: 'Dating Adventures',
      content: <DatingSlide insights={insights} />
    },
    {
      id: 'growth',
      title: 'Personal Growth',
      content: <GrowthSlide insights={insights} />
    },
    {
      id: 'energy',
      title: 'Relationship Energy',
      content: <EnergySlide insights={insights} />
    },
    {
      id: 'persona',
      title: 'Your Dating Persona',
      content: <PersonaSlide insights={insights} />
    },
    {
      id: 'insights',
      title: 'Key Insights',
      content: <InsightsSlide insights={insights} />
    },
    {
      id: 'share',
      title: 'Share Your Journey',
      content: <ShareSlide insights={insights} />
    }
  ];

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] p-0 bg-gradient-to-br from-jet-black via-charcoal-gray to-jet-black border-goldenrod/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-goldenrod' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-400 text-xs ml-2">
              {currentSlide + 1} of {slides.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setAutoPlay(!autoPlay)}
              variant="ghost"
              size="sm"
              className={`text-xs ${autoPlay ? 'text-goldenrod' : 'text-gray-400'}`}
            >
              {autoPlay ? 'Pause' : 'Auto'}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-full h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              <div className="flex">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className="w-full h-full flex-shrink-0 p-6 flex flex-col justify-center"
                    style={{ minWidth: '100%' }}
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-light text-white mb-2">
                        {slide.title}
                      </h2>
                    </div>
                    {slide.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <Button
            onClick={prevSlide}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <Button
            onClick={nextSlide}
            variant="ghost"
            size="sm" 
            className="text-goldenrod hover:text-goldenrod/90"
            disabled={currentSlide === slides.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Individual slide components
const WelcomeSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="text-center space-y-6">
    <div className="w-20 h-20 bg-gradient-to-br from-goldenrod to-orange-500 rounded-full flex items-center justify-center mx-auto">
      <Calendar className="h-10 w-10 text-white" />
    </div>
    <div>
      <h3 className="text-xl text-white mb-2">Welcome to Your MonArk Moments</h3>
      <p className="text-gray-400 text-sm">
        Here's how you showed up in your dating journey during {insights.month} {insights.year}
      </p>
    </div>
    <div className="bg-charcoal-gray/50 rounded-lg p-4">
      <p className="text-goldenrod text-lg font-medium">{insights.monthHighlight}</p>
    </div>
  </div>
);

const ConnectionsSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-charcoal-gray/50 rounded-lg p-4 text-center">
        <MessageCircle className="h-8 w-8 text-blue-400 mx-auto mb-2" />
        <div className="text-2xl font-bold text-white">{insights.chatsInitiated}</div>
        <div className="text-xs text-gray-400">Chats Started</div>
      </div>
      <div className="bg-charcoal-gray/50 rounded-lg p-4 text-center">
        <Heart className="h-8 w-8 text-red-400 mx-auto mb-2" />
        <div className="text-2xl font-bold text-white">{insights.totalMessages}</div>
        <div className="text-xs text-gray-400">Messages Sent</div>
      </div>
    </div>
    
    {insights.topConnection && (
      <div className="bg-gradient-to-r from-goldenrod/10 to-purple-600/10 rounded-lg p-4 border border-goldenrod/30">
        <h4 className="text-white font-medium mb-2">Top Connection</h4>
        <p className="text-goldenrod">{insights.topConnection.name}</p>
        <p className="text-gray-400 text-sm">{insights.topConnection.messageCount} messages exchanged</p>
      </div>
    )}
  </div>
);

const DatingSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-charcoal-gray/50 rounded-lg p-4 text-center">
        <Calendar className="h-8 w-8 text-green-400 mx-auto mb-2" />
        <div className="text-2xl font-bold text-white">{insights.datesAttended}</div>
        <div className="text-xs text-gray-400">Dates Attended</div>
      </div>
      <div className="bg-charcoal-gray/50 rounded-lg p-4 text-center">
        <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
        <div className="text-2xl font-bold text-white">{insights.avgDateRating.toFixed(1)}</div>
        <div className="text-xs text-gray-400">Avg Date Rating</div>
      </div>
    </div>
    
    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/30">
      <h4 className="text-white font-medium mb-2">Date Proposals</h4>
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">Sent: {insights.dateProposalsSent}</span>
        <span className="text-gray-300">Received: {insights.dateProposalsReceived}</span>
      </div>
    </div>
  </div>
);

const GrowthSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-charcoal-gray/50 rounded-lg p-4 text-center">
        <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
        <div className="text-2xl font-bold text-white">{insights.journalEntriesWritten}</div>
        <div className="text-xs text-gray-400">Journal Entries</div>
      </div>
      <div className="bg-charcoal-gray/50 rounded-lg p-4 text-center">
        <Zap className="h-8 w-8 text-goldenrod mx-auto mb-2" />
        <div className="text-2xl font-bold text-white">{insights.rifReflectionsCompleted}</div>
        <div className="text-xs text-gray-400">Reflections</div>
      </div>
    </div>

    {insights.personalGrowthMilestones.length > 0 && (
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30">
        <h4 className="text-white font-medium mb-2">Growth Milestones</h4>
        {insights.personalGrowthMilestones.map((milestone, index) => (
          <div key={index} className="text-sm text-gray-300 mb-1">• {milestone}</div>
        ))}
      </div>
    )}
  </div>
);

const EnergySlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="space-y-6">
    <div className="bg-charcoal-gray/50 rounded-lg p-4">
      <h4 className="text-white font-medium mb-4">Conversation Energy</h4>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Initiated</span>
            <span className="text-goldenrod">{insights.energyMetrics.initiatedVsReceived.initiated}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-goldenrod h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${(insights.energyMetrics.initiatedVsReceived.initiated / 
                  Math.max(insights.energyMetrics.initiatedVsReceived.initiated + insights.energyMetrics.initiatedVsReceived.received, 1)) * 100}%` 
              }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Responsiveness</span>
            <span className="text-green-400">{Math.round(insights.energyMetrics.responsiveness * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${insights.energyMetrics.responsiveness * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>

    {insights.dominantMoods.length > 0 && (
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/30">
        <h4 className="text-white font-medium mb-2">Dominant Moods</h4>
        {insights.dominantMoods.slice(0, 3).map((mood, index) => (
          <div key={index} className="text-sm text-gray-300 mb-1">
            {index + 1}. {mood.mood} ({mood.count} times)
          </div>
        ))}
      </div>
    )}
  </div>
);

const PersonaSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="text-center space-y-6">
    <div className="w-20 h-20 bg-gradient-to-br from-goldenrod to-purple-600 rounded-full flex items-center justify-center mx-auto">
      <Heart className="h-10 w-10 text-white" />
    </div>
    
    <div>
      <h3 className="text-xl text-goldenrod mb-2">Your Dating Persona</h3>
      <p className="text-2xl font-light text-white">{insights.datingPersona}</p>
    </div>

    <div className="bg-charcoal-gray/50 rounded-lg p-4">
      <p className="text-gray-300 text-sm leading-relaxed">
        {insights.topLessonLearned}
      </p>
    </div>

    <div className="flex justify-center">
      <Clock className="h-5 w-5 text-gray-400 mr-2" />
      <span className="text-gray-400 text-sm">
        Most active at {insights.mostActiveHour}:00
      </span>
    </div>
  </div>
);

const InsightsSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-goldenrod/10 to-orange-500/10 rounded-lg p-4 border border-goldenrod/30">
      <h4 className="text-goldenrod font-medium mb-2">Big Lesson Learned</h4>
      <p className="text-white text-sm">{insights.topLessonLearned}</p>
    </div>

    {insights.growthAreas.length > 0 && (
      <div className="bg-charcoal-gray/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Areas for Growth</h4>
        {insights.growthAreas.map((area, index) => (
          <div key={index} className="text-sm text-gray-300 mb-1">• {area}</div>
        ))}
      </div>
    )}

    <div className="text-center">
      <div className="text-lg text-white mb-2">
        {insights.shareableStats.milestonesReached} milestones reached
      </div>
      <p className="text-gray-400 text-sm">
        Keep building meaningful connections!
      </p>
    </div>
  </div>
);

const ShareSlide: React.FC<{ insights: MonthlyInsights }> = ({ insights }) => (
  <div className="text-center space-y-6">
    <div>
      <h3 className="text-xl text-white mb-2">Share Your Growth</h3>
      <p className="text-gray-400 text-sm">
        Celebrate your journey with others
      </p>
    </div>

    <div className="bg-gradient-to-br from-goldenrod/20 to-purple-600/20 rounded-lg p-4 border border-goldenrod/30">
      <div className="text-lg font-medium text-white mb-2">
        "I made {insights.shareableStats.connectionsGrown} new connections and reached {insights.shareableStats.milestonesReached} growth milestones on MonArk this month! 🌟"
      </div>
      <div className="text-sm text-goldenrod">
        #{insights.datingPersona.replace(/\s+/g, '')} #MonArkMoments
      </div>
    </div>

    <div className="flex space-x-3">
      <Button 
        className="flex-1 bg-goldenrod hover:bg-goldenrod/90 text-jet-black"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button 
        variant="outline"
        className="flex-1 border-gray-600 text-gray-300"
      >
        <Download className="h-4 w-4 mr-2" />
        Save
      </Button>
    </div>
  </div>
);