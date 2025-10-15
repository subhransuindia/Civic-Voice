import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
           <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.482V21l4.197-2.099A9.012 9.012 0 0012 20.25z" />
          </svg>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
            Civic <span className="text-indigo-600">Voice</span>
          </h1>
        </div>
         <p className="text-sm text-gray-500 hidden md:block">Informed Decisions for a Stronger Democracy</p>
      </div>
    </header>
  );
};