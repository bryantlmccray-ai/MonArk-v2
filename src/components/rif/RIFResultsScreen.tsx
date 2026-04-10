import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, ArrowRight, RefreshCw, Heart, Shield, Clock, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

// RIF dimension scores type (mirrors rifScoreMapping.ts)
interface RIFDimensionScores {
    intent_clarity: number;
    pacing_preferences: number;
    emotional_readiness: number;
    boundary_respect: number;
    post_date_alignment: number;
}

// Score RIF quiz answers (Record<number, string>) into dimension scores
function scoreRIFAnswers(answers: Record<number, string>): RIFDimensionScores {
    const scores: RIFDimensionScores = {
          intent_clarity: 5,
          pacing_preferences: 5,
          emotional_readiness: 5,
          boundary_respect: 5,
          post_date_alignment: 5,
    };

  // Q1: conflict style -> emotional_readiness + boundary_respect
  const q1 = answers[1];
    if (q1 === 'I speak up immediately') { scores.emotional_readiness += 2; scores.boundary_respect += 2; }
    else if (q1 === 'I need time to process first') { scores.emotional_readiness += 1; scores.boundary_respect += 1; }
    else if (q1 === 'I go quiet and withdraw') { scores.emotional_readiness -= 1; scores.boundary_respect -= 1; }
    else if (q1 === 'It depends on the situation') { scores.emotional_readiness += 1; scores.post_date_alignment += 1; }

  // Q2: emotional safety -> emotional_readiness + boundary_respect
  const q2 = answers[2];
    if (q2 === 'Being able to be vulnerable without judgment') { scores.emotional_readiness += 2; }
    else if (q2 === "Knowing my partner won't leave during hard times") { scores.emotional_readiness += 1; scores.boundary_respect += 1; }
    else if (q2 === 'Open, honest communication at all times') { scores.boundary_respect += 2; scores.intent_clarity += 1; }
    else if (q2 === 'Feeling respected even in disagreement') { scores.boundary_respect += 2; }

  // Q3: pacing -> pacing_preferences + intent_clarity
  const q3 = answers[3];
    if (q3 === 'I prefer to build slowly and let things unfold') { scores.pacing_preferences -= 2; scores.boundary_respect += 1; }
    else if (q3 === 'I usually know quickly') { scores.pacing_preferences += 2; scores.intent_clarity += 2; }
    else if (q3 === 'A mix — I need a few dates to feel it out') { scores.pacing_preferences += 0; scores.post_date_alignment += 1; }
    else if (q3 === "I'm open to either depending on the connection") { scores.post_date_alignment += 2; }

  // Q4: values/faith -> intent_clarity
  const q4 = answers[4];
    if (q4 === "Essential — it's a core part of who I am") { scores.intent_clarity += 2; }
    else if (q4 === 'Important but not a dealbreaker') { scores.intent_clarity += 1; }
    else if (q4 === "I'm open to different perspectives") { scores.intent_clarity += 0; }
    else if (q4 === 'Not a major factor for me') { scores.intent_clarity -= 1; }

  // Q5: communication style -> boundary_respect + pacing
  const q5 = answers[5];
    if (q5 === 'A healthy balance of all three') { scores.boundary_respect += 2; scores.pacing_preferences += 1; }
    else if (q5 === 'In person whenever possible') { scores.boundary_respect += 1; scores.pacing_preferences -= 1; }
    else if (q5 === 'Phone or video calls') { scores.boundary_respect += 1; }
    else if (q5 === 'Texting throughout the day') { scores.pacing_preferences += 1; }

  // Q6: love language -> emotional_readiness + post_date_alignment
  const q6 = answers[6];
    if (q6 === 'Quality time') { scores.emotional_readiness += 2; scores.post_date_alignment += 1; }
    else if (q6 === 'Words of affirmation') { scores.emotional_readiness += 1; scores.intent_clarity += 1; }
    else if (q6 === 'Acts of service') { scores.post_date_alignment += 2; }
    else if (q6 === 'Physical touch') { scores.emotional_readiness += 1; }
    else if (q6 === 'Gift giving') { scores.post_date_alignment += 1; }

  // Q7: ideal Saturday -> pacing + post_date_alignment
  const q7 = answers[7];
    if (q7 === 'A quiet morning, coffee, and a walk together') { scores.pacing_preferences -= 1; scores.post_date_alignment += 1; }
    else if (q7 === 'Exploring somewhere new — a market, hike, or neighborhood') { scores.pacing_preferences += 1; scores.emotional_readiness += 1; }
    else if (q7 === 'Cooking together and a movie night in') { scores.pacing_preferences -= 1; scores.boundary_respect += 1; }
    else if (q7 === 'Something social — brunch with friends or a live event') { scores.pacing_preferences += 2; }

  // Q8: past relationship lesson -> boundary_respect + emotional_readiness
  const q8 = answers[8];
    if (q8 === 'I need consistent communication') { scores.boundary_respect += 2; scores.intent_clarity += 1; }
    else if (q8 === 'I need someone who respects my independence') { scores.boundary_respect += 2; scores.pacing_preferences -= 1; }
    else if (q8 === 'I need emotional depth and vulnerability') { scores.emotional_readiness += 2; }
    else if (q8 === 'I need shared goals and ambition') { scores.intent_clarity += 2; }

  // Q9: life intentionality -> intent_clarity + post_date_alignment
  const q9 = answers[9];
    if (q9 === 'Career and professional growth') { scores.intent_clarity += 2; }
    else if (q9 === 'Family and relationships') { scores.emotional_readiness += 2; scores.intent_clarity += 1; }
    else if (q9 === 'Faith or spiritual growth') { scores.intent_clarity += 1; scores.post_date_alignment += 1; }
    else if (q9 === 'Health and wellness') { scores.post_date_alignment += 1; }
    else if (q9 === 'A balance of all of the above') { scores.post_date_alignment += 2; scores.intent_clarity += 1; }

  // Q10: what does dating well mean -> intent_clarity + pacing
  const q10 = answers[10];
    if (q10 === 'Being honest about what I want from the start') { scores.intent_clarity += 2; scores.boundary_respect += 1; }
    else if (q10 === 'Taking my time instead of rushing into things') { scores.pacing_preferences -= 2; scores.boundary_respect += 1; }
    else if (q10 === 'Choosing quality connections over quantity') { scores.intent_clarity += 1; scores.emotional_readiness += 1; }
    else if (q10 === 'Growing as a person through the process') { scores.post_date_alignment += 2; }

  // Clamp all scores to 0-10
  const clamp = (n: number) => Math.max(0, Math.min(10, n));
    return {
          intent_clarity: clamp(scores.intent_clarity),
          pacing_preferences: clamp(scores.pacing_preferences),
          emotional_readiness: clamp(scores.emotional_readiness),
          boundary_respect: clamp(scores.boundary_respect),
          post_date_alignment: clamp(scores.post_date_alignment),
    };
}

