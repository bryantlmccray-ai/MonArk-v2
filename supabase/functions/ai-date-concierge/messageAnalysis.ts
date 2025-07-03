// Message analysis utilities for AI date concierge
export interface MessageAnalysis {
  themes: string[];
  sharedInterests: string[];
  categories: string[];
}

export interface RelationshipProgression {
  stage: string;
  indicators: string[];
  intimacyLevel: string;
}

export interface CommunicationStyles {
  compatibility: string;
  patterns: string;
  engagement: string;
}

// Extract conversation themes and topics
export function extractMessageContext(messages: string[] = []): MessageAnalysis {
  if (!messages || messages.length === 0) {
    return { themes: [], sharedInterests: [], categories: [] };
  }

  const messageText = messages.join(' ').toLowerCase();
  
  // Define topic categories and keywords
  const topicKeywords = {
    hobbies: ['hobby', 'hobbies', 'passion', 'enjoy', 'love doing', 'favorite', 'into', 'really like'],
    travel: ['travel', 'trip', 'vacation', 'visit', 'explore', 'adventure', 'journey', 'abroad', 'country', 'city'],
    food: ['food', 'restaurant', 'cook', 'cooking', 'eat', 'favorite food', 'cuisine', 'dinner', 'lunch', 'coffee'],
    entertainment: ['movie', 'music', 'concert', 'show', 'netflix', 'streaming', 'book', 'reading', 'game', 'gaming'],
    sports: ['sport', 'sports', 'gym', 'workout', 'exercise', 'fitness', 'running', 'swimming', 'hiking', 'yoga'],
    career: ['work', 'job', 'career', 'business', 'project', 'professional', 'company', 'colleague'],
    lifestyle: ['weekend', 'free time', 'relax', 'chill', 'hang out', 'spend time', 'daily', 'routine'],
    values: ['important', 'believe', 'value', 'meaningful', 'care about', 'matter', 'principle']
  };

  // Extract themes and categories
  const detectedCategories = [];
  const themes = [];
  
  for (const [category, keywords] of Object.entries(topicKeywords)) {
    const matchedKeywords = keywords.filter(keyword => messageText.includes(keyword));
    if (matchedKeywords.length > 0) {
      detectedCategories.push(category);
      themes.push(...matchedKeywords.slice(0, 2)); // Limit to top 2 per category
    }
  }

  // Extract potential shared interests mentioned in conversation
  const interestKeywords = [
    'both', 'we both', 'same', 'similar', 'also', 'too', 'as well',
    'agree', 'exactly', 'totally', 'definitely', 'absolutely'
  ];
  
  const sharedInterests = [];
  messages.forEach(message => {
    const lowerMessage = message.toLowerCase();
    if (interestKeywords.some(keyword => lowerMessage.includes(keyword))) {
      // Extract the context around agreement words
      const words = lowerMessage.split(' ');
      for (let i = 0; i < words.length; i++) {
        if (interestKeywords.includes(words[i])) {
          const context = words.slice(Math.max(0, i-3), i+4).join(' ');
          if (context.length > 10) {
            sharedInterests.push(context);
          }
        }
      }
    }
  });

  return {
    themes: [...new Set(themes)],
    sharedInterests: [...new Set(sharedInterests)].slice(0, 5),
    categories: detectedCategories
  };
}

// Analyze relationship progression cues
export function analyzeRelationshipProgression(messages: string[] = []): RelationshipProgression {
  if (!messages || messages.length === 0) {
    return { stage: 'Initial', indicators: [], intimacyLevel: 'Surface' };
  }

  const messageText = messages.join(' ').toLowerCase();
  
  // Progression indicators
  const progressionCues = {
    getting_to_know: ['tell me about', 'what do you', 'how do you', 'where did you', 'when did you', 'getting to know'],
    sharing_personal: ['my family', 'my friends', 'my childhood', 'growing up', 'personal', 'private', 'share'],
    future_oriented: ['someday', 'future', 'plan', 'dream', 'hope', 'want to', 'would love to', 'imagine'],
    emotional_connection: ['feel', 'emotion', 'heart', 'soul', 'deep', 'meaningful', 'connection', 'chemistry'],
    meeting_intent: ['meet', 'in person', 'hang out', 'get together', 'see you', 'date', 'coffee', 'dinner']
  };

  const intimacyMarkers = {
    surface: ['weather', 'work', 'basic', 'general', 'simple'],
    moderate: ['opinion', 'prefer', 'like', 'dislike', 'experience', 'story'],
    deep: ['vulnerable', 'personal', 'private', 'intimate', 'meaningful', 'important', 'value', 'believe']
  };

  // Analyze progression stage
  let stage = 'Initial Contact';
  const indicators = [];
  
  for (const [stageType, keywords] of Object.entries(progressionCues)) {
    const matches = keywords.filter(keyword => messageText.includes(keyword));
    if (matches.length > 0) {
      indicators.push(stageType.replace('_', ' '));
      
      if (stageType === 'meeting_intent') stage = 'Ready to Meet';
      else if (stageType === 'emotional_connection') stage = 'Building Connection';
      else if (stageType === 'future_oriented') stage = 'Future Planning';
      else if (stageType === 'sharing_personal') stage = 'Personal Sharing';
      else if (stageType === 'getting_to_know') stage = 'Discovery Phase';
    }
  }

  // Determine intimacy level
  let intimacyLevel = 'Surface';
  let deepCount = 0;
  let moderateCount = 0;
  
  for (const [level, keywords] of Object.entries(intimacyMarkers)) {
    const matches = keywords.filter(keyword => messageText.includes(keyword));
    if (level === 'deep' && matches.length > 0) deepCount += matches.length;
    if (level === 'moderate' && matches.length > 0) moderateCount += matches.length;
  }

  if (deepCount > 2) intimacyLevel = 'Deep';
  else if (moderateCount > 3 || deepCount > 0) intimacyLevel = 'Moderate';

  return {
    stage,
    indicators,
    intimacyLevel
  };
}

// Analyze communication style compatibility
export function analyzeCommunicationCompatibility(messages: string[] = [], userId1: string, userId2: string): CommunicationStyles {
  if (!messages || messages.length < 4) {
    return { 
      compatibility: 'Insufficient data', 
      patterns: 'Limited conversation history',
      engagement: 'Unknown'
    };
  }

  // Analyze message patterns (simplified - in real implementation would track by user)
  const messageAnalysis = {
    avgLength: messages.reduce((sum, msg) => sum + msg.length, 0) / messages.length,
    questionCount: messages.filter(msg => msg.includes('?')).length,
    exclamationCount: messages.filter(msg => msg.includes('!')).length,
    emojiCount: messages.filter(msg => /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(msg)).length,
  };

  // Determine communication styles
  let compatibility = 'Good match';
  let patterns = 'Balanced exchange';
  let engagement = 'Active';

  if (messageAnalysis.avgLength > 100) {
    patterns = 'Detailed, thoughtful communicators';
  } else if (messageAnalysis.avgLength < 30) {
    patterns = 'Concise, quick exchanges';
  }

  if (messageAnalysis.questionCount > messages.length * 0.3) {
    engagement = 'Highly curious and engaged';
  } else if (messageAnalysis.questionCount < messages.length * 0.1) {
    engagement = 'Statement-based communication';
  }

  if (messageAnalysis.exclamationCount > messages.length * 0.2) {
    compatibility += ' - Enthusiastic styles';
  }

  if (messageAnalysis.emojiCount > messages.length * 0.3) {
    compatibility += ' - Expressive communication';
  }

  return {
    compatibility,
    patterns,
    engagement
  };
}