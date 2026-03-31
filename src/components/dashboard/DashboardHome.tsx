import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { AuthenticatedNav } from './AuthenticatedNav';

interface DashboardHomeProps {
  onStartRIF: () => void;
  onSignOut: () => void;
  onNavigate?: (section: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onStartRIF, onSignOut, onNavigate }) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { tier } = useSubscription();

  const rifComplete = !!(profile?.rif_quiz_answers && Object.keys(profile.rif_quiz_answers).length > 0);
  const displayName = profile?.bio?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const tierLabel = tier === 'monarch' ? 'The Inner Ark' : tier === 'plus' ? 'The Ark' : 'Free';

  return (
    <div className="min-h-screen bg-[hsl(230_18%_14%)]">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 flex items-center justify-between">
        <MonArkLogo size="sm" />
        <button
          onClick={onSignOut}
          className="text-xs font-caption text-[hsl(240_6%_55%)] tracking-[0.15em] uppercase hover:text-[hsl(30_40%_72%)] transition-colors"
        >
          Sign Out
        </button>
      </header>

      <div className="px-6 pb-12 max-w-2xl mx-auto space-y-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-4"
        >
          <p className="text-xs font-caption text-[hsl(30_40%_72%)] tracking-[0.2em] uppercase mb-1">Welcome back</p>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[hsl(30_40%_85%)]">
            {displayName}
          </h1>
          <p className="font-editorial text-lg text-[hsl(30_40%_72%)] italic mt-1">Date well.</p>
        </motion.div>

        {/* ═══ RIF STATUS CARD ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[hsl(230_18%_18%)] rounded-2xl border border-[hsl(230_18%_26%)] p-6 shadow-[0_4px_24px_rgba(28,31,46,0.3)]"
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              rifComplete ? 'bg-green-500/15' : 'bg-[hsl(30_40%_72%/0.15)]'
            }`}>
              {rifComplete
                ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                : <Sparkles className="w-5 h-5 text-[hsl(30_40%_72%)]" />
              }
            </div>
            <div className="flex-1">
              <h3 className="font-editorial text-lg text-[hsl(30_40%_85%)] mb-1">
                {rifComplete ? 'Your RIF is Complete' : 'Complete Your RIF'}
              </h3>
              <p className="text-sm font-body text-[hsl(240_6%_60%)] leading-relaxed">
                {rifComplete
                  ? "Your Relational Intelligence profile is active. We're using it to curate your matches."
                  : '10 thoughtful questions help us understand how you connect, communicate, and love.'
                }
              </p>
              {!rifComplete && (
                <Button
                  onClick={onStartRIF}
                  className="mt-4 rounded-full bg-[hsl(40_70%_30%)] hover:bg-[hsl(40_70%_35%)] text-white font-body text-xs tracking-[0.12em] uppercase px-6"
                >
                  Take Your RIF <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══ MATCHES CARD ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[hsl(230_18%_18%)] rounded-2xl border border-[hsl(230_18%_26%)] p-6 shadow-[0_4px_24px_rgba(28,31,46,0.3)]"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[hsl(30_40%_72%/0.15)]">
              <Clock className="w-5 h-5 text-[hsl(30_40%_72%)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-editorial text-lg text-[hsl(30_40%_85%)] mb-1">Your 3</h3>
              <p className="text-sm font-body text-[hsl(240_6%_60%)] leading-relaxed mb-4">
                Your 3 matches arrive every Sunday.
              </p>

              {rifComplete ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs font-caption text-[hsl(30_40%_72%)] tracking-[0.15em] uppercase">
                    <span className="w-2 h-2 rounded-full bg-[hsl(30_40%_72%)] animate-pulse" />
                    Next Delivery: Sunday
                  </div>
                  {/* Placeholder match cards */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-[3/4] rounded-xl bg-[hsl(230_18%_22%)] border border-[hsl(230_18%_28%)] flex items-center justify-center"
                      >
                        <span className="text-2xl font-editorial text-[hsl(230_18%_32%)]">{i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[hsl(230_18%_22%)] rounded-xl border border-dashed border-[hsl(230_18%_30%)] p-4 text-center">
                  <p className="text-xs font-body text-[hsl(240_6%_50%)]">
                    Complete your RIF to unlock your first matches
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══ MEMBERSHIP CARD ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[hsl(230_18%_18%)] rounded-2xl border border-[hsl(230_18%_26%)] p-6 shadow-[0_4px_24px_rgba(28,31,46,0.3)]"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[hsl(30_40%_72%/0.15)]">
              <Crown className="w-5 h-5 text-[hsl(30_40%_72%)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-editorial text-lg text-[hsl(30_40%_85%)] mb-1">Membership</h3>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[hsl(30_40%_72%/0.15)] border border-[hsl(30_40%_72%/0.3)] text-[hsl(30_40%_72%)] text-xs font-caption tracking-[0.12em] uppercase">
                  {tierLabel}
                </span>
                {tier === 'free' && (
                  <span className="text-xs font-body text-[hsl(240_6%_50%)]">
                    Upgrade after your first match is confirmed
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs font-caption text-[hsl(240_6%_40%)] tracking-[0.15em] uppercase pt-4"
        >
          The art of intentional dating
        </motion.p>
      </div>
    </div>
  );
};