// Archetype logic
function getArchetype(scores: RIFDimensionScores) {
    const avg = (scores.intent_clarity + scores.emotional_readiness + scores.pacing_preferences + scores.boundary_respect + scores.post_date_alignment) / 5;

  if (avg >= 7.5) return {
        name: 'The Intentional Partner',
        description: "You know what you want, you show up fully, and you're ready to build something real.",
        compatibility: "You pair best with someone equally ready — emotionally available, clear on what they want, and not afraid of depth. Avoid situationships or emotionally unavailable partners.",
        narrative: "You bring clarity, presence, and emotional maturity to every connection. Partners feel safe with you because you mean what you say and say what you mean. You're not here to waste time — and the right person will love that about you.",
  };
    if (avg >= 6 && scores.emotional_readiness >= 7 && scores.pacing_preferences < 6) return {
          name: 'The Hopeful Romantic',
          description: "Your heart is wide open and you lead with feeling.",
          compatibility: "You thrive with a grounded, patient partner who matches your warmth without rushing. Someone who can hold space for your feelings without being overwhelmed.",
          narrative: "You experience love deeply and aren't afraid to feel. Your warmth draws people in naturally. As you learn to let things build at the right pace, your connections become richer and more lasting.",
    };
    if (avg >= 6 && scores.pacing_preferences <= 5 && scores.boundary_respect >= 6) return {
          name: 'The Steady Builder',
          description: "You're grounded, dependable, and take relationships seriously.",
          compatibility: "You need a partner who respects your pace and doesn't confuse slowness with disinterest. Look for consistency, not intensity.",
          narrative: "You build trust slowly and deliberately — and that's your superpower. The connections you form are durable because they're built on a real foundation. You're not here for fireworks; you're here for something that lasts.",
    };
    if (avg >= 4 && (scores.boundary_respect < 6 || scores.emotional_readiness < 5)) return {
          name: 'The Guarded Opener',
          description: "You want connection but protect yourself carefully.",
          compatibility: "You need a safe, patient partner who earns trust over time and never makes you feel judged for your walls. Avoid love-bombers.",
          narrative: "You've learned to protect your heart — and for good reason. But the walls that kept you safe may also be keeping love at arm's length. The right person will make opening up feel worth every bit of risk.",
    };
    if (scores.post_date_alignment >= 7) return {
          name: 'The Self-Aware Seeker',
          description: "You understand yourself deeply but are still figuring out what you need.",
          compatibility: "Your ideal partner is emotionally intelligent and curious — someone who loves depth and isn't intimidated by your self-reflection.",
          narrative: "Your self-knowledge is rare and valuable. You're the kind of person who does the inner work — and that makes you a deeply rewarding partner for someone ready to meet you there.",
    };
    return {
          name: 'The Open Explorer',
          description: "You're in discovery mode — open to all possibilities.",
          compatibility: "Keep an open mind. You're best matched with someone adventurous and low-pressure who enjoys discovery as much as you do.",
          narrative: "You're still writing your love story — and that's a beautiful place to be. Every connection teaches you something new about what you want. Stay curious, stay open, and the right person will find their way to you.",
    };
}

