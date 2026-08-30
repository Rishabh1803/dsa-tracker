import { createClient } from '@supabase/supabase-js';
import { DSANode, DSAEdge, UserProgressMap } from '../types';
import { seedNodes, seedEdges } from '../seedData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const PROGRESS_STORAGE_KEY = 'dsa_tracker_user_progress_v2';
const NODES_STORAGE_KEY = 'dsa_tracker_nodes_v2';
const EDGES_STORAGE_KEY = 'dsa_tracker_edges_v2';

// Helper for Local Storage progress isolation per user
export function getLocalProgress(userIdOrEmail?: string): UserProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const storageKey = userIdOrEmail
      ? `dsa_tracker_progress_${userIdOrEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      : PROGRESS_STORAGE_KEY;
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveLocalProgress(progress: UserProgressMap, userIdOrEmail?: string) {
  if (typeof window === 'undefined') return;
  try {
    const storageKey = userIdOrEmail
      ? `dsa_tracker_progress_${userIdOrEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      : PROGRESS_STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save local progress:', e);
  }
}

export function getLocalNodes(): DSANode[] {
  if (typeof window === 'undefined') return seedNodes;
  try {
    const raw = localStorage.getItem(NODES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedNodes;
  } catch {
    return seedNodes;
  }
}

export function saveLocalNodes(nodes: DSANode[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(nodes));
  } catch (e) {
    console.error('Failed to save local nodes:', e);
  }
}

export function getLocalEdges(): DSAEdge[] {
  if (typeof window === 'undefined') return seedEdges;
  try {
    const raw = localStorage.getItem(EDGES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedEdges;
  } catch {
    return seedEdges;
  }
}

export function saveLocalEdges(edges: DSAEdge[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EDGES_STORAGE_KEY, JSON.stringify(edges));
  } catch (e) {
    console.error('Failed to save local edges:', e);
  }
}

// Unified API for database/local fetch & mutate operations
export async function fetchNodesAndEdges(): Promise<{ nodes: DSANode[]; edges: DSAEdge[] }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const [{ data: nodesData, error: nErr }, { data: edgesData, error: eErr }] = await Promise.all([
        supabase.from('nodes').select('*'),
        supabase.from('edges').select('*'),
      ]);

      if (!nErr && nodesData && nodesData.length > 0) {
        const nodes: DSANode[] = nodesData.map((n: any) => ({
          id: n.id,
          slug: n.slug,
          label: n.label,
          category: n.category,
          difficulty: n.difficulty,
          url: n.url,
        }));

        const edges: DSAEdge[] = (edgesData || []).map((e: any) => ({
          id: e.id,
          from: e.from_node,
          to: e.to_node,
        }));

        return { nodes, edges };
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to seed data:', e);
    }
  }

  return {
    nodes: getLocalNodes(),
    edges: getLocalEdges(),
  };
}

export async function fetchUserProgress(userIdOrEmail?: string): Promise<UserProgressMap> {
  if (isSupabaseConfigured && supabase && userIdOrEmail && !userIdOrEmail.includes('@')) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('node_id')
        .eq('user_id', userIdOrEmail);

      if (!error && data) {
        const progressMap: UserProgressMap = {};
        data.forEach((row: any) => {
          progressMap[row.node_id] = true;
        });
        return progressMap;
      }
    } catch (e) {
      console.warn('Supabase user progress fetch error:', e);
    }
  }

  return getLocalProgress(userIdOrEmail);
}

export async function toggleNodeCompletionInDb(
  nodeId: string,
  currentlyCompleted: boolean,
  userIdOrEmail?: string
): Promise<UserProgressMap> {
  const newCompleted = !currentlyCompleted;

  if (isSupabaseConfigured && supabase && userIdOrEmail && !userIdOrEmail.includes('@')) {
    try {
      if (newCompleted) {
        await supabase.from('user_progress').insert([{ user_id: userIdOrEmail, node_id: nodeId }]);
      } else {
        await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', userIdOrEmail)
          .eq('node_id', nodeId);
      }
      return fetchUserProgress(userIdOrEmail);
    } catch (e) {
      console.error('Supabase toggle error:', e);
    }
  }

  // Local storage isolated toggle
  const curr = getLocalProgress(userIdOrEmail);
  if (newCompleted) {
    curr[nodeId] = true;
  } else {
    delete curr[nodeId];
  }
  saveLocalProgress(curr, userIdOrEmail);
  return { ...curr };
}
