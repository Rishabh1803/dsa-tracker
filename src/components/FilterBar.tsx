'use client';

import React from 'react';
import { Search, RotateCcw, CheckCircle2, Play, Lock } from 'lucide-react';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (diff: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
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
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  onReset,
}) => {
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 sm:p-4 shadow-lg backdrop-blur-md">
      
      {/* Top Row: Search Input & Category Dropdown */}
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search problems, topics or algorithms..."
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
            className="max-w-[150px] truncate rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 focus:border-emerald-500 focus:outline-none transition sm:max-w-none"
          >
            <option value="All">All Modules ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown Filter */}
        <div className="relative shrink-0">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 focus:border-emerald-500 focus:outline-none transition"
          >
            <option value="All">All Statuses</option>
            <option value="completed">🟢 Completed / Done</option>
            <option value="ready">🟡 Unlocked / Ready to Solve</option>
            <option value="locked">🔒 Locked / Pending Prereqs</option>
          </select>
        </div>
      </div>

      {/* Bottom Row: Difficulty Chips & Reset */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        {/* Difficulty Chips */}
        <div className="flex flex-1 items-center justify-around gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 sm:flex-initial">
          {difficulties.map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`rounded-lg px-2.5 py-1 text-[11px] sm:text-xs font-semibold transition ${
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
          className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

    </div>
  );
};
