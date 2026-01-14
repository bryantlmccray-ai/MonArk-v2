import { DatingStyleAnswers } from '@/components/onboarding/DatingStyleQuiz';

/**
 * Maps DatingStyleQuiz answers to RIF dimension scores (0-10 scale)
 * 
 * RIF Dimensions:
 * - intent_clarity: How clear the user is about what they want
 * - pacing_preferences: Preferred speed of relationship progression
 * - emotional_readiness: Current emotional availability
 * - boundary_respect: Communication around boundaries
 * - post_date_alignment: Reflection habits & connection assessment
 */
export interface RIFDimensionScores {
  intent_clarity: number;
  pacing_preferences: number;
  emotional_readiness: number;
  boundary_respect: number;
  post_date_alignment: number;
}

// Score mappings for each answer option
const ATTACHMENT_SCORES: Record<string, { emotional: number; boundary: number; intent: number }> = {
  secure: { emotional: 9, boundary: 8, intent: 8 },
  anxious: { emotional: 6, boundary: 5, intent: 5 },
  avoidant: { emotional: 4, boundary: 7, intent: 6 },
  mixed: { emotional: 5, boundary: 5, intent: 4 },
};

const ENERGY_SCORES: Record<string, { alignment: number }> = {
  introvert: { alignment: 7 },
  extrovert: { alignment: 7 },
  ambivert: { alignment: 8 },
};

const COMMUNICATION_SCORES: Record<string, { boundary: number; pacing: number }> = {
  texter: { boundary: 6, pacing: 7 },
  caller: { boundary: 7, pacing: 6 },
  inperson: { boundary: 8, pacing: 5 },
  balanced: { boundary: 8, pacing: 7 },
};

const PACE_SCORES: Record<string, { pacing: number; boundary: number; intent: number }> = {
  slow: { pacing: 3, boundary: 9, intent: 7 },
  moderate: { pacing: 5, boundary: 7, intent: 6 },
  fast: { pacing: 8, boundary: 5, intent: 8 },
};

const CONFLICT_SCORES: Record<string, { emotional: number; boundary: number }> = {
  direct: { emotional: 8, boundary: 9 },
  process: { emotional: 7, boundary: 7 },
  avoid: { emotional: 4, boundary: 4 },
  compromise: { emotional: 7, boundary: 8 },
};

const LOVE_LANGUAGE_SCORES: Record<string, { alignment: number; emotional: number }> = {
  words: { alignment: 7, emotional: 7 },
  time: { alignment: 8, emotional: 8 },
  gifts: { alignment: 6, emotional: 6 },
  touch: { alignment: 7, emotional: 7 },
  acts: { alignment: 8, emotional: 7 },
};

const SOCIAL_BATTERY_SCORES: Record<string, { pacing: number; alignment: number }> = {
  homebody: { pacing: 3, alignment: 7 },
  balanced: { pacing: 5, alignment: 8 },
  social: { pacing: 7, alignment: 7 },
  very_social: { pacing: 9, alignment: 6 },
};

const DEALBREAKER_SCORES: Record<string, { intent: number; emotional: number }> = {
  honesty: { intent: 9, emotional: 8 },
  humor: { intent: 6, emotional: 7 },
  ambition: { intent: 8, emotional: 6 },
  kindness: { intent: 7, emotional: 9 },
  independence: { intent: 8, emotional: 7 },
};

/**
 * Calculate RIF dimension scores from dating style quiz answers
 */
