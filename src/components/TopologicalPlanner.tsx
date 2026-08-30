'use client';

import React, { useState } from 'react';
import { DSANode, DSAEdge, UserProgressMap, NodeStatus } from '@/lib/types';
import { runKahnsTopologicalSort } from '@/lib/topoSort';
import { Play, Lock, CheckCircle2, ExternalLink, Sparkles, Filter, Check } from 'lucide-react';

interface TopologicalPlannerProps {
  nodes: DSANode[];
  edges: DSAEdge[];
  userProgress: UserProgressMap;
  onToggleCompletion: (nodeSlug: string, currentlyCompleted: boolean) => void;
  onSelectNode: (nodeSlug: string) => void;
}

export const TopologicalPlanner: React.FC<TopologicalPlannerProps> = ({
  nodes,
  edges,
  userProgress,
  onToggleCompletion,
  onSelectNode,
}) => {
  const [activeTab, setActiveTab] = useState<'ready' | 'locked' | 'completed'>('ready');
  const [searchQuery, setSearchQuery] = useState('');

  const topoItems = runKahnsTopologicalSort(nodes, edges, userProgress);

  const readyItems = topoItems.filter(item => item.status === 'ready');
  const lockedItems = topoItems.filter(item => item.status === 'locked');
  const completedItems = topoItems.filter(item => item.status === 'completed');

  let displayItems = readyItems;
  if (activeTab === 'locked') displayItems = lockedItems;
  if (activeTab === 'completed') displayItems = completedItems;

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    displayItems = displayItems.filter(
      item =>
        item.node.label.toLowerCase().includes(q) ||
        item.node.category.toLowerCase().includes(q)
    );
  }

  const diffColors = {
    Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
      
      {/* Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Topological Study Path Generator</h2>
            <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
              <Sparkles className="h-3 w-3" /> Kahn's Algorithm
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Optimal linear learning sequence. Prerequisites are automatically ordered before target topics.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => setActiveTab('ready')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'ready'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Ready Now ({readyItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('locked')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'locked'
                ? 'bg-slate-700 text-white font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Locked ({lockedItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'completed'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Completed ({completedItems.length})</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="py-4">
        <input
          type="text"
          placeholder="Filter queue by topic or category..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
            <Filter className="h-8 w-8 mb-2 opacity-50" />
            <span>No problems match the selected tab filter.</span>
          </div>
        ) : (
          displayItems.map((item, index) => {
            const { node, status, statusInfo } = item;
            const isDone = status === 'completed';

            return (
              <div
                key={node.slug}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700 hover:bg-slate-900"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-400">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        onClick={() => onSelectNode(node.slug)}
                        className="text-sm font-semibold text-white hover:text-emerald-400 cursor-pointer transition"
                      >
                        {node.label}
                      </h4>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${diffColors[node.difficulty]}`}>
                        {node.difficulty}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                        {node.category}
                      </span>

                      {status === 'locked' && (
                        <span className="text-[11px] text-amber-400/90 font-medium">
                          Prerequisites remaining: {statusInfo.missingPrerequisites.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={node.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    <span>Solve</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    onClick={() => onToggleCompletion(node.slug, isDone)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isDone
                        ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{isDone ? 'Done' : 'Mark Done'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
