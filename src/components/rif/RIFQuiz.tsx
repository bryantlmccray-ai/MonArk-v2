import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft } from 'lucide-react';

const RIF_QUESTIONS = [
  {
    id: 1,
    question: "How do you typically show up in conflict — do you go quiet, speak up immediately, or need time to process?",
    options: ["I go quiet and withdraw", "I speak up immediately", "I need time to process first", "It depends on the situation"],
  },
  {
    id: 2,
    question: "What does emotional safety look like to you in a relationship?",
    options: ["Being able to be vulnerable without judgment", "Knowing my partner won't leave during hard times", "Open, honest communication at all times", "Feeling respected even in disagreement"],
  },
  {
    id: 3,
    question: "Are you looking for something to build slowly, or do you know quickly when someone is right?",
    options: ["I prefer to build slowly and let things unfold", "I usually know quickly", "A mix — I need a few dates to feel it out", "I'm open to either depending on the connection"],
  },
  {
    id: 4,
    question: "How important is shared faith, spirituality, or values in your ideal relationship?",
    options: ["Essential — it's a core part of who I am", "Important but not a dealbreaker", "I'm open to different perspectives", "Not a major factor for me"],
  },
  {
    id: 5,
    question: "How do you prefer to communicate day-to-day — texting, calls, or in person?",
    options: ["Texting throughout the day", "Phone or video calls", "In person whenever possible", "A healthy balance of all three"],
  },
  {
    id: 6,
    question: "What's your love language and how do you most naturally express affection?",
    options: ["Words of affirmation", "Quality time", "Physical touch", "Acts of service", "Gift giving"],
  },
  {
    id: 7,
    question: "Describe your ideal Saturday with a partner.",
    options: ["A quiet morning, coffee, and a walk together", "Exploring somewhere new — a market, hike, or neighborhood", "Cooking together and a movie night in", "Something social — brunch with friends or a live event"],
  },
  {
    id: 8,
    question: "What's something a past relationship taught you about what you actually need?",
    options: ["I need consistent communication", "I need someone who respects my independence", "I need emotional depth and vulnerability", "I need shared goals and ambition"],
  },
  {
    id: 9,
    question: "What are you most intentional about in life right now — career, health, family, faith?",
    options: ["Career and professional growth", "Health and wellness", "Family and relationships", "Faith or spiritual growth", "A balance of all of the above"],
  },
  {
    id: 10,
    question: "What does 'dating well' mean to you?",
    options: ["Being honest about what I want from the start", "Taking my time instead of rushing into things", "Choosing quality connections over quantity", "Growing as a person through the process"],
  },
];

interface RIFQuizProps {
  onComplete: (answers: Record<number, string>) => void;
  onBack: () => void;
}

export const RIFQuiz: React.FC<RIFQuizProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [direction, setDirection] = useState(1);

  const question = RIF_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / RIF_QUESTIONS.length) * 100;
  const isAnswered = answers[question.id] !== undefined;

  const handleSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: option }));
  };

  const handleNext = () => {
    if (currentQuestion < RIF_QUESTIONS.length - 1) {
      setDirection(1);
      setCurrentQuestion(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion(prev => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(230_18%_14%)] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrev} className="text-[hsl(30_40%_72%)] hover:text-[hsl(30_40%_85%)] transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-xs font-caption text-[hsl(240_6%_55%)] tracking-[0.2em] uppercase">
            Question {currentQuestion + 1} of {RIF_QUESTIONS.length}
          </span>
          <div className="w-6" />
        </div>
        <Progress value={progress} className="h-1 bg-[hsl(230_18%_22%)]" />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p className="font-editorial text-xl sm:text-2xl text-[hsl(30_40%_85%)] leading-relaxed mb-10 italic">
              "{question.question}"
            </p>

            <div className="flex flex-col gap-3">
              {question.options.map((option) => {
                const selected = answers[question.id] === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`
                      text-left px-5 py-4 rounded-xl border transition-all duration-200 font-body text-sm leading-relaxed
                      ${selected
                        ? 'bg-[hsl(30_40%_72%/0.15)] border-[hsl(30_40%_72%)] text-[hsl(30_40%_85%)]'
                        : 'bg-[hsl(230_18%_18%)] border-[hsl(230_18%_28%)] text-[hsl(240_6%_70%)] hover:border-[hsl(30_40%_72%/0.4)] hover:text-[hsl(30_40%_80%)]'
                      }
                    `}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 pt-4 max-w-2xl mx-auto w-full">
        <Button
          onClick={handleNext}
          disabled={!isAnswered}
          className="w-full py-6 rounded-full bg-[hsl(40_70%_30%)] hover:bg-[hsl(40_70%_35%)] text-white font-body text-sm tracking-[0.12em] uppercase disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {currentQuestion === RIF_QUESTIONS.length - 1 ? 'Complete Your RIF' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
