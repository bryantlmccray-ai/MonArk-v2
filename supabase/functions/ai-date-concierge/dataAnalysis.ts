// Data analysis utilities for AI date concierge
export interface JournalAnalysis {
  insights: string;
  highRatedActivities?: any[];
  topTags?: string[];
  avgRating?: number;
}

export interface RIFCompatibility {
  pacing_alignment: number;
  emotional_alignment: number;
  boundary_alignment: number;
  intent_alignment: number;
  overall: number;
}

// Analyze journal preferences
export function analyzeJournalPreferences(userEntries: any[], currentUserEntries: any[]): JournalAnalysis {
  const allEntries = [...(userEntries || []), ...(currentUserEntries || [])];
  
  if (allEntries.length === 0) {
    return { insights: 'No previous date history available - will suggest popular, well-rounded activities' };
  }

  const highRatedActivities = allEntries.filter(entry => entry.rating >= 4);
  const wouldRepeatActivities = allEntries.filter(entry => entry.would_repeat === true);
  const commonTags = allEntries.flatMap(entry => entry.tags || []);
  const tagCounts = commonTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});

  const topTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  const insights = [
    highRatedActivities.length > 0 ? `Highly rated activities: ${highRatedActivities.map(a => a.date_activity).join(', ')}` : '',
    wouldRepeatActivities.length > 0 ? `Activities they'd repeat: ${wouldRepeatActivities.map(a => a.date_activity).join(', ')}` : '',
    topTags.length > 0 ? `Preferred themes: ${topTags.join(', ')}` : '',
    allEntries.some(e => e.learned_insights) ? 'User values learning and growth from date experiences' : ''
  ].filter(Boolean).join('. ');

  return {
    insights: insights || 'User has date experience but no clear patterns - suggest variety',
    highRatedActivities,
    topTags,
    avgRating: allEntries.filter(e => e.rating).reduce((sum, e) => sum + e.rating, 0) / allEntries.filter(e => e.rating).length || 0
  };
}

// Calculate RIF compatibility
export function calculateRIFCompatibility(userProfile: any, matchProfile: any): RIFCompatibility | null {
  if (!userProfile || !matchProfile) return null;

  const compatibility = {
    pacing_alignment: 1 - Math.abs(userProfile.pacing_preferences - matchProfile.pacing_preferences) / 10,
    emotional_alignment: 1 - Math.abs(userProfile.emotional_readiness - matchProfile.emotional_readiness) / 10,
    boundary_alignment: 1 - Math.abs(userProfile.boundary_respect - matchProfile.boundary_respect) / 10,
    intent_alignment: 1 - Math.abs(userProfile.intent_clarity - matchProfile.intent_clarity) / 10
  };

  compatibility.overall = (
    compatibility.pacing_alignment + 
    compatibility.emotional_alignment + 
    compatibility.boundary_alignment + 
    compatibility.intent_alignment
  ) / 4;

  return compatibility;
}

// Get current seasonal context
export function getCurrentSeasonalContext(): string {
  const now = new Date();
  const month = now.getMonth();
  const hour = now.getHours();
  
  let season = '';
  if (month >= 2 && month <= 4) season = 'Spring';
  else if (month >= 5 && month <= 7) season = 'Summer';
  else if (month >= 8 && month <= 10) season = 'Fall';
  else season = 'Winter';

  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  
  const seasonalSuggestions = {
    Spring: 'Perfect for outdoor activities, blooming gardens, farmers markets, and fresh air dates',
    Summer: 'Great for beach activities, outdoor concerts, picnics, hiking, and longer daylight hours',
    Fall: 'Ideal for cozy indoor activities, apple picking, fall foliage walks, and warm beverages',
    Winter: 'Perfect for indoor cultural activities, ice skating, holiday markets, and cozy fireside chats'
  };

  return `Current season: ${season} (${timeOfDay}). ${seasonalSuggestions[season]}. Consider current weather patterns and daylight hours.`;
}