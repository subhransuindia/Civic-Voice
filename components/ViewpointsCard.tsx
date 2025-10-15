import React from 'react';
import type { Viewpoints } from '../types';

interface ViewpointsCardProps {
  viewpoints: Viewpoints;
}

const Viewpoint: React.FC<{ title: string; content: string; icon: React.ReactNode; colorClasses: string }> = ({ title, content, icon, colorClasses }) => (
    <div className={`p-4 rounded-lg flex items-start space-x-4 ${colorClasses}`}>
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full">
            {icon}
        </div>
        <div>
            <h4 className="text-base font-bold text-gray-800">{title}</h4>
            <p className="text-gray-600 mt-1 text-sm">{content}</p>
        </div>
    </div>
);

export const ViewpointsCard: React.FC<ViewpointsCardProps> = ({ viewpoints }) => {
  return (
    <div className="space-y-4">
        <Viewpoint
            title="In Favor (Pro)"
            content={viewpoints.pro}
            colorClasses="bg-green-50 border border-green-200"
            icon={
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 18.236V6.764l3.12-3.12A2 2 0 0111.621 3H12v7z" />
                </svg>
            }
        />
        <Viewpoint
            title="Against (Con)"
            content={viewpoints.con}
            colorClasses="bg-red-50 border border-red-200"
            icon={
                 <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 5.764v11.472l-3.12 3.12a2 2 0 01-1.414.586H12v-7z" />
                </svg>
            }
        />
        <Viewpoint
            title="Neutral Analysis"
            content={viewpoints.neutral}
            colorClasses="bg-gray-100 border border-gray-200"
            icon={
                <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
            }
        />
    </div>
  );
};