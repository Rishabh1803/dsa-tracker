'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DSANode, DSAEdge, UserProgressMap, NodeStatus } from '@/lib/types';
import { calculateNodeStatuses } from '@/lib/topoSort';
import { ZoomIn, ZoomOut, Maximize2, Activity, Grid, Network, ArrowRight } from 'lucide-react';
import { Lock, ArrowRight } from "lucide-react";
interface GraphCanvasProps {
  nodes: DSANode[];
  edges: DSAEdge[];
  userProgress: UserProgressMap;
  onSelectNode: (nodeIdOrSlug: string) => void;
  selectedNodeId?: string | null;
  filterCategory?: string;
  filterDifficulty?: string;
  filterStatus?: string;
  searchQuery?: string;
}

export type LayoutMode = 'cluster' | 'module-grid';

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  userProgress,
  onSelectNode,
  selectedNodeId,
  filterCategory = 'All',
  filterDifficulty = 'All',
  filterStatus = 'All',
  searchQuery = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('cluster');

  // Calculate Phase 3 statuses (Locked, Ready, Completed)
  const statusMap = calculateNodeStatuses(nodes, edges, userProgress);

  // 1. Strict, Precise Filtering
  const filteredNodes = nodes.filter(node => {
    if (filterCategory !== 'All' && node.category !== filterCategory) return false;
    if (filterDifficulty !== 'All' && node.difficulty !== filterDifficulty) return false;
    if (filterStatus !== 'All') {
      const info = statusMap.get(node.id);
      if (info?.status !== filterStatus) return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        node.label.toLowerCase().includes(q) ||
        node.slug.toLowerCase().includes(q) ||
        node.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

  // Only include edges connecting strictly between filtered nodes
  const filteredEdges = edges.filter(
    e => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to)
  );

  // Compute Module Grid layout positions if module-grid layout is active
  const categoryList = Array.from(new Set(filteredNodes.map(n => n.category))).sort();
  const categoryPositions = new Map<string, { x: number; y: number }>();
  categoryList.forEach((cat, index) => {
    const cols = 3;
    const col = index % cols;
    const row = Math.floor(index / cols);
    categoryPositions.set(cat, { x: col * 750 - 750, y: row * 600 - 600 });
  });

  useEffect(() => {
    let networkInstance: any = null;

    async function initGraph() {
      if (!containerRef.current) return;

      const visNetwork = await import('vis-network/standalone');
      const categoryCounters = new Map<string, number>();

      const visNodes = filteredNodes.map(node => {
        const info = statusMap.get(node.id);
        const status: NodeStatus = info ? info.status : 'locked';
        const isSelected = selectedNodeId === node.id || selectedNodeId === node.slug;

        let bgColor = '#1e293b'; // Slate 800
        let borderColor = '#64748b'; // Slate 500
        let fontColor = '#f8fafc';
        let iconPrefix = '[Locked] ';

        if (status === 'completed') {
          bgColor = '#047857'; // Deep Emerald
          borderColor = '#34d399';
          fontColor = '#ffffff';
          iconPrefix = '✓ ';
        } else if (status === 'ready') {
          bgColor = '#d97706'; // Vibrant Amber
          borderColor = '#fbbf24';
          fontColor = '#ffffff';
          iconPrefix = '⚡ ';
        }

        const baseNode: any = {
          id: node.id,
          label: `${iconPrefix}${node.label}\n[${node.difficulty}]`,
          shape: 'box',
          margin: { top: 12, right: 16, bottom: 12, left: 16 },
          borderWidth: isSelected ? 4 : 2,
          color: {
            background: bgColor,
            border: isSelected ? '#38bdf8' : borderColor,
            highlight: {
              background: bgColor,
              border: '#38bdf8',
            },
            hover: {
              background: bgColor,
              border: '#38bdf8',
            },
          },
          font: {
            color: fontColor,
            size: isSelected ? 14 : 13,
            bold: true,
            face: 'Inter, system-ui, sans-serif',
          },
          shadow: isSelected
            ? { enabled: true, color: '#38bdf8', size: 18, x: 0, y: 0 }
            : { enabled: true, color: 'rgba(0,0,0,0.6)', size: 8, x: 0, y: 4 },
          shapeProperties: {
            borderRadius: 10,
          },
        };

        // Custom Grid Positioning
        if (layoutMode === 'module-grid') {
          const catPos = categoryPositions.get(node.category) || { x: 0, y: 0 };
          const count = categoryCounters.get(node.category) || 0;
          categoryCounters.set(node.category, count + 1);

          const innerCols = 3;
          const innerCol = count % innerCols;
          const innerRow = Math.floor(count / innerCols);

          baseNode.x = catPos.x + innerCol * 220;
          baseNode.y = catPos.y + innerRow * 100;
        }

        return baseNode;
      });

      // Clean, Direct Continuous Connection Arrows
      const visEdges = filteredEdges.map(edge => ({
        id: edge.id || `${edge.from}->${edge.to}`,
        from: edge.from,
        to: edge.to,
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 1.2,
            type: 'arrow',
          },
        },
        color: {
          color: '#38bdf8',       // Vibrant Sky Blue
          highlight: '#34d399', // Glowing Emerald on hover/select
          hover: '#60a5fa',
          opacity: 0.9,
        },
        width: 2.5,
        smooth: {
          enabled: true,
          type: 'continuous', // Smooth continuous direct lines pointing straight to target box
          roundness: 0.2,
        },
      }));

      const data: any = {
        nodes: new visNetwork.DataSet(visNodes as any),
        edges: new visNetwork.DataSet(visEdges as any),
      };

      // Balanced Anti-Overlap Physics with Firm Edge Springs
      const options = {
        nodes: {
          shadow: true,
        },
        edges: {
          shadow: false,
        },
        interaction: {
          hover: true,
          hoverConnectedEdges: true, // Automatically highlight incoming/outgoing prerequisite arrows on hover!
          selectConnectedEdges: true,
          tooltipDelay: 100,
          zoomView: true,
          dragView: true,
        },
        physics: {
          enabled: layoutMode !== 'module-grid' && physicsEnabled,
          solver: 'barnesHut',
          barnesHut: {
            gravitationalConstant: -12000, // Balanced repulsion
            centralGravity: 0.01,
            springLength: 170,             // Clean, comfortable distance between connected nodes
            springConstant: 0.06,          // Firm spring tension keeps connection arrows straight and clean!
            damping: 0.5,
            avoidOverlap: 1.0,
          },
          stabilization: {
            enabled: true,
            iterations: 300,
            updateInterval: 25,
          },
        },
      };

      networkInstance = new visNetwork.Network(containerRef.current, data, options);
      networkRef.current = networkInstance;

      networkInstance.on('click', (params: any) => {
        if (params.nodes.length > 0) {
          const clickedNodeId = params.nodes[0];
          onSelectNode(clickedNodeId);
        }
      });

      // Auto fit canvas on initial stabilization
      networkInstance.once('stabilizationIterationsDone', () => {
        networkInstance.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
      });
    }

    initGraph();

    return () => {
      if (networkInstance) {
        networkInstance.destroy();
      }
    };
  }, [filteredNodes, filteredEdges, userProgress, filterCategory, filterDifficulty, filterStatus, searchQuery, selectedNodeId, layoutMode]);

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.25 });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 0.8 });
    }
  };

  const handleFit = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    }
  };

  const togglePhysics = () => {
    setPhysicsEnabled(prev => {
      const next = !prev;
      if (networkRef.current) {
        networkRef.current.setOptions({ physics: { enabled: next } });
      }
      return next;
    });
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
      
      {/* Network Canvas Mount Point */}
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Floating Layout & View Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        
        {/* Layout Mode Selector Buttons */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1 shadow-lg backdrop-blur-md">
          <button
            onClick={() => setLayoutMode('cluster')}
            title="Interactive Network Cluster"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              layoutMode === 'cluster'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Spacious Cluster</span>
          </button>

          <button
            onClick={() => setLayoutMode('module-grid')}
            title="Organized Module Grid"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              layoutMode === 'module-grid'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Module Grid</span>
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex flex-col gap-1.5 self-end">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 text-slate-200 shadow-md backdrop-blur-md hover:bg-slate-800 hover:text-white transition"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 text-slate-200 shadow-md backdrop-blur-md hover:bg-slate-800 hover:text-white transition"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <button
            onClick={handleFit}
            title="Fit View"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 text-slate-200 shadow-md backdrop-blur-md hover:bg-slate-800 hover:text-white transition"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {layoutMode === 'cluster' && (
            <button
              onClick={togglePhysics}
              title={physicsEnabled ? "Freeze Layout Positions" : "Enable Physics"}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                physicsEnabled
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-700 bg-slate-900/90 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>

      {/* Floating Graph Legend */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/90 px-4 py-2.5 shadow-xl backdrop-blur-md text-xs font-medium">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="h-3 w-3 rounded-md bg-emerald-500 shadow-sm" />
          <span>Completed 🟢</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="h-3 w-3 rounded-md bg-amber-500 shadow-sm" />
          <span>Ready 🟡</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="h-3 w-3 rounded-md bg-slate-600 shadow-sm" />
          <span>Locked <Lock className="w-4 h-4 ml-1 inline-block text-gray-400"/></span>
        </div>
        <div className="flex items-center gap-1.5 text-sky-400 border-l border-slate-800 pl-3">
          <ArrowRight className="w-4 h-4 text-blue-400 inline-block mr-1"/> 
          <span>Prerequisite Arrow</span>
        </div>
      </div>

    </div>
  );
};
