import { DSANode, DSAEdge, UserProgressMap, NodeStatusInfo, TopologicalQueueItem, GraphStats, NodeStatus } from './types';

/**
 * Calculates detailed status for each node based on user progress map.
 * - Completed: node ID is present in userProgress.
 * - Ready: not completed, but all prerequisite edges point to completed node IDs.
 * - Locked: not completed, and has 1+ uncompleted prerequisite node IDs.
 */
export function calculateNodeStatuses(
  nodes: DSANode[],
  edges: DSAEdge[],
  userProgress: UserProgressMap
): Map<string, NodeStatusInfo> {
  const statusMap = new Map<string, NodeStatusInfo>();

  // Map of target node ID -> array of prerequisite node IDs
  const prereqsMap = new Map<string, string[]>();
  nodes.forEach(n => prereqsMap.set(n.id, []));
  edges.forEach(e => {
    if (prereqsMap.has(e.to)) {
      prereqsMap.get(e.to)!.push(e.from);
    }
  });

  nodes.forEach(node => {
    const isCompleted = !!userProgress[node.id] || !!userProgress[node.slug];
    const prereqs = prereqsMap.get(node.id) || [];
    const missing = prereqs.filter(pId => !userProgress[pId] && !userProgress[pId]);

    let status: NodeStatus = 'locked';
    if (isCompleted) {
      status = 'completed';
    } else if (missing.length === 0) {
      status = 'ready';
    } else {
      status = 'locked';
    }

    statusMap.set(node.id, {
      status,
      prerequisitesTotal: prereqs.length,
      prerequisitesCompleted: prereqs.length - missing.length,
      missingPrerequisites: missing,
    });
  });

  return statusMap;
}

/**
 * Phase 4 Kahn's Algorithm Implementation:
 * 1. Remove Completed nodes AND their incoming/outgoing edges from the working graph first.
 * 2. Calculate in-degrees on what's left.
 * 3. Enqueue in-degree = 0 nodes (Ready nodes).
 * 4. Process queue to generate ordered linear study path (Ready → Locked queue).
 */
export function runKahnsTopologicalSort(
  nodes: DSANode[],
  edges: DSAEdge[],
  userProgress: UserProgressMap
): TopologicalQueueItem[] {
  const nodeMap = new Map<string, DSANode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const statusMap = calculateNodeStatuses(nodes, edges, userProgress);

  // 1. Identify completed node IDs
  const completedNodeIds = new Set<string>();
  nodes.forEach(n => {
    if (userProgress[n.id] || userProgress[n.slug]) {
      completedNodeIds.add(n.id);
    }
  });

  // 2. Remove Completed nodes AND their edges from the working graph
  const workingNodes = nodes.filter(n => !completedNodeIds.has(n.id));
  const workingEdges = edges.filter(e => !completedNodeIds.has(e.from) && !completedNodeIds.has(e.to));

  // 3. Compute In-degrees for working nodes
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  workingNodes.forEach(n => {
    inDegree.set(n.id, 0);
    adjList.set(n.id, []);
  });

  workingEdges.forEach(e => {
    if (inDegree.has(e.to) && adjList.has(e.from)) {
      inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
      adjList.get(e.from)!.push(e.to);
    }
  });

  // 4. Enqueue in-degree 0 nodes (Ready nodes)
  const queue: string[] = [];
  inDegree.forEach((deg, nodeId) => {
    if (deg === 0) {
      queue.push(nodeId);
    }
  });

  const sortedNodeIds: string[] = [];

  while (queue.length > 0) {
    // Sort queue items so Ready nodes come first, ordered by difficulty
    queue.sort((aId, bId) => {
      const diffRank = { Easy: 1, Medium: 2, Hard: 3 };
      const aDiff = diffRank[nodeMap.get(aId)?.difficulty || 'Easy'];
      const bDiff = diffRank[nodeMap.get(bId)?.difficulty || 'Easy'];
      return aDiff - bDiff;
    });

    const currId = queue.shift()!;
    sortedNodeIds.push(currId);

    const neighbors = adjList.get(currId) || [];
    for (const neighbor of neighbors) {
      const newDeg = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Handle any working nodes missed due to cycles (if any)
  workingNodes.forEach(n => {
    if (!sortedNodeIds.includes(n.id)) {
      sortedNodeIds.push(n.id);
    }
  });

  // Build TopologicalQueueItem list for working nodes
  const workingItems: TopologicalQueueItem[] = sortedNodeIds
    .map(id => {
      const node = nodeMap.get(id);
      const statusInfo = statusMap.get(id);
      if (!node || !statusInfo) return null;
      return {
        node,
        status: statusInfo.status,
        statusInfo,
      };
    })
    .filter((item): item is TopologicalQueueItem => item !== null);

  // Include Completed nodes at the end for full history tab view
  const completedItems: TopologicalQueueItem[] = nodes
    .filter(n => completedNodeIds.has(n.id))
    .map(node => ({
      node,
      status: 'completed',
      statusInfo: statusMap.get(node.id) || {
        status: 'completed',
        prerequisitesTotal: 0,
        prerequisitesCompleted: 0,
        missingPrerequisites: [],
      },
    }));

  return [...workingItems, ...completedItems];
}

/**
 * Computes overall graph statistics.
 */
export function calculateGraphStats(
  nodes: DSANode[],
  edges: DSAEdge[],
  userProgress: UserProgressMap
): GraphStats {
  const statusMap = calculateNodeStatuses(nodes, edges, userProgress);
  let completed = 0;
  let ready = 0;
  let locked = 0;

  statusMap.forEach(info => {
    if (info.status === 'completed') completed++;
    else if (info.status === 'ready') ready++;
    else if (info.status === 'locked') locked++;
  });

  const total = nodes.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, ready, locked, percentage };
}
