import React, { useState } from 'react';
import { Check, ChevronLeft, Sparkles } from 'lucide-react';

interface DatingStyleQuizProps {
  onComplete: (answers: DatingStyleAnswers) => void;
  onSkip?: () => void;
}

export interface DatingStyleAnswers {
  attachmentStyle: string;
  energyType: string;
  datePreferences: string[];
  availabilityWindows: string[];
  communicationStyle: string;
  pacePreference: string;
  conflictStyle: string;
  loveLanguage: string;
  socialBattery: string;
  dealBreaker: string;
}

type QuestionType = 'single' | 'multi';

interface Question {
  id: keyof DatingStyleAnswers;
  type: QuestionType;
  question: string;
  subtitle?: string;
  options: { value: string; label: string; emoji?: string }[];
  maxSelections?: number;
}

const questions: Question[] = [
  {
    id: 'attachmentStyle',
    type: 'single',
    question: 'How do you typically feel in relationships?',
    subtitle: 'This helps us understand your connection style',
    options: [
      { value: 'secure', label: 'Comfortable with closeness & independence', emoji: '🌟' },
      { value: 'anxious', label: 'I value reassurance and closeness', emoji: '💝' },
      { value: 'avoidant', label: 'I need space and independence', emoji: '🦋' },
      { value: 'mixed', label: 'It depends on the person', emoji: '🔄' },
    ],
  },
  {
    id: 'energyType',
    type: 'single',
    question: 'What\'s your social energy like?',
    options: [
      { value: 'introvert', label: 'Introvert - I recharge alone', emoji: '🌙' },
      { value: 'extrovert', label: 'Extrovert - I energize around people', emoji: '☀️' },
      { value: 'ambivert', label: 'Ambivert - A mix of both', emoji: '🌤️' },
    ],
  },
  {
    id: 'datePreferences',
    type: 'multi',
    question: 'What kind of dates excite you?',
    subtitle: 'Select up to 3',
    maxSelections: 3,
    options: [
      { value: 'active', label: 'Active (hiking, sports, dancing)', emoji: '🏃' },
      { value: 'chill', label: 'Chill (coffee, movies, walks)', emoji: '☕' },
      { value: 'cultural', label: 'Cultural (museums, concerts, theater)', emoji: '🎭' },
      { value: 'food', label: 'Food & Drinks (restaurants, bars, cooking)', emoji: '🍽️' },
      { value: 'adventure', label: 'Adventure (travel, new experiences)', emoji: '✈️' },
      { value: 'creative', label: 'Creative (art, music, crafts)', emoji: '🎨' },
    ],
  },
  {
    id: 'availabilityWindows',
    type: 'multi',
    question: 'When are you usually free to date?',
    subtitle: 'Select all that apply',
    options: [
      { value: 'weekday_morning', label: 'Weekday mornings', emoji: '🌅' },
      { value: 'weekday_evening', label: 'Weekday evenings', emoji: '🌆' },
      { value: 'weekend_day', label: 'Weekend days', emoji: '☀️' },
      { value: 'weekend_night', label: 'Weekend nights', emoji: '🌙' },
      { value: 'flexible', label: 'I\'m pretty flexible', emoji: '📅' },
    ],
  },
  {
    id: 'communicationStyle',
    type: 'single',
    question: 'How do you prefer to communicate?',
    options: [
      { value: 'texter', label: 'Frequent texter', emoji: '💬' },
      { value: 'caller', label: 'Phone/video calls', emoji: '📞' },
      { value: 'inperson', label: 'Prefer in-person', emoji: '🤝' },
      { value: 'balanced', label: 'A mix of everything', emoji: '⚖️' },
    ],
  },
  {
    id: 'pacePreference',
    type: 'single',
    question: 'What pace feels right for dating?',
    options: [
      { value: 'slow', label: 'Slow - Let\'s really get to know each other', emoji: '🐢' },
      { value: 'moderate', label: 'Moderate - Go with the flow', emoji: '🌊' },
      { value: 'fast', label: 'Fast - I know what I want', emoji: '⚡' },
    ],
  },
  {
    id: 'conflictStyle',
    type: 'single',
    question: 'How do you handle disagreements?',
    options: [
      { value: 'direct', label: 'Address it directly right away', emoji: '🎯' },
      { value: 'process', label: 'Need time to process first', emoji: '💭' },
      { value: 'avoid', label: 'Prefer to avoid conflict', emoji: '🕊️' },
      { value: 'compromise', label: 'Always looking for compromise', emoji: '🤝' },
    ],
  },
  {
    id: 'loveLanguage',
    type: 'single',
    question: 'How do you feel most loved?',
    options: [
      { value: 'words', label: 'Words of affirmation', emoji: '💌' },
      { value: 'time', label: 'Quality time', emoji: '⏰' },
      { value: 'gifts', label: 'Thoughtful gifts', emoji: '🎁' },
      { value: 'touch', label: 'Physical affection', emoji: '🤗' },
      { value: 'acts', label: 'Acts of service', emoji: '💪' },
    ],
  },
  {
    id: 'socialBattery',
    type: 'single',
    question: 'How often do you like to go out?',
    options: [
      { value: 'homebody', label: 'Mostly stay in (1-2x/month)', emoji: '🏠' },
      { value: 'balanced', label: 'Balance of both (1-2x/week)', emoji: '⚖️' },
      { value: 'social', label: 'Often out (3-4x/week)', emoji: '🎉' },
      { value: 'very_social', label: 'Always on the go', emoji: '🚀' },
    ],
  },
  {
    id: 'dealBreaker',
    type: 'single',
    question: 'What\'s most important to you in a partner?',
    options: [
      { value: 'honesty', label: 'Honesty & transparency', emoji: '💎' },
      { value: 'humor', label: 'Sense of humor', emoji: '😄' },
      { value: 'ambition', label: 'Ambition & drive', emoji: '🎯' },
      { value: 'kindness', label: 'Kindness & empathy', emoji: '💝' },
      { value: 'independence', label: 'Independence & self-awareness', emoji: '🦋' },
    ],
  },
];

