import React from 'react';
import type { Bill } from '../types';

export const BillCard: React.FC<{ bill: Bill; onSelectBill: (bill: Bill) => void; isSelected: boolean; }> = ({ bill, onSelectBill, isSelected }) => {
  const baseClasses = "block p-4 rounded-xl cursor-pointer transition-all duration-200 ease-in-out border-2";
  const selectedClasses = "bg-white border-indigo-500 shadow-lg scale-[1.02]";
  const unselectedClasses = "bg-white border-transparent hover:bg-white hover:shadow-md hover:border-gray-200";

  const statusColors: { [key: string]: string } = {
    'Passed': 'bg-green-100 text-green-800',
    'In Process': 'bg-yellow-100 text-yellow-800',
    'Appealed': 'bg-orange-100 text-orange-800',
    'Announced': 'bg-blue-100 text-blue-800',
  };

  return (
    <div
      onClick={() => onSelectBill(bill)}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onSelectBill(bill)}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-base text-gray-800 pr-4">{bill.title}</h3>
        <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[bill.status]}`}>
          {bill.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{bill.summary}</p>
      <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
        <span className="font-medium text-gray-500">{bill.date}</span>
        <div className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{bill.voteCount.for + bill.voteCount.against} Votes</span>
        </div>
      </div>
    </div>
  );
};