
import React, { useState } from 'react';

interface RIFQuizProps {
  onNext: () => void;
}

export const RIFQuiz: React.FC<RIFQuizProps> = ({ onNext }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const questions = [
    {
      prompt: "First, are you emotionally available right now?",
      subtext: "It's okay if not. This helps us tailor your experience.",
      options: [
        "Yes, I'm open to connection",
        "I'm focusing on myself right now",
        "I'm not sure yet"
      ]
    },
    {
      prompt: "What pace feels right for you?",
      subtext: "",
      options: [
        "Ready to meet someone soon",
        "Happy to chat for a while",
        "Taking it one day at a time"
      ]
    }
  ];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete
      onNext();
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-jet-black flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="flex flex-col items-center space-y-8 max-w-lg w-full">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-light text-white leading-relaxed">
            {currentQ.prompt}
          </h1>
          {currentQ.subtext && (
            <p className="text-gray-400 text-sm">
              {currentQ.subtext}
            </p>
          )}
        </div>
        
        <div className="w-full space-y-4">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="w-full py-4 px-6 bg-charcoal-gray text-white border border-gray-600 rounded-xl text-left transition-all duration-300 hover:border-goldenrod hover:bg-gray-800 transform hover:scale-105"
            >
              {option}
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2 mt-8">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                index <= currentQuestion ? 'bg-goldenrod' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
