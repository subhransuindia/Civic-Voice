import React, { useState, useEffect } from 'react';
import type { MediaItem } from '../types';

const MediaIcon: React.FC<{ type: MediaItem['type'] }> = ({ type }) => {
    const icons = {
        Video: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        ),
        Audio: (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 5.858a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13a3 3 0 11-4.243-4.243 3 3 0 014.243 4.243zm0 0l6.142-6.142" />
            </svg>
        ),
        News: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h3m-3 4h3m-3 4h3m-3 4h3" />
            </svg>
        ),
    };
    return <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">{icons[type]}</div>;
}


const MediaCard: React.FC<{ 
    item: MediaItem;
    onPlayAudio: (text: string) => void;
    onStopAudio: () => void;
    isPlaying: boolean;
}> = ({ item, onPlayAudio, onStopAudio, isPlaying }) => {
    
    const content = (
         <div className="flex items-start space-x-4">
            <MediaIcon type={item.type} />
            <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                <p className="text-gray-500 text-xs mt-1">{item.description}</p>
                 {item.uri && item.type === 'News' && (
                    <p className="text-xs text-indigo-600 truncate mt-1">{item.uri}</p>
                 )}
                 {item.type === 'Audio' && (
                    <div className="mt-2">
                        {!isPlaying ? (
                             <button onClick={() => onPlayAudio(item.description)} className="flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                <span>Play Audio</span>
                            </button>
                        ) : (
                             <button onClick={onStopAudio} className="flex items-center space-x-2 text-sm font-semibold text-red-600 hover:text-red-800">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                               <span>Stop</span>
                            </button>
                        )}
                    </div>
                 )}
            </div>
        </div>
    );

    const baseClasses = "p-4 bg-white border border-gray-200 rounded-lg transition-colors duration-200";
    
    if (item.uri && item.type === 'News') {
        return (
            <a href={item.uri} target="_blank" rel="noopener noreferrer" className={`block hover:bg-gray-50 hover:border-indigo-300 ${baseClasses}`}>
                {content}
            </a>
        );
    }
    
    return <div className={baseClasses}>{content}</div>;
};

export const MediaGallery: React.FC<{ media: MediaItem[] }> = ({ media }) => {
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlayAudio = (text: string, id: number) => {
      window.speechSynthesis.cancel(); // Stop any currently playing audio
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(utterance);
      setPlayingAudioId(id);
  }

  const handleStopAudio = () => {
      window.speechSynthesis.cancel();
      setPlayingAudioId(null);
  }

  if (!media || media.length === 0) {
    return <p className="text-center text-gray-500 py-8">No related media found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {media.map((item, index) => (
        <MediaCard 
            key={index} 
            item={item}
            onPlayAudio={(text) => handlePlayAudio(text, index)}
            onStopAudio={handleStopAudio}
            isPlaying={playingAudioId === index}
        />
      ))}
    </div>
  );
};