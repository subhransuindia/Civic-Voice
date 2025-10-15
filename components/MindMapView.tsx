import React from 'react';
import type { MindMap } from '../types';

interface MindMapViewProps {
  mindMap: MindMap;
}

export const MindMapView: React.FC<MindMapViewProps> = ({ mindMap }) => {
  if (!mindMap || !mindMap.centralTopic) {
    return <p className="text-center text-gray-500 py-8">No mind map data available.</p>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 font-sans">
      <div className="text-center mb-8">
        <h3 className="inline-block bg-indigo-600 text-white font-extrabold text-lg px-6 py-3 rounded-full shadow-lg">{mindMap.centralTopic}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mindMap.branches.map((branch, index) => (
          <div key={index} className="bg-white p-4 rounded-xl border-t-4 border-indigo-400 shadow-md">
            <h4 className="font-bold text-gray-800 text-base mb-3">{branch.title}</h4>
            {branch.children && branch.children.length > 0 && (
              <ul className="space-y-2">
                {branch.children.map((child, childIndex) => (
                  <li key={childIndex} className="flex items-start">
                    <svg className="w-4 h-4 text-indigo-500 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm text-gray-600">{child}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};