export function mapQuizAnswersToRIFScores(answers: DatingStyleAnswers): RIFDimensionScores {
  // Initialize score accumulators with weights
  const scores = {
    intent_clarity: { total: 0, weight: 0 },
    pacing_preferences: { total: 0, weight: 0 },
    emotional_readiness: { total: 0, weight: 0 },
    boundary_respect: { total: 0, weight: 0 },
    post_date_alignment: { total: 0, weight: 0 },
  };

  // Attachment Style → emotional_readiness, boundary_respect, intent_clarity
  if (answers.attachmentStyle && ATTACHMENT_SCORES[answers.attachmentStyle]) {
    const attach = ATTACHMENT_SCORES[answers.attachmentStyle];
    scores.emotional_readiness.total += attach.emotional * 1.5; // Higher weight
    scores.emotional_readiness.weight += 1.5;
    scores.boundary_respect.total += attach.boundary;
    scores.boundary_respect.weight += 1;
    scores.intent_clarity.total += attach.intent;
    scores.intent_clarity.weight += 1;
  }

  // Energy Type → post_date_alignment (self-awareness indicator)
  if (answers.energyType && ENERGY_SCORES[answers.energyType]) {
    const energy = ENERGY_SCORES[answers.energyType];
    scores.post_date_alignment.total += energy.alignment;
    scores.post_date_alignment.weight += 1;
  }

  // Date Preferences → post_date_alignment (knowing what you enjoy)
  if (answers.datePreferences && answers.datePreferences.length > 0) {
    // More specific preferences = higher alignment score
    const alignmentBonus = Math.min(answers.datePreferences.length * 2, 8);
    scores.post_date_alignment.total += alignmentBonus;
    scores.post_date_alignment.weight += 1;
  }

  // Availability Windows → pacing_preferences
  if (answers.availabilityWindows && answers.availabilityWindows.length > 0) {
    // More availability = potentially faster pacing
    const pacingFromAvailability = Math.min(answers.availabilityWindows.length * 1.5 + 3, 9);
    scores.pacing_preferences.total += pacingFromAvailability;
    scores.pacing_preferences.weight += 1;
  }

  // Communication Style → boundary_respect, pacing_preferences
  if (answers.communicationStyle && COMMUNICATION_SCORES[answers.communicationStyle]) {
    const comm = COMMUNICATION_SCORES[answers.communicationStyle];
    scores.boundary_respect.total += comm.boundary;
    scores.boundary_respect.weight += 1;
    scores.pacing_preferences.total += comm.pacing;
    scores.pacing_preferences.weight += 1;
  }

  // Pace Preference → pacing_preferences, boundary_respect, intent_clarity (PRIMARY)
  if (answers.pacePreference && PACE_SCORES[answers.pacePreference]) {
    const pace = PACE_SCORES[answers.pacePreference];
    scores.pacing_preferences.total += pace.pacing * 2; // Double weight - primary signal
    scores.pacing_preferences.weight += 2;
    scores.boundary_respect.total += pace.boundary * 1.5;
    scores.boundary_respect.weight += 1.5;
    scores.intent_clarity.total += pace.intent;
    scores.intent_clarity.weight += 1;
  }

  // Conflict Style → emotional_readiness, boundary_respect
  if (answers.conflictStyle && CONFLICT_SCORES[answers.conflictStyle]) {
    const conflict = CONFLICT_SCORES[answers.conflictStyle];
    scores.emotional_readiness.total += conflict.emotional * 1.2;
    scores.emotional_readiness.weight += 1.2;
    scores.boundary_respect.total += conflict.boundary * 1.5; // Higher weight
    scores.boundary_respect.weight += 1.5;
  }

  // Love Language → post_date_alignment, emotional_readiness
  if (answers.loveLanguage && LOVE_LANGUAGE_SCORES[answers.loveLanguage]) {
    const love = LOVE_LANGUAGE_SCORES[answers.loveLanguage];
    scores.post_date_alignment.total += love.alignment * 1.2;
    scores.post_date_alignment.weight += 1.2;
    scores.emotional_readiness.total += love.emotional;
    scores.emotional_readiness.weight += 1;
  }

  // Social Battery → pacing_preferences, post_date_alignment
  if (answers.socialBattery && SOCIAL_BATTERY_SCORES[answers.socialBattery]) {
    const social = SOCIAL_BATTERY_SCORES[answers.socialBattery];
    scores.pacing_preferences.total += social.pacing;
    scores.pacing_preferences.weight += 1;
    scores.post_date_alignment.total += social.alignment;
    scores.post_date_alignment.weight += 1;
  }

  // Deal Breaker → intent_clarity, emotional_readiness (PRIMARY for intent)
  if (answers.dealBreaker && DEALBREAKER_SCORES[answers.dealBreaker]) {
    const deal = DEALBREAKER_SCORES[answers.dealBreaker];
    scores.intent_clarity.total += deal.intent * 2; // Double weight - primary signal
    scores.intent_clarity.weight += 2;
    scores.emotional_readiness.total += deal.emotional;
    scores.emotional_readiness.weight += 1;
  }

  // Calculate weighted averages with fallback defaults
  const calculateScore = (acc: { total: number; weight: number }, defaultScore: number = 5): number => {
    if (acc.weight === 0) return defaultScore;
    const score = acc.total / acc.weight;
    return Math.round(Math.max(0, Math.min(10, score)) * 10) / 10; // Round to 1 decimal
  };

  return {
    intent_clarity: calculateScore(scores.intent_clarity, 5),
    pacing_preferences: calculateScore(scores.pacing_preferences, 5),
    emotional_readiness: calculateScore(scores.emotional_readiness, 5),
    boundary_respect: calculateScore(scores.boundary_respect, 5),
    post_date_alignment: calculateScore(scores.post_date_alignment, 5),
  };
}

/**
 * Get a human-readable summary of RIF scores
 */
export function getRIFSummary(scores: RIFDimensionScores): string[] {
  const insights: string[] = [];

  if (scores.intent_clarity >= 7) {
    insights.push("You have a clear vision of what you're looking for");
  } else if (scores.intent_clarity <= 4) {
    insights.push("You're open to exploring different connection types");
  }

  if (scores.pacing_preferences <= 4) {
    insights.push("You prefer taking things slow and building deep connections");
  } else if (scores.pacing_preferences >= 7) {
    insights.push("You're ready to move forward when the connection feels right");
  }

  if (scores.emotional_readiness >= 7) {
    insights.push("You're emotionally available for meaningful connection");
  }

  if (scores.boundary_respect >= 7) {
    insights.push("You value clear communication and healthy boundaries");
  }

  if (scores.post_date_alignment >= 7) {
    insights.push("You're self-aware about your dating preferences");
  }

  return insights;
}
