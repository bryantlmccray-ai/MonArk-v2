// Type definitions for AI date concierge
export interface DateProposalRequest {
  matchUserId: string;
  conversationId: string;
  userInterests: string[];
  matchInterests: string[];
  recentMessages?: string[];
  userLocation?: string;
  userProfile?: any;
  matchProfile?: any;
  currentUserId?: string;
}

export interface ProposalData {
  title: string;
  activity: string;
  location_type: string;
  vibe: string;
  time_suggestion: string;
  rationale: string;
  venue_suggestions?: string[];
  compatibility_notes?: string;
  seasonal_advantages?: string;
}

export interface EnrichedProposalData extends ProposalData {
  ai_analysis: {
    common_interests: string[];
    conversation_themes: string[];
    relationship_stage: string;
    rif_compatibility: number | null;
    location_considered: boolean;
    communication_style: string;
  };
  generation_metadata: {
    model: string;
    timestamp: string;
    context_quality: string;
  };
}

export interface AIAnalysisContext {
  rifCompatibility: any;
  journalAnalysis: any;
  messageAnalysis: any;
  conversationProgression: any;
  communicationStyles: any;
  seasonalContext: string;
  commonInterests: string[];
}