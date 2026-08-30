export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type NodeStatus = 'locked' | 'ready' | 'completed';

export interface DSANode {
  id: string;   // UUID PK
  slug: string; // display-only unique text identifier
  label: string;
  category: string;
  difficulty: Difficulty;
  url: string;  // Cleaned URL string
}

export interface DSAEdge {
  id?: string;
  from: string; // node id (UUID) or node slug during seed parsing
  to: string;   // node id (UUID) or node slug during seed parsing
}

export interface UserProgressRecord {
  id?: string;
  userId: string;
  nodeId: string; // references nodes.id (UUID)
  completedAt?: string;
}

export interface UserProgressMap {
  [nodeIdOrSlug: string]: boolean; // node completion status
}

export interface NodeStatusInfo {
  status: NodeStatus;
  prerequisitesTotal: number;
  prerequisitesCompleted: number;
  missingPrerequisites: string[]; // node IDs of uncompleted prerequisite nodes
}

export interface TopologicalQueueItem {
  node: DSANode;
  status: NodeStatus;
  statusInfo: NodeStatusInfo;
}

export interface GraphStats {
  total: number;
  completed: number;
  ready: number;
  locked: number;
  percentage: number;
}