export const DatingStyleQuiz: React.FC<DatingStyleQuizProps> = ({ onComplete, onSkip }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<DatingStyleAnswers>>({});

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSingleSelect = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete(newAnswers as DatingStyleAnswers);
      }
    }, 300);
  };

  const handleMultiSelect = (value: string) => {
    const currentSelection = (answers[currentQuestion.id] as string[]) || [];
    const maxSelections = currentQuestion.maxSelections || 10;
    
    let newSelection: string[];
    if (currentSelection.includes(value)) {
      newSelection = currentSelection.filter(v => v !== value);
    } else if (currentSelection.length < maxSelections) {
      newSelection = [...currentSelection, value];
    } else {
      return; // Max selections reached
    }
    
    setAnswers({ ...answers, [currentQuestion.id]: newSelection });
  };

  const handleMultiContinue = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(answers as DatingStyleAnswers);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentSelection = currentQuestion.type === 'multi' 
    ? (answers[currentQuestion.id] as string[]) || []
    : answers[currentQuestion.id];

  const canContinueMulti = currentQuestion.type === 'multi' && 
    Array.isArray(currentSelection) && 
    currentSelection.length > 0;

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full space-y-6">
        {/* Header with back button and skip */}
        <div className="flex items-center justify-between">
          {currentIndex > 0 ? (
            <button
              onClick={handleBack}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">RIF • Relational Intelligence</span>
          </div>
          {onSkip ? (
            <button
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question counter */}
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Question */}
        <div className="text-center space-y-2 pt-4">
          <h1 className="text-xl font-semibold text-foreground">{currentQuestion.question}</h1>
          {currentQuestion.subtitle && (
            <p className="text-muted-foreground text-sm">{currentQuestion.subtitle}</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 pt-4">
          {currentQuestion.options.map((option) => {
            const isSelected = currentQuestion.type === 'multi'
              ? (currentSelection as string[])?.includes(option.value)
              : currentSelection === option.value;

            return (
              <button
                key={option.value}
                onClick={() => currentQuestion.type === 'single' 
                  ? handleSingleSelect(option.value) 
                  : handleMultiSelect(option.value)
                }
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {false && option.emoji && <span className="text-xl">{option.emoji}</span>}
                    <span className="text-foreground font-medium">{option.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue button for multi-select */}
      {currentQuestion.type === 'multi' && (
        <div className="pt-6 max-w-md mx-auto w-full">
          <button
            onClick={handleMultiContinue}
            disabled={!canContinueMulti}
            className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};