const DIMENSION_CONFIG = [
  {
        key: 'intent_clarity' as keyof RIFDimensionScores, label: 'Intent Clarity', Icon: Brain,
        barColor: 'bg-[hsl(30_40%_55%)]', textColor: 'text-[hsl(30_40%_72%)]',
        high: "You're clear on what you want — that confidence is magnetic.",
        mid: "You have a sense of direction, but some areas are still coming into focus.",
        low: "You're still exploring what you truly want — and that's okay.",
  },
  {
        key: 'emotional_readiness' as keyof RIFDimensionScores, label: 'Emotional Readiness', Icon: Heart,
        barColor: 'bg-rose-500', textColor: 'text-rose-400',
        high: "You're emotionally available and ready to go deep.",
        mid: "You're warming up — a little more healing and you'll be fully open.",
        low: "Protecting your heart is valid. The right connection will feel safe.",
  },
  {
        key: 'pacing_preferences' as keyof RIFDimensionScores, label: 'Pacing', Icon: Clock,
        barColor: 'bg-amber-500', textColor: 'text-amber-400',
        high: "You let things unfold naturally — no rushing, no chasing.",
        mid: "You balance excitement and patience pretty well.",
        low: "You tend to move fast — channel that energy intentionally.",
  },
  {
        key: 'boundary_respect' as keyof RIFDimensionScores, label: 'Boundary Respect', Icon: Shield,
        barColor: 'bg-emerald-500', textColor: 'text-emerald-400',
        high: "You honour your own limits and others' — a rare quality.",
        mid: "You're building healthier boundaries with each experience.",
        low: "Learning where you end and others begin is a journey worth taking.",
  },
  {
        key: 'post_date_alignment' as keyof RIFDimensionScores, label: 'Self-Awareness', Icon: Eye,
        barColor: 'bg-violet-500', textColor: 'text-violet-400',
        high: "You know yourself well — that's the foundation of every great relationship.",
        mid: "You're developing real insight into your patterns and needs.",
        low: "Self-discovery is part of the process — you're just getting started.",
  },
  ];

function getDimensionInsight(score: number, dim: typeof DIMENSION_CONFIG[0]): string {
    if (score >= 7) return dim.high;
    if (score >= 4) return dim.mid;
    return dim.low;
}

interface RIFResultsScreenProps {
    answers: Record<number, string>;
    onViewProfile: () => void;
    onRetake: () => void;
}

