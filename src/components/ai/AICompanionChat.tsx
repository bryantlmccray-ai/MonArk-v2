import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useDateConcierge } from '@/hooks/useDateConcierge';
import { useToast } from '@/hooks/use-toast';

interface AIMessage {
    id: string;
    type: 'insight' | 'suggestion' | 'conversation' | 'celebration';
    content: string;
    timestamp: string;
    data?: any;
    actionable?: boolean;
    action?: {
      label: string;
      type: 'generate_date' | 'view_insights' | 'update_preferences';
    };
}

interface AICompanionChatProps {
    onClose?: () => void;
}

export const AICompanionChat: React.FC<AICompanionChatProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [circuitBreakerOpen, setCircuitBreakerOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { profile } = useProfile();
    const { generateDateProposal, journalEntries } = useDateConcierge();
    const { toast } = useToast();

    const scrollToBottom = () => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
          scrollToBottom();
    }, [messages]);

    useEffect(() => {
          if (user) {
                  generatePersonalizedInsights();
          }
    }, [user]);

    // Add welcome message when chat opens
    useEffect(() => {
          if (messages.length === 0) {
                  const welcomeMessage: AIMessage = {
                            id: `welcome_${Date.now()}`,
                            type: 'conversation',
                            content: `Hi, I'm Ark — your Smart Matching companion. I'm here to help you grow and succeed in your dating journey. I can help you with:

                            • Processing your dating experiences and feelings
                            • Understanding your compatibility and matches
                            • Explaining why certain dates or people were suggested
                            • Giving personalized advice based on your dating style

                            What would you like to talk about? 😊`,
                            timestamp: new Date().toISOString()
                  };
                  setMessages([welcomeMessage]);

            // Add some quick conversation starters after a delay
            setTimeout(() => {
                      const quickStarters: AIMessage = {
                                  id: `starters_${Date.now()}`,
                                  type: 'suggestion',
                                  content: `Here are some things you might want to ask me about:`,
                                  timestamp: new Date().toISOString(),
                                  actionable: true,
                                  action: {
                                                label: 'Try these conversation starters',
                                                type: 'view_insights'
                                  }
                      };
                      setMessages(prev => [...prev, quickStarters]);
            }, 2000);
          }
    }, []);

    const generatePersonalizedInsights = async () => {
          if (!user || !profile) return;
                  try {
            setIsTyping(true);
                          const recentEntries = journalEntries.slice(0, 5);
                                                        const averageRating = recentEntries.length > 0
              ? recentEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / recentEntries.length
                                                                  : 0;

            const { data: rifProfile } = await supabase
                            .from('rif_profiles')
                            .select('*')
              .eq('user_id', user.id)
                            .eq('is_active', true)
                            .maybeSingle();

        const insights = await generateConversationalInsights({
                  recentEntries,
                  averageRating,
              rifProfile,
                  userInterests: profile.interests || [],
              totalDates: journalEntries.length
        });

            for (let i = 0; i < insights.length; i++) {
                      setTimeout(() => {
                                  setMessages(prev => [...prev, insights[i]]);
                      }, i * 2000);
            }
              } catch (error) {
                          console.error('Error generating insights:', error);
                  } finally {
                          setTimeout(() => setIsTyping(false), 1000);
                  }
    };

    const generateConversationalInsights = async (userData: any): Promise<AIMessage[]> => {
          const insights: AIMessage[] = [];
          const now = new Date().toISOString();

          if (userData.recentEntries.length >= 3) {
      const activityTypes = userData.recentEntries.map((e: any) => e.date_activity.toLowerCase());
                  const uniqueActivities = [...new Set(activityTypes)];

            if (uniqueActivities.length === 1) {
                      insights.push({
                                  id: `pattern_${Date.now()}`,
                                  type: 'insight',
                                  content: `Hey! I've noticed something interesting about your dating pattern... You've been gravitating toward ${uniqueActivities[0]} activities. While consistency shows you know what you like, mixing things up could reveal new sides of your personality to potential matches!`,
                                  timestamp: now,
                                  actionable: true,
                                  action: { label: 'Get diverse date ideas', type: 'generate_date' }
                      });
            } else if (userData.averageRating >= 4) {
                      insights.push({
                                  id: `celebration_${Date.now()}`,
                                  type: 'celebration',
                                  content: `Amazing work! Your recent dates have been averaging ${userData.averageRating.toFixed(1)} stars. You're clearly connecting well with people — I'm seeing real growth in how you approach dating!`,
                                  timestamp: now,
                      });
            }
          }

          if (userData.rifProfile) {
                  if (userData.rifProfile.pacing_preferences <= 4) {
                            insights.push({
                                        id: `rif_pacing_${Date.now()}`,
                                        type: 'suggestion',
                                        content: `I know you prefer taking things slow, which is wonderful for building genuine connections. Ready for a personalized date idea? I have the perfect low-pressure suggestion that matches your style...`,
                                        timestamp: now,
                                        actionable: true,
                                        action: { label: 'Show me the idea!', type: 'generate_date' }
                            });
                  } else if (userData.rifProfile.emotional_readiness >= 7) {
                            insights.push({
                                        id: `rif_readiness_${Date.now()}`,
                                        type: 'insight',
                                        content: `Your emotional readiness score is really strong! I can tell you're in a great headspace for meaningful connections. This is the perfect time to be open to deeper conversations and experiences.`,
                                        timestamp: now,
                            });
                  }
          }

          if (userData.totalDates === 1) {
                  insights.push({
                            id: `milestone_first_${Date.now()}`,
                            type: 'celebration',
                            content: `Congratulations on your first journal entry! Taking time to reflect after dates shows real emotional intelligence. This is going to help you grow so much in your dating journey.`,
                            timestamp: now,
                  });
          } else if (userData.totalDates === 10) {
                  insights.push({
                            id: `milestone_ten_${Date.now()}`,
                            type: 'celebration',
                            content: `Wow, 10 dates! You've been putting yourself out there consistently. I'm seeing patterns in what works for you — want me to share what I've learned about your ideal dating style?`,
                            timestamp: now,
                            actionable: true,
                            action: { label: 'Show my insights', type: 'view_insights' }
                  });
          }

          return insights;
    };

    const handleSendMessage = async () => {
          if (!userInput.trim()) return;

          const userMessage: AIMessage = {
                  id: `user_${Date.now()}`,
        type: 'conversation',
                  content: userInput,
                  timestamp: new Date().toISOString()
          };

          setMessages(prev => [...prev, userMessage]);
          setUserInput('');
          setIsTyping(true);

          try {
                  const aiResponseContent = await generateContextualResponse(userInput);
                  const aiResponse: AIMessage = {
                            id: `ai_${Date.now()}`,
                            type: 'conversation',
                            content: aiResponseContent,
                            timestamp: new Date().toISOString()
                  };
                  setMessages(prev => [...prev, aiResponse]);
          } catch (error) {
                  console.error('Error getting response:', error);
                  const fallbackResponse: AIMessage = {
                            id: `ai_${Date.now()}`,
                            type: 'conversation',
                            content: "I'm recharging for a moment — please try again in about 60 seconds and I'll be right back with you.",
                            timestamp: new Date().toISOString()
                  };
                  setMessages(prev => [...prev, fallbackResponse]);
          } finally {
                  setIsTyping(false);
          }
    };

    const generateContextualResponse = async (input: string): Promise<string> => {
          if (!user) return "I'd love to help, but it seems you're not logged in!";

          try {
                  const { data: rifProfile } = await supabase
                    .from('rif_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_active', true)
                    .maybeSingle();

            const userContext = {
                      recentDates: journalEntries.slice(0, 3),
                      rifProfile: rifProfile || null,
                      interests: profile?.interests || [],
                      userMessage: input,
                      totalDates: journalEntries.length,
                      averageRating: journalEntries.length > 0
                        ? journalEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / journalEntries.length
                                  : 0
            };

            const { data, error } = await supabase.functions.invoke('ai-companion-chat', {
                      body: { type: 'chat_response', userContext }
            });

            if (error) throw error;

            if (data?.circuit_breaker === 'open') {
                      setCircuitBreakerOpen(true);
            } else {
                      setCircuitBreakerOpen(false);
            }

            return data?.message || "I'm here to help you with your dating journey! What's on your mind?";
          } catch (error) {
                  console.error('Error generating response:', error);
                  return "I'm having trouble thinking right now, but I'm here for you! Try asking again in a moment, or feel free to share what's on your mind about your dating journey.";
          }
    };

    const handleAction = async (action: AIMessage['action'], messageContent?: string) => {
          if (!action) return;

          switch (action.type) {
            case 'generate_date':
                      toast({ title: "Generating date idea...", description: "Crafting something perfect for you!" });
                      break;
            case 'view_insights':
                      const starterQuestions = [
                                  "How can I improve my dating approach?",
                                  "Why do you think I'm attracted to certain types?",
                                  "What does my dating style say about me?",
                                  "How should I interpret my recent date ratings?",
                                  "What compatibility factors matter most for me?"
                                ];
                      starterQuestions.forEach((question, index) => {
                                  setTimeout(() => {
                                                const starterMessage: AIMessage = {
                                                                id: `starter_${Date.now()}_${index}`,
                                                                type: 'suggestion',
                                                                content: `"${question}"`,
                                                                timestamp: new Date().toISOString(),
                                                                actionable: true,
                                                                action: { label: 'Ask this', type: 'update_preferences' }
                                                };
                                                setMessages(prev => [...prev, starterMessage]);
                                  }, index * 500);
                      });
                      break;
            case 'update_preferences':
                      if (messageContent) {
                                  const question = messageContent.replace('\u201c', '').replace('\u201d', '');
                                  setUserInput(question);
                      }
                      break;
          }
    };

    const getMessageIcon = (type: AIMessage['type']) => {
          switch (type) {
            case 'insight': return <TrendingUp className="h-4 w-4" />;
            case 'celebration': return <Heart className="h-4 w-4" />;
            case 'suggestion': return <Sparkles className="h-4 w-4" />;
            default: return <MessageCircle className="h-4 w-4" />;
          }
    };

    const getMessageColor = (type: AIMessage['type']) => {
          switch (type) {
            case 'insight': return 'border-blue-500/30 bg-blue-500/10';
            case 'celebration': return 'border-pink-500/30 bg-pink-500/10';
            case 'suggestion': return 'border-goldenrod/30 bg-goldenrod/10';
            default: return 'border-gray-700/30 bg-gray-800/30';
          }
    };

    return (
          <div className="fixed bottom-4 right-4 w-80 h-96 bg-charcoal-gray border border-goldenrod/30 rounded-lg shadow-xl flex flex-col z-50">
            {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-goldenrod/20 rounded-full flex items-center justify-center">
                                              <Sparkles className="h-4 w-4 text-goldenrod" />
                                  </div>div>
                                  <div>
                                              <h3 className="text-white font-medium text-sm">Ark — Smart Matching Companion</h3>h3>
                                              <p className="text-gray-400 text-xs">Here to help you grow</p>p>
                                  </div>div>
                        </div>div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                  <X className="h-4 w-4" />
                        </button>button>
                </div>div>
          
            {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                      <div key={message.id} className={`p-3 rounded-lg border ${getMessageColor(message.type)}`}>
                                  <div className="flex items-start space-x-2">
                                                <div className="text-goldenrod mt-1">
                                                  {getMessageIcon(message.type)}
                                                </div>div>
                                                <div className="flex-1">
                                                                <p className="text-white text-sm leading-relaxed">{message.content}</p>p>
                                                  {message.actionable && message.action && (
                                          <Button
                                                                onClick={() => handleAction(message.action, message.content)}
                                                                size="sm"
                                                                className="mt-2 bg-goldenrod hover:bg-goldenrod/90 text-jet-black text-xs"
                                                              >
                                            {message.action.label}
                                          </Button>Button>
                                                                )}
                                                </div>div>
                                  </div>div>
                      </div>div>
                    ))}
                
                  {isTyping && (
                      <div className="flex items-center space-x-2 text-gray-400">
                                  <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-goldenrod/60 rounded-full animate-pulse" />
                                                <div className="w-2 h-2 bg-goldenrod/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                                <div className="w-2 h-2 bg-goldenrod/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                  </div>div>
                                  <span className="text-xs">Ark is thinking...</span>span>
                      </div>div>
                        )}
                        <div ref={messagesEndRef} />
                </div>div>
          
            {circuitBreakerOpen && (
                    <div className="px-3 py-2 bg-amber-500/10 border-t border-amber-500/20 flex items-center gap-2">
                              <span className="text-amber-400 text-xs">&#9889;</span>span>
                              <p className="text-xs text-amber-300/80 leading-tight">Ark is recharging — try again in ~60 seconds.</p>p>
                    </div>div>
                )}
          
            {/* Input */}
                <div className="p-4 border-t border-gray-700">
                        <div className="flex space-x-2">
                                  <Input
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Ask me anything about dating..."
                                                className="flex-1 bg-jet-black/50 border-gray-700 text-white placeholder-gray-400"
                                              />
                                  <Button onClick={handleSendMessage} size="sm" className="bg-goldenrod hover:bg-goldenrod/90 text-jet-black">
                                              <Send className="h-4 w-4" />
                                  </Button>Button>
                        </div>div>
                </div>div>
          </div>div>
        );
};</div>
