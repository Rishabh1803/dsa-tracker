'use client';

import React from 'react';
import { DSANode, DSAEdge, UserProgressMap } from '@/lib/types';
import { calculateNodeStatuses } from '@/lib/topoSort';
import { X, ExternalLink, CheckCircle2, Lock, Play, ChevronRight } from 'lucide-react';

interface NodeInspectorProps {
  nodeIdOrSlug: string | null;
  nodes: DSANode[];
  edges: DSAEdge[];
  userProgress: UserProgressMap;
  onToggleCompletion: (nodeId: string, currentlyCompleted: boolean) => void;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  nodeIdOrSlug,
  nodes,
  edges,
  userProgress,
  onToggleCompletion,
  onClose,
  onSelectNode,
}) => {
  if (!nodeIdOrSlug) return null;

  const node = nodes.find(n => n.id === nodeIdOrSlug || n.slug === nodeIdOrSlug);
  if (!node) return null;

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const statusMap = calculateNodeStatuses(nodes, edges, userProgress);
  const statusInfo = statusMap.get(node.id);

  const isCompleted = statusInfo?.status === 'completed';
  const isReady = statusInfo?.status === 'ready';
  const isLocked = statusInfo?.status === 'locked';

  // Find prerequisite nodes (incoming edges to this node)
  const prereqEdges = edges.filter(e => e.to === node.id);
  const prereqNodes = prereqEdges.map(e => ({
    node: nodeMap.get(e.from),
    isCompleted: !!userProgress[e.from],
  })).filter((item): item is { node: DSANode; isCompleted: boolean } => Boolean(item.node));

  // Find downstream dependent nodes (outgoing edges from this node)
  const dependentEdges = edges.filter(e => e.from === node.id);
  const dependentNodes = dependentEdges.map(e => nodeMap.get(e.to)).filter((n): n is DSANode => Boolean(n));

  const diffColors: Record<string, string> = {
    Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-full sm:max-w-md flex-col border-l border-slate-800 bg-slate-950/95 p-4 sm:p-6 shadow-2xl backdrop-blur-xl transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {node.category}
            </span>
            <h2 className="mt-0.5 text-lg font-bold text-white sm:text-xl">{node.label}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-4 sm:py-6 space-y-4 sm:space-y-6">
          
          {/* Difficulty & Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${diffColors[node.difficulty] || 'bg-slate-800 text-slate-300'}`}>
              {node.difficulty}
            </span>

            {isCompleted && (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed 🟢
              </span>
            )}

            {isReady && (
              <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                <Play className="h-3.5 w-3.5" /> Ready to Solve 🟡
              </span>
            )}

            {isLocked && (
              <span className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-bold text-slate-400">
                <Lock className="h-3.5 w-3.5" /> Prerequisites Unmet <Lock className="w-4 h-4 inline-block ml-1"/>
              </span>
            )}
          </div>

          {/* Problem External Resource Link */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 sm:p-4">
            <span className="text-xs font-semibold text-slate-400">Resource Link</span>
            <a
              href={node.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-medium text-emerald-400 hover:border-emerald-500 hover:bg-slate-800/90 transition group"
            >
              <span>Solve Problem</span>
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Action Button: Strictly Enforce Prerequisites Locking */}
          <div>
            {isLocked ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                  <Lock className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>This topic is <strong>Locked <Lock className="w-4 h-4 inline-block ml-1"/></strong>. You must complete all required prerequisite topics below before unlocking this problem!</span>
                </div>
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 py-3 text-xs sm:text-sm font-bold text-slate-600 cursor-not-allowed opacity-60"
                >
                  <Lock className="h-4 w-4" />
                  <span>Locked (Prerequisites Pending)</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onToggleCompletion(node.id, isCompleted)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold shadow-lg transition-all ${
                  isCompleted
                    ? 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20'
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>{isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}</span>
              </button>
            )}
          </div>

          {/* Prerequisites Checklist */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 sm:p-4">
            <h3 className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Prerequisite Topics</span>
              <span className="text-slate-300 font-bold">
                {statusInfo?.prerequisitesCompleted}/{statusInfo?.prerequisitesTotal}
              </span>
            </h3>

            {prereqNodes.length === 0 ? (
              <p className="mt-3 text-xs italic text-slate-500">
                No prerequisite topics required! This is a starting node.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {prereqNodes.map(({ node: pNode, isCompleted: pDone }) => (
                  <div
                    key={pNode.id}
                    onClick={() => onSelectNode(pNode.id)}
                    className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900 px-3 py-2 text-xs cursor-pointer hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {pDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                      )}
                      <span className={`truncate ${pDone ? 'text-slate-200 line-through' : 'text-slate-300 font-medium'}`}>
                        {pNode.label}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Downstream Unlocks */}
          {dependentNodes.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 sm:p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Unlocks Next Topics ({dependentNodes.length})
              </h3>
              <div className="mt-3 space-y-2">
                {dependentNodes.map(dNode => (
                  <div
                    key={dNode.id}
                    onClick={() => onSelectNode(dNode.id)}
                    className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900 px-3 py-2 text-xs text-slate-300 cursor-pointer hover:border-slate-700 transition"
                  >
                    <span className="truncate min-w-0">{dNode.label}</span>
                    <span className="text-[10px] text-slate-500 font-semibold shrink-0 ml-2">{dNode.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};
