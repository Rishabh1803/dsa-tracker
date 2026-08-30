'use client';

import React from 'react';
import { Network, ListOrdered, UploadCloud, ShieldCheck, LogOut, LogIn, Code2, RefreshCw } from 'lucide-react';
import { GraphStats } from '@/lib/types';

interface NavbarProps {
  stats: GraphStats;
  activeTab: 'graph' | 'plan' | 'admin';
  setActiveTab: (tab: 'graph' | 'plan' | 'admin') => void;
  userEmail?: string | null;
  leetcodeHandle?: string | null;
  isSyncingLeetCode?: boolean;
  onOpenAuth?: () => void;
  onOpenLeetCodeSync?: () => void;
  onQuickLeetCodeSync?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  activeTab,
  setActiveTab,
  userEmail,
  leetcodeHandle,
  isSyncingLeetCode = false,
  onOpenAuth,
  onOpenLeetCodeSync,
  onQuickLeetCodeSync,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3">
        
        {/* Top Row on Mobile: Brand Logo & Auth Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 shadow-md shadow-emerald-500/20">
              <Network className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="flex items-center gap-1.5 text-base font-bold tracking-tight text-white sm:text-xl">
                <span>DSA Graph Planner</span>
              </h1>
              <p className="hidden text-xs text-slate-400 md:block">
                Interactive Dependency Graph & Topological Study Queue
              </p>
            </div>
          </div>

          {/* User Auth Action (Mobile top-right) */}
          <div className="flex items-center gap-1.5 sm:hidden">
            {userEmail ? (
              <div className="flex items-center gap-1.5">
                {leetcodeHandle ? (
                  <button
                    onClick={onQuickLeetCodeSync}
                    disabled={isSyncingLeetCode}
                    title={`Sync ${leetcodeHandle}`}
                    className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-400"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncingLeetCode ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                ) : (
                  onOpenLeetCodeSync && (
                    <button
                      onClick={onOpenLeetCodeSync}
                      className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-400"
                    >
                      <Code2 className="h-3 w-3" />
                      <span>Link</span>
                    </button>
                  )
                )}

                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-rose-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row on Mobile / Middle Navigation Tabs */}
        <div className="flex items-center justify-between gap-2">
          
          <nav className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-1 sm:flex-initial">
            <button
              onClick={() => setActiveTab('graph')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all sm:flex-initial ${
                activeTab === 'graph'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              <span>Graph</span>
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all sm:flex-initial ${
                activeTab === 'plan'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" />
              <span>Study Path</span>
              {stats.ready > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950">
                  {stats.ready}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all sm:flex-initial ${
                activeTab === 'admin'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Importer</span>
            </button>
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden items-center gap-3 sm:flex">
            {userEmail ? (
              <>
                {leetcodeHandle ? (
                  <button
                    onClick={onQuickLeetCodeSync}
                    disabled={isSyncingLeetCode}
                    title={`Sync ${leetcodeHandle}`}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 shadow-md transition disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncingLeetCode ? 'animate-spin' : ''}`} />
                    <span>{isSyncingLeetCode ? 'Syncing...' : `Sync (${leetcodeHandle})`}</span>
                  </button>
                ) : (
                  onOpenLeetCodeSync && (
                    <button
                      onClick={onOpenLeetCodeSync}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 shadow-md transition"
                    >
                      <Code2 className="h-4 w-4" />
                      <span>Link LeetCode</span>
                    </button>
                  )
                )}

                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="max-w-[120px] truncate text-white font-semibold">{userEmail}</span>
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
              </>
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

      </div>
    </header>
  );
};
