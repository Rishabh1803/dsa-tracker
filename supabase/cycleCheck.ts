import { seedNodes, seedEdges } from '../src/lib/seedData';

/**
 * Cycle Detection Algorithm using Depth First Search (Three-color coloring)
 * Colors: 0 = Unvisited (White), 1 = Visiting / In Recursion Stack (Gray), 2 = Visited (Black)
 */
export function validateGraphCycles(
  nodes: { id: string; slug: string; label: string }[],
  edges: { from: string; to: string }[]
): { hasCycle: boolean; cyclePath?: string[]; orphanEdges: { from: string; to: string }[] } {
  const nodeIds = new Set(nodes.map(n => n.id));
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // 1. Check for orphan edges
  const orphanEdges: { from: string; to: string }[] = [];
  const validEdges: { from: string; to: string }[] = [];

  edges.forEach(e => {
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) {
      orphanEdges.push(e);
    } else {
      validEdges.push(e);
    }
  });

  // 2. Build Adjacency List
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  validEdges.forEach(e => {
    adj.get(e.from)!.push(e.to);
  });

  // 3. DFS Cycle Detection
  const color = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited
  nodes.forEach(n => color.set(n.id, 0));

  const parent = new Map<string, string | null>();
  let cycleStartNode: string | null = null;
  let cycleEndNode: string | null = null;

  function dfs(u: string): boolean {
    color.set(u, 1); // Mark visiting

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      if (color.get(v) === 1) {
        // Found back-edge -> Cycle!
        cycleStartNode = v;
        cycleEndNode = u;
        return true;
      }
      if (color.get(v) === 0) {
        parent.set(v, u);
        if (dfs(v)) return true;
      }
    }

    color.set(u, 2); // Mark visited
    return false;
  }

  for (const n of nodes) {
    if (color.get(n.id) === 0) {
      if (dfs(n.id)) {
        // Reconstruct cycle path
        const cyclePath: string[] = [nodeMap.get(cycleStartNode!)?.slug || cycleStartNode!];
        let curr: string | null = cycleEndNode;
        while (curr && curr !== cycleStartNode) {
          cyclePath.push(nodeMap.get(curr)?.slug || curr);
          curr = parent.get(curr) || null;
        }
        cyclePath.push(nodeMap.get(cycleStartNode!)?.slug || cycleStartNode!);
        cyclePath.reverse();

        return { hasCycle: true, cyclePath, orphanEdges };
      }
    }
  }

  return { hasCycle: false, orphanEdges };
}

// Execute cycle validation on seed graph
const result = validateGraphCycles(seedNodes, seedEdges);
if (result.hasCycle) {
  console.error('❌ CRITICAL SEED GRAPH FAILURE: Cycle detected in curriculum!', result.cyclePath);
  process.exit(1);
} else if (result.orphanEdges.length > 0) {
  console.warn('⚠️ WARNING: Seed graph contains orphan edges:', result.orphanEdges);
} else {
  console.log(`✅ Phase 0 Cycle Validation PASSED! Graph with ${seedNodes.length} nodes and ${seedEdges.length} edges is 100% DAG (Directed Acyclic Graph).`);
}
