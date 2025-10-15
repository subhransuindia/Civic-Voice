import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { BillCard } from './components/BillCard';
import { BillDetailView } from './components/BillDetailView';
import type { Bill, Language, BillAnalysis } from './types';
import { getBillAnalysis, findBillsFromSearch } from './services/geminiService';

type VoteOption = 'up' | 'down' | 'abstain' | null;

const App: React.FC = () => {
  // Main data state
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Bill analysis state
  const [billAnalysis, setBillAnalysis] = useState<BillAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Filter/Sort state
  const [sortOption, setSortOption] = useState('recent');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedLanguage] = useState<Language>('English'); // Language is fixed for now

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    setSearchError(null);
    setBills([]);
    setSelectedBill(null);
    setBillAnalysis(null);

    try {
      const results = await findBillsFromSearch(searchQuery);
      setBills(results);
    } catch (err) {
      console.error("Error finding bills:", err);
      setSearchError("Failed to fetch bills from the web. Please try a different search term or try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBill = useCallback((bill: Bill) => {
    if (selectedBill?.id !== bill.id) {
      setSelectedBill(bill);
      setBillAnalysis(null);
      setAnalysisError(null);
    }
  }, [selectedBill?.id]);

  const fetchAnalysis = useCallback(async () => {
    if (!selectedBill) return;

    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    try {
      const analysis = await getBillAnalysis(selectedBill.title, selectedLanguage);
      setBillAnalysis(analysis);
    } catch (err) {
      console.error("Error fetching bill analysis:", err);
      setAnalysisError("Failed to fetch bill analysis. The model may be unavailable. Please try again later.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [selectedBill, selectedLanguage]);

  const handleVote = useCallback((billId: string, newVote: VoteOption, oldVote: VoteOption) => {
    setBills(prevBills => prevBills.map(b => {
      if (b.id !== billId) return b;
      
      const updatedVoteCount = { ...b.voteCount };
      
      // Decrement old vote count if it was 'up' or 'down'
      if (oldVote === 'up') updatedVoteCount.for = Math.max(0, updatedVoteCount.for - 1);
      if (oldVote === 'down') updatedVoteCount.against = Math.max(0, updatedVoteCount.against - 1);

      // Increment new vote count if it is 'up' or 'down'
      if (newVote === 'up') updatedVoteCount.for += 1;
      if (newVote === 'down') updatedVoteCount.against += 1;
      
      return { ...b, voteCount: updatedVoteCount };
    }));
  }, []);

  const displayedBills = useMemo(() => {
    let filteredBills = [...bills];

    // Filter by year
    if (selectedYear !== 'all') {
      filteredBills = filteredBills.filter(bill => bill.date.includes(selectedYear));
    }

    // Sort
    const parseDate = (dateString: string): Date => {
      const datePart = dateString.split(' on ')[1] || dateString;
      return new Date(datePart);
    }

    filteredBills.sort((a, b) => {
      try {
        const dateA = parseDate(a.date).getTime();
        const dateB = parseDate(b.date).getTime();
        switch (sortOption) {
          case 'oldest': return dateA - dateB;
          case 'title-asc': return a.title.localeCompare(b.title);
          case 'title-desc': return b.title.localeCompare(a.title);
          case 'recent': default: return dateB - dateA;
        }
      } catch (e) {
        console.error("Invalid date format for sorting:", a.date, b.date);
        return 0;
      }
    });

    return filteredBills;
  }, [bills, selectedYear, sortOption]);


  // Effect to handle fetching when selectedBill changes
  useEffect(() => {
    if (selectedBill) {
      fetchAnalysis();
    }
  }, [selectedBill, fetchAnalysis]);


  // Effect to handle bill selection when filters or results change
  useEffect(() => {
    // If a bill is selected but it's not in the new filtered list
    if (selectedBill && !displayedBills.find(b => b.id === selectedBill.id)) {
      setSelectedBill(displayedBills.length > 0 ? displayedBills[0] : null);
    } 
    // If no bill is selected but the list is not empty
    else if (!selectedBill && displayedBills.length > 0) {
      setSelectedBill(displayedBills[0]);
    }
    // If bills are cleared (new search), clear selection
    else if (bills.length === 0) {
      setSelectedBill(null);
    }
  }, [displayedBills, selectedBill, bills.length]);


  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1947 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <aside className="lg:col-span-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Find Policies & Bills</h3>
                <form onSubmit={handleSearch} className="flex space-x-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., recent environmental bills"
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base placeholder:text-gray-500"
                        disabled={isSearching}
                        aria-label="Search for recent policies"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait transition-colors flex-shrink-0"
                        disabled={isSearching}
                        aria-label="Search"
                    >
                      {isSearching ? (
                         <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                    </button>
                </form>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
               <div>
                  <label htmlFor="sort-select" className="block text-xs font-medium text-gray-500 mb-1">Sort by</label>
                  <select
                    id="sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="oldest">Oldest</option>
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                  </select>
               </div>
               <div>
                  <label htmlFor="year-select" className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                  <select
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="all">All Years</option>
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
               </div>
            </div>

            <div className="space-y-3">
              {isSearching ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border-2 border-transparent animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ))
                ) : searchError ? (
                  <div className="text-center py-10 px-4 bg-red-50 rounded-xl border border-red-200">
                    <h3 className="text-md font-medium text-red-800">Search Failed</h3>
                    <p className="mt-1 text-sm text-red-600">{searchError}</p>
                  </div>
                ) : bills.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-white rounded-xl border border-gray-200">
                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <h3 className="mt-2 text-md font-medium text-gray-900">Your Search, Your Voice</h3>
                    <p className="mt-1 text-sm text-gray-500">Find policies that matter to you. Try "technology bills" or "healthcare reform 2023".</p>
                  </div>
                ) : displayedBills.length > 0 ? (
                  displayedBills.map((bill) => (
                    <BillCard 
                      key={bill.id} 
                      bill={bill} 
                      onSelectBill={handleSelectBill}
                      isSelected={selectedBill?.id === bill.id}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 px-4 bg-white rounded-xl border border-gray-200">
                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="mt-2 text-md font-medium text-gray-900">No Bills Found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your filters.</p>
                  </div>
              )}
            </div>
          </aside>

          {/* Right Column */}
          <section className="lg:col-span-8">
             <div className="lg:sticky top-8">
              {selectedBill ? (
                <BillDetailView
                  key={selectedBill.id}
                  bill={selectedBill}
                  analysis={billAnalysis}
                  isLoading={isLoadingAnalysis}
                  error={analysisError}
                  onVote={handleVote}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-md p-8 border border-gray-200 min-h-[600px]">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-xl font-medium text-gray-900">Select a Bill</h3>
                    <p className="mt-1 text-gray-500">Choose a bill from the list to see its detailed analysis.</p>
                  </div>
                </div>
              )}
             </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;