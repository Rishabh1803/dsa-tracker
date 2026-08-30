'use client';

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (diff: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  searchQuery,
  setSearchQuery,
  onReset,
}) => {
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 sm:p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      
      {/* Search & Category Select Row */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search problems or algorithms..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative shrink-0">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="max-w-[140px] truncate rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-2 text-xs font-medium text-slate-300 focus:border-emerald-500 focus:outline-none transition sm:max-w-none"
          >
            <option value="All">All Modules ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Difficulty Chips & Reset Row */}
      <div className="flex items-center justify-between gap-2 shrink-0 sm:justify-end">
        {/* Difficulty Chips */}
        <div className="flex flex-1 items-center justify-around gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 sm:flex-initial">
          {difficulties.map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`rounded-lg px-2 py-1 text-[11px] sm:text-xs font-semibold transition ${
                selectedDifficulty === diff
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Reset Filters */}
        <button
          onClick={onReset}
          title="Reset Filters"
          className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

    </div>
  );
};
