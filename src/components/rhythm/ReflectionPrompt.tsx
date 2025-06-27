
import React, { useState } from 'react';
import { PenTool, Send, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { RIFPrompt, RIFReflection } from '@/hooks/useRhythm';

interface ReflectionPromptProps {
  currentPrompt: RIFPrompt | null;
  reflections: RIFReflection[];
  onSaveReflection: (promptId: string | null, promptText: string | null, responseText: string) => Promise<boolean>;
}

export const ReflectionPrompt: React.FC<ReflectionPromptProps> = ({ 
  currentPrompt, 
  reflections, 
  onSaveReflection 
}) => {
  const [responseText, setResponseText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showReflections, setShowReflections] = useState(false);

  const handleSaveReflection = async () => {
    if (!responseText.trim()) return;

    setIsSaving(true);
    const success = await onSaveReflection(
      currentPrompt?.id || null,
      currentPrompt?.prompt_text || null,
      responseText.trim()
    );

    if (success) {
      setResponseText('');
    }
    setIsSaving(false);
  };

  const handleSkip = () => {
    setResponseText('');
    // Could log a skip event here if needed
  };

  return (
    <div className="space-y-4">
      {/* Current Prompt */}
      <div className="bg-charcoal-gray rounded-xl p-6 border border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <PenTool className="h-5 w-5 text-goldenrod" />
          <h3 className="text-white font-medium">Reflection Space</h3>
        </div>

        {currentPrompt ? (
          <div className="space-y-4">
            <div className="p-4 bg-goldenrod/5 border border-goldenrod/20 rounded-lg">
              <p className="text-white text-sm leading-relaxed">
                {currentPrompt.prompt_text}
              </p>
              <span className="inline-block mt-2 px-2 py-1 bg-goldenrod/10 text-goldenrod text-xs rounded-md">
                {currentPrompt.category.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-3">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Take your time to reflect... there's no right or wrong answer."
                className="w-full h-24 bg-jet-black/50 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:border-goldenrod/50 focus:outline-none transition-colors"
              />

              <div className="flex justify-between items-center">
                <button
                  onClick={handleSkip}
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Skip for now
                </button>
                
                <button
                  onClick={handleSaveReflection}
                  disabled={!responseText.trim() || isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-goldenrod-gradient text-jet-black font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-golden-glow transition-all"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            No prompts available right now. Check back later for new reflection opportunities.
          </p>
        )}
      </div>

      {/* Past Reflections */}
      {reflections.length > 0 && (
        <div className="bg-charcoal-gray rounded-xl p-6 border border-gray-800">
          <button
            onClick={() => setShowReflections(!showReflections)}
            className="flex items-center justify-between w-full mb-4"
          >
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-goldenrod" />
              <h3 className="text-white font-medium">Past Reflections</h3>
              <span className="text-gray-400 text-sm">({reflections.length})</span>
            </div>
            {showReflections ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {showReflections && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {reflections.map((reflection) => (
                <div 
                  key={reflection.id}
                  className="p-3 bg-jet-black/30 rounded-lg border border-gray-700/30"
                >
                  {reflection.prompt_text && (
                    <p className="text-gray-400 text-xs mb-2 italic">
                      "{reflection.prompt_text}"
                    </p>
                  )}
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {reflection.response_text}
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(reflection.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
