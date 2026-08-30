'use client';

import React from 'react';
import { Network, ListOrdered, UploadCloud, ShieldCheck, Sparkles, LogOut, LogIn, User } from 'lucide-react';
import { GraphStats } from '@/lib/types';

interface NavbarProps {
  stats: GraphStats;
  activeTab: 'graph' | 'plan' | 'admin';
  setActiveTab: (tab: 'graph' | 'plan' | 'admin') => void;
  userEmail?: string | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  activeTab,
  setActiveTab,
  userEmail,
  onOpenAuth,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
            <Network className="h-6 w-6 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-white sm:text-xl">
              <span>DSA Graph Planner</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                <Sparkles className="h-3 w-3" /> Phase Build
              </span>
            </h1>
            <p className="hidden text-xs text-slate-400 sm:block">
              Interactive Dependency Graph & Topological Study Queue
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'graph'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Dependency Graph</span>
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'plan'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ListOrdered className="h-4 w-4" />
            <span>Study Path</span>
            {stats.ready > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                {stats.ready}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'admin'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk Importer</span>
          </button>
        </nav>

        {/* Phase 1 Auth Status Indicator */}
        <div className="flex items-center gap-3">
          {userEmail ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="max-w-[120px] truncate text-white font-semibold">Logged in as {userEmail}</span>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="ml-1 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
            >
              <LogIn className="h-4 w-4" />
              <span>Log In / Sign Up</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
