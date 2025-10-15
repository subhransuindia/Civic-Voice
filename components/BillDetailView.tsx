import React, { useState } from 'react';
import type { Bill, BillAnalysis } from '../types';
import { DiscussionForum } from './DiscussionForum';
import { DebatesView } from './DebatesView';
import { MediaGallery } from './MediaGallery';
import { ViewpointsCard } from './ViewpointsCard';
import { DataVisualizer } from './DataVisualizer';
import { MindMapView } from './MindMapView';
import { FlashcardsView } from './FlashcardsView';


type VoteOption = 'up' | 'down' | 'abstain' | null;

interface BillDetailViewProps {
  bill: Bill;
  analysis: BillAnalysis | null;
  isLoading: boolean;
  error: string | null;
  onVote: (billId: string, newVote: VoteOption, oldVote: VoteOption) => void;
}

type Tab = 'overview' | 'viewpoints' | 'impact' | 'debates' | 'media' | 'discussion';
type OverviewSubTab = 'explanation' | 'mindmap' | 'flashcards';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-700">Analyzing Bill...</p>
        <p className="text-sm text-gray-500">This may take a moment. We're gathering debates, media, and viewpoints for you.</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="p-8 text-center bg-red-50 border-l-4 border-red-400 rounded-r-lg min-h-[400px] flex flex-col justify-center">
        <h3 className="text-lg font-bold text-red-800">An Error Occurred</h3>
        <p className="text-red-700 mt-2">{message}</p>
    </div>
);

const VoteDisplay: React.FC<{ voteCount: Bill['voteCount'] }> = ({ voteCount }) => (
    <div className="flex items-center space-x-6">
        <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{voteCount.for}</p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">For</p>
        </div>
        <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{voteCount.against}</p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Against</p>
        </div>
    </div>
);


const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-sm font-bold rounded-md transition-colors duration-200 whitespace-nowrap ${
            active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
        }`}
    >
        {children}
    </button>
);


export const BillDetailView: React.FC<BillDetailViewProps> = ({ bill, analysis, isLoading, error, onVote }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [activeSubTab, setActiveSubTab] = useState<OverviewSubTab>('explanation');
  const [userVote, setUserVote] = useState<VoteOption>(null);
  
  const handleVoteClick = (newVote: VoteOption) => {
    // Retract vote if clicking the same button again
    const finalVote = userVote === newVote ? null : newVote;
    onVote(bill.id, finalVote, userVote); // pass billId, new vote, and old vote
    setUserVote(finalVote);
  }

  const renderOverviewContent = () => {
    if (!analysis) return null;
    switch(activeSubTab) {
        case 'explanation':
          return (
            <div className="prose max-w-none text-gray-700 leading-relaxed bg-gray-50 p-5 rounded-lg border border-gray-200">
              <p>{analysis.simplifiedExplanation}</p>
            </div>
          );
        case 'mindmap':
            return <MindMapView mindMap={analysis.mindMap} />
        case 'flashcards':
            return <FlashcardsView flashcards={analysis.flashcards} />
        default:
            return null;
    }
  }


  const renderContent = () => {
      if (!analysis) return null;
      switch(activeTab) {
          case 'overview':
            return (
              <div>
                <div className="flex items-center space-x-2 border-b border-gray-200 mb-4">
                  <TabButton active={activeSubTab === 'explanation'} onClick={() => setActiveSubTab('explanation')}>Explanation</TabButton>
                  <TabButton active={activeSubTab === 'mindmap'} onClick={() => setActiveSubTab('mindmap')}>Mind Map</TabButton>
                  <TabButton active={activeSubTab === 'flashcards'} onClick={() => setActiveSubTab('flashcards')}>Flashcards</TabButton>
                </div>
                {renderOverviewContent()}
              </div>
            );
          case 'viewpoints':
              return <ViewpointsCard viewpoints={analysis.viewpoints} />;
          case 'impact':
              return <DataVisualizer data={analysis.impactData} />;
          case 'debates':
              return <DebatesView debate={analysis.parliamentaryDebate} />;
          case 'media':
              return <MediaGallery media={analysis.media} />;
          case 'discussion':
              return <DiscussionForum billTitle={bill.title}/>;
          default:
              return null;
      }
  }


  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-4">
            <div>
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 bg-gray-100 text-gray-700">{bill.category}</span>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{bill.title}</h2>
                <p className="mt-2 text-sm text-gray-600 max-w-prose">{bill.summary}</p>
            </div>
            <VoteDisplay voteCount={bill.voteCount} />
        </div>
        
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border">
            <p className="text-sm font-bold text-gray-700">Your Vote:</p>
             <button
                onClick={() => handleVoteClick('up')}
                className={`p-2 rounded-full transition-colors ${userVote === 'up' ? 'bg-green-100 text-green-600 ring-2 ring-green-500' : 'bg-gray-200 text-gray-500 hover:bg-green-100'}`}
                aria-label="Vote for"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h6.364a1 1 0 00.943-.646l2.363-6.364a1 1 0 00-.943-1.354H13V4.5a1.5 1.5 0 00-3 0v5.833H6z" /></svg>
            </button>
            <button
                onClick={() => handleVoteClick('down')}
                className={`p-2 rounded-full transition-colors ${userVote === 'down' ? 'bg-red-100 text-red-600 ring-2 ring-red-500' : 'bg-gray-200 text-gray-500 hover:bg-red-100'}`}
                aria-label="Vote against"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667V3a1 1 0 00-1-1H6.636a1 1 0 00-.943.646L3.33 9.01A1 1 0 004.274 10.36H7V15.5a1.5 1.5 0 003 0V9.667h4z" /></svg>
            </button>
            <button
                onClick={() => handleVoteClick('abstain')}
                className={`p-2 rounded-full transition-colors ${userVote === 'abstain' ? 'bg-gray-300 text-gray-800 ring-2 ring-gray-500' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                aria-label="Abstain from voting"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
               </svg>
            </button>
        </div>

      </div>
      
      {isLoading && <LoadingSpinner />}
      {error && !isLoading && <ErrorDisplay message={error} />}
      
      {analysis && !isLoading && !error && (
        <>
            <div className="border-b border-gray-200 px-6 md:px-8">
                <div className="flex space-x-1 overflow-x-auto pb-2 -mb-px">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                    <TabButton active={activeTab === 'viewpoints'} onClick={() => setActiveTab('viewpoints')}>Viewpoints</TabButton>
                    <TabButton active={activeTab === 'impact'} onClick={() => setActiveTab('impact')}>Impact</TabButton>
                    <TabButton active={activeTab === 'debates'} onClick={() => setActiveTab('debates')}>Debates</TabButton>
                    <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')}>Media Gallery</TabButton>
                    <TabButton active={activeTab === 'discussion'} onClick={() => setActiveTab('discussion')}>Discussion</TabButton>
                </div>
            </div>
            <div className="p-6 md:p-8">
              {renderContent()}
            </div>
        </>
      )}
    </div>
  );
};