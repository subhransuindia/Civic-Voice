import React from 'react';
import type { DebateSegment } from '../types';

interface DebatesViewProps {
  debate: DebateSegment[];
}

const DebateEntry: React.FC<{ segment: DebateSegment }> = ({ segment }) => {
    const partyColors: { [key: string]: string } = {
        'Ruling Party': 'border-blue-500',
        'Opposition': 'border-orange-500',
        'Neutral': 'border-gray-500'
    };
    const color = partyColors[segment.party] || 'border-gray-400';

    return (
        <div className={`p-4 border-l-4 rounded-r-lg bg-gray-50 ${color}`}>
            <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800">{segment.speaker}</p>
                <p className="text-xs font-semibold text-gray-500">{segment.party}</p>
            </div>
            <p className="mt-2 text-gray-600 text-sm italic">"{segment.statement}"</p>
        </div>
    );
};

export const DebatesView: React.FC<DebatesViewProps> = ({ debate }) => {
  if (!debate || debate.length === 0) {
    return <p className="text-center text-gray-500 py-8">No debate summary available for this bill.</p>;
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 mb-2">Key Arguments in Parliament</h3>
      {debate.map((segment, index) => (
        <DebateEntry key={index} segment={segment} />
      ))}
    </div>
  );
};