export const RIFResultsScreen: React.FC<RIFResultsScreenProps> = ({ answers, onViewProfile, onRetake }) => {
    const [showDimensions, setShowDimensions] = useState(false);
    const scores = scoreRIFAnswers(answers);
    const archetype = getArchetype(scores);

    useEffect(() => {
          const t = setTimeout(() => setShowDimensions(true), 900);
          return () => clearTimeout(t);
    }, []);

    return (
          <div className="min-h-screen bg-[hsl(230_18%_14%)] flex flex-col items-center overflow-y-auto pb-16">
                <div className="w-full max-w-lg px-5 pt-10 space-y-5">
                
                  {/* Header */}
                        <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="text-center space-y-2"
                                  >
                                  <motion.div
                                                animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
                                                transition={{ repeat: 2, duration: 0.5, delay: 0.4 }}
                                                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(30_40%_72%/0.12)] mb-1"
                                              >
                                              <Sparkles className="w-8 h-8 text-[hsl(30_40%_72%)]" />
                                  </motion.div>motion.div>
                                  <h1 className="text-2xl font-serif text-[hsl(30_40%_85%)] font-bold">Your Relational Profile is ready</h1>h1>
                                  <p className="text-sm text-[hsl(240_6%_55%)]">Here's how you show up in relationships</p>p>
                        </motion.div>motion.div>
                
                  {/* Archetype Card */}
                        <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.35 }}
                                    className="bg-[hsl(230_18%_18%)] border border-[hsl(230_18%_28%)] rounded-2xl p-6 text-center space-y-3"
                                  >
                                  <p className="text-xs uppercase tracking-widest text-[hsl(240_6%_45%)] font-medium">Your Archetype</p>p>
                                  <h2 className="text-xl font-serif text-[hsl(30_40%_72%)] font-bold">{archetype.name}</h2>h2>
                                  <p className="text-sm text-[hsl(240_6%_65%)] leading-relaxed">{archetype.description}</p>p>
                                  <div className="border-t border-[hsl(230_18%_25%)] pt-3">
                                              <p className="text-sm text-[hsl(30_40%_80%)] leading-relaxed italic">"{archetype.narrative}"</p>p>
                                  </div>div>
                        </motion.div>motion.div>
                
                  {/* Dimension Scores */}
                        <AnimatePresence>
                          {showDimensions && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                      <p className="text-xs uppercase tracking-widest text-[hsl(240_6%_45%)] font-medium text-center">Your Dimensions</p>p>
                          {DIMENSION_CONFIG.map((dim, i) => {
                                          const score = scores[dim.key];
                                          const pct = Math.round((score / 10) * 100);
                                          const { Icon } = dim;
                                          return (
                                                              <motion.div
                                                                                    key={dim.key}
                                                                                    initial={{ opacity: 0, x: -20 }}
                                                                                    animate={{ opacity: 1, x: 0 }}
                                                                                    transition={{ delay: i * 0.1 + 0.05 }}
                                                                                    className="bg-[hsl(230_18%_18%)] border border-[hsl(230_18%_28%)] rounded-xl p-4 space-y-2"
                                                                                  >
                                                                                  <div className="flex items-center justify-between">
                                                                                                        <div className="flex items-center gap-2">
                                                                                                                                <Icon className={`w-4 h-4 ${dim.textColor}`} />
                                                                                                                                <span className="text-sm font-medium text-[hsl(30_40%_85%)]">{dim.label}</span>span>
                                                                                                          </div>div>
                                                                                                        <span className={`text-sm font-bold ${dim.textColor}`}>{score}/10</span>span>
                                                                                    </div>div>
                                                                                  <div className="w-full bg-[hsl(230_18%_22%)] rounded-full h-1.5">
                                                                                                        <motion.div
                                                                                                                                  className={`h-1.5 rounded-full ${dim.barColor}`}
                                                                                                                                  initial={{ width: 0 }}
                                                                                                                                  animate={{ width: `${pct}%` }}
                                                                                                                                  transition={{ duration: 0.9, delay: i * 0.1 + 0.15, ease: 'easeOut' }}
                                                                                                                                />
                                                                                    </div>div>
                                                                                  <p className="text-xs text-[hsl(240_6%_55%)]">{getDimensionInsight(score, dim)}</p>p>
                                                              </motion.div>motion.div>
                                                            );
                        })}
                        </motion.div>motion.div>
                      )}
                        </AnimatePresence>AnimatePresence>
                
                  {/* Compatibility */}
                        <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 1.3 }}
                                    className="bg-[hsl(230_18%_18%)] border border-[hsl(230_18%_28%)] rounded-2xl p-5 space-y-2"
                                  >
                                  <div className="flex items-center gap-2">
                                              <Zap className="w-4 h-4 text-amber-400" />
                                              <p className="text-sm font-semibold text-[hsl(30_40%_85%)]">Who you pair best with</p>p>
                                  </div>div>
                                  <p className="text-sm text-[hsl(240_6%_60%)] leading-relaxed">{archetype.compatibility}</p>p>
                        </motion.div>motion.div>
                
                  {/* CTAs */}
                        <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 1.5 }}
                                    className="space-y-3 pt-1"
                                  >
                                  <Button
                                                onClick={onViewProfile}
                                                className="w-full py-6 rounded-full bg-[hsl(40_70%_30%)] hover:bg-[hsl(40_70%_35%)] text-white font-body text-sm tracking-[0.12em] uppercase flex items-center justify-center gap-2 transition-all"
                                              >
                                              View My Full Profile <ArrowRight className="w-4 h-4" />
                                  </Button>Button>
                                  <button
                                                onClick={onRetake}
                                                className="w-full text-sm text-[hsl(240_6%_50%)] flex items-center justify-center gap-1.5 py-2 hover:text-[hsl(240_6%_70%)] transition-colors"
                                              >
                                              <RefreshCw className="w-3.5 h-3.5" /> Retake Quiz
                                  </button>button>
                        </motion.div>motion.div>
                
                </div>div>
          </div>div>
        );
};</div>
