import React, { useState } from 'react';
import type { Flashcard } from '../types';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
}

const FlashcardItem: React.FC<{ card: Flashcard }> = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const cardStyles = {
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    } as const;

    const faceStyles = {
        backfaceVisibility: 'hidden',
    } as const;

    return (
        <div 
            className="w-full h-48 perspective-1000" 
            onClick={() => setIsFlipped(!isFlipped)}
            role="button"
            aria-pressed={isFlipped}
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setIsFlipped(!isFlipped)}
        >
            <div className="relative w-full h-full cursor-pointer" style={cardStyles}>
                {/* Front */}
                <div style={faceStyles} className="absolute w-full h-full p-4 rounded-lg bg-white shadow-md border border-gray-200 flex flex-col justify-center items-center text-center">
                    <p className="text-xs text-indigo-500 font-bold uppercase mb-2">Question</p>
                    <p className="font-semibold text-gray-800">{card.question}</p>
                </div>
                {/* Back */}
                <div style={{ ...faceStyles, transform: 'rotateY(180deg)' }} className="absolute w-full h-full p-4 rounded-lg bg-indigo-50 shadow-md border border-indigo-200 flex flex-col justify-center items-center text-center">
                    <p className="text-xs text-indigo-500 font-bold uppercase mb-2">Answer</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{card.answer}</p>
                </div>
            </div>
        </div>
    );
};

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ flashcards }) => {
  if (!flashcards || flashcards.length === 0) {
    return <p className="text-center text-gray-500 py-8">No flashcards available for this bill.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flashcards.map((card, index) => (
        <FlashcardItem key={index} card={card} />
      ))}
    </div>
  );
};