'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DSANode, DSAEdge, UserProgressMap, NodeStatus } from '@/lib/types';
import { calculateNodeStatuses } from '@/lib/topoSort';
import { ZoomIn, ZoomOut, Maximize2, Activity, GitFork, Layers, Network } from 'lucide-react';

interface GraphCanvasProps {
  nodes: DSANode[];
  edges: DSAEdge[];
  userProgress: UserProgressMap;
  onSelectNode: (nodeIdOrSlug: string) => void;
  selectedNodeId?: string | null;
  filterCategory?: string;
  filterDifficulty?: string;
  searchQuery?: string;
}

export type LayoutMode = 'spacious' | 'hierarchical-ud' | 'hierarchical-lr';

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  userProgress,
  onSelectNode,
  selectedNodeId,
  filterCategory = 'All',
  filterDifficulty = 'All',
  searchQuery = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('spacious');

  // Calculate Phase 3 statuses (Locked, Ready, Completed)
  const statusMap = calculateNodeStatuses(nodes, edges, userProgress);

  // Filter nodes
  const filteredNodes = nodes.filter(node => {
    if (filterCategory !== 'All' && node.category !== filterCategory) return false;
    if (filterDifficulty !== 'All' && node.difficulty !== filterDifficulty) return false;
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
  const filteredEdges = edges.filter(
    e => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to)
  );

  useEffect(() => {
    let networkInstance: any = null;

    async function initGraph() {
      if (!containerRef.current) return;

      const visNetwork = await import('vis-network/standalone');

      const visNodes = filteredNodes.map(node => {
        const info = statusMap.get(node.id);
        const status: NodeStatus = info ? info.status : 'locked';
        const isSelected = selectedNodeId === node.id || selectedNodeId === node.slug;

        let bgColor = '#1e293b'; // Slate 800 for Locked
        let borderColor = '#475569';
        let fontColor = '#e2e8f0';
        let iconPrefix = '🔒 ';

        if (status === 'completed') {
          bgColor = '#047857'; // Deep Emerald
          borderColor = '#10b981';
          fontColor = '#ffffff';
          iconPrefix = '✓ ';
        } else if (status === 'ready') {
          bgColor = '#b45309'; // Deep Amber
          borderColor = '#f59e0b';
          fontColor = '#ffffff';
          iconPrefix = '⚡ ';
        }

        return {
          id: node.id,
          label: `${iconPrefix}${node.label}\n[${node.difficulty}]`,
          shape: 'box',
          margin: { top: 10, right: 12, bottom: 10, left: 12 },
          borderWidth: isSelected ? 3 : 1.5,
          color: {
            background: bgColor,
            border: isSelected ? '#ffffff' : borderColor,
            highlight: {
              background: bgColor,
              border: '#ffffff',
            },
            hover: {
              background: bgColor,
              border: '#ffffff',
            },
          },
          font: {
            color: fontColor,
            size: 12,
            face: 'Inter, system-ui, sans-serif',
          },
          shadow: isSelected
            ? { enabled: true, color: 'rgba(255,255,255,0.4)', size: 12, x: 0, y: 0 }
            : { enabled: true, color: 'rgba(0,0,0,0.4)', size: 6, x: 0, y: 3 },
          shapeProperties: {
            borderRadius: 8,
          },
        };
      });

      const visEdges = filteredEdges.map(edge => ({
        id: edge.id || `${edge.from}->${edge.to}`,
        from: edge.from,
        to: edge.to,
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.8,
            type: 'arrow',
          },
        },
        color: {
          color: '#475569',
          highlight: '#38bdf8',
          hover: '#94a3b8',
        },
        width: 1.5,
        smooth: {
          enabled: true,
          type: 'cubicBezier',
          forceDirection: layoutMode === 'hierarchical-ud' ? 'vertical' : layoutMode === 'hierarchical-lr' ? 'horizontal' : 'none',
          roundness: 0.4,
        },
      }));

      const data: any = {
        nodes: new visNetwork.DataSet(visNodes as any),
        edges: new visNetwork.DataSet(visEdges as any),
      };

      // Layout options based on selected mode
      const isHierarchical = layoutMode.startsWith('hierarchical');
      const direction = layoutMode === 'hierarchical-lr' ? 'LR' : 'UD';

      const options = {
        nodes: {
          shadow: true,
        },
        edges: {
          shadow: false,
        },
        interaction: {
          hover: true,
          tooltipDelay: 150,
          zoomView: true,
          dragView: true,
        },
        physics: {
          enabled: !isHierarchical && physicsEnabled,
          solver: 'barnesHut',
          barnesHut: {
            gravitationalConstant: -4000, // Generous repulsion to prevent clutter
            centralGravity: 0.1,
            springLength: 180,            // Long spring length for spacious node gap
            springConstant: 0.04,
            damping: 0.4,
            avoidOverlap: 1.0,           // Strict overlap avoidance
          },
          stabilization: {
            enabled: true,
            iterations: 200,
            updateInterval: 25,
          },
        },
        layout: {
          hierarchical: {
            enabled: isHierarchical,
            direction: direction,
            sortMethod: 'directed',
            nodeSpacing: 180,
            levelSeparation: 160,
            blockShifting: true,
            edgeMinimization: true,
            parentCentralization: true,
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

      // Auto fit on stabilization
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
  }, [nodes, edges, userProgress, filterCategory, filterDifficulty, searchQuery, selectedNodeId, layoutMode]);

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
        
        {/* Layout Mode Selector Dropdown */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1 shadow-lg backdrop-blur-md">
          <button
            onClick={() => setLayoutMode('spacious')}
            title="Spacious Network Cluster"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              layoutMode === 'spacious'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Spacious</span>
          </button>

          <button
            onClick={() => setLayoutMode('hierarchical-ud')}
            title="Top-Down Dependency Tree"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              layoutMode === 'hierarchical-ud'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitFork className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Top-Down Tree</span>
          </button>

          <button
            onClick={() => setLayoutMode('hierarchical-lr')}
            title="Left-Right Dependency Flow"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              layoutMode === 'hierarchical-lr'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Left-Right</span>
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

          {!layoutMode.startsWith('hierarchical') && (
            <button
              onClick={togglePhysics}
              title={physicsEnabled ? "Freeze Node Positions" : "Enable Physics"}
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
          <span>Locked 🔒</span>
        </div>
        <div className="hidden border-l border-slate-800 pl-3 text-slate-500 sm:block">
          Use Category filter or Layout Mode buttons to declutter view
        </div>
      </div>

    </div>
  );
};
