'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { FilterBar } from '@/components/FilterBar';
import { GraphCanvas } from '@/components/GraphCanvas';
import { NodeInspector } from '@/components/NodeInspector';
import { TopologicalPlanner } from '@/components/TopologicalPlanner';
import { AdminImporter } from '@/components/AdminImporter';
import { LeetCodeSyncModal } from '@/components/LeetCodeSyncModal';
import { DSANode, DSAEdge, UserProgressMap } from '@/lib/types';
import { calculateGraphStats } from '@/lib/topoSort';
import {
  fetchNodesAndEdges,
  fetchUserProgress,
  toggleNodeCompletionInDb,
  supabase,
  isSupabaseConfigured,
} from '@/lib/supabase/client';
import { X, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const [nodes, setNodes] = useState<DSANode[]>([]);
  const [edges, setEdges] = useState<DSAEdge[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressMap>({});
  const [loading, setLoading] = useState(true);

  // Active View Tab: 'graph' | 'plan' | 'admin'
  const [activeTab, setActiveTab] = useState<'graph' | 'plan' | 'admin'>('graph');

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Node Inspector Drawer State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Auth State & Auth Modal
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeetCodeModal, setShowLeetCodeModal] = useState(false);
  const [leetcodeHandle, setLeetcodeHandle] = useState<string | null>(null);
  const [isSyncingLeetCode, setIsSyncingLeetCode] = useState(false);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Initial Load: Fetch nodes, edges, active session, user progress & linked LeetCode handle
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { nodes: loadedNodes, edges: loadedEdges } = await fetchNodesAndEdges();
      setNodes(loadedNodes);
      setEdges(loadedEdges);

      let activeUserKey: string | undefined = undefined;

      // 1. Check Supabase Auth Session if configured
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const u = { id: data.session.user.id, email: data.session.user.email };
          setUser(u);
          activeUserKey = u.id;
        }

        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const u = { id: session.user.id, email: session.user.email };
            setUser(u);
            const p = await fetchUserProgress(u.id);
            setUserProgress(p);
          } else if (_event === 'SIGNED_OUT') {
            setUser(null);
            setUserProgress({});
          }
        });
      }

      // 2. Fallback: Check local user session only if Supabase is NOT configured
      if (!isSupabaseConfigured && !activeUserKey && typeof window !== 'undefined') {
        const savedUserRaw = localStorage.getItem('dsa_tracker_current_user');
        if (savedUserRaw) {
          try {
            const parsedUser = JSON.parse(savedUserRaw);
            setUser(parsedUser);
            activeUserKey = parsedUser.id || parsedUser.email;
          } catch (e) {
            console.error('Error parsing saved local user session:', e);
          }
        }
      }

      // Restore linked LeetCode handle
      let savedHandle: string | null = null;
      if (typeof window !== 'undefined') {
        savedHandle = localStorage.getItem('dsa_tracker_linked_leetcode_handle');
        setLeetcodeHandle(savedHandle);
      }

      const p = await fetchUserProgress(activeUserKey);
      setUserProgress(p);
      setLoading(false);

      // Auto-sync LeetCode in background on initial load if user is logged in
      if (savedHandle && activeUserKey) {
        handleQuickLeetCodeSync(savedHandle, activeUserKey);
      }
    }

    loadData();
  }, []);

  // Compute Categories list for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    nodes.forEach(n => set.add(n.category));
    return Array.from(set).sort();
  }, [nodes]);

  // Calculate Graph Stats (% completion, ready count, locked count)
  const stats = useMemo(() => {
    return calculateGraphStats(nodes, edges, userProgress);
  }, [nodes, edges, userProgress]);

  // Handle completion toggle
  const handleToggleCompletion = async (nodeId: string, currentlyCompleted: boolean) => {
    const userKey = user?.id || user?.email;
    const updatedProgress = await toggleNodeCompletionInDb(nodeId, currentlyCompleted, userKey);
    setUserProgress(updatedProgress);
  };

  // Quick 1-Click LeetCode Sync handler
  const handleQuickLeetCodeSync = async (handleToSync?: string, overrideUserKey?: string) => {
    const userKey = overrideUserKey || user?.id || user?.email;
    if (!userKey) {
      setShowAuthModal(true);
      return;
    }

    const handle = handleToSync || leetcodeHandle;
    if (!handle) {
      setShowLeetCodeModal(true);
      return;
    }

    setIsSyncingLeetCode(true);

    try {
      const res = await fetch('/api/sync-leetcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: handle }),
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.matchedNodeIds)) {
        let updatedProgress: UserProgressMap = {};
        for (const nodeId of data.matchedNodeIds) {
          updatedProgress = await toggleNodeCompletionInDb(nodeId, false, userKey);
        }
        if (data.matchedNodeIds.length > 0) {
          setUserProgress(updatedProgress);
        }
      }
    } catch (e) {
      console.warn('Quick LeetCode sync background warning:', e);
    } finally {
      setIsSyncingLeetCode(false);
    }
  };

  // Auth Handler: Strictly Enforces Supabase Auth Rules
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!email || !password) {
      setAuthError('Please enter email and password.');
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (authMode === 'signup') {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) {
            if (error.message.toLowerCase().includes('rate limit')) {
              setAuthError('Supabase Email Rate Limit Exceeded. Please uncheck "Confirm Email" in your Supabase Dashboard ➔ Auth ➔ Providers ➔ Email for instant signup.');
            } else {
              setAuthError(error.message);
            }
            return;
          }
          if (data.user) {
            if (data.session) {
              const u = { id: data.user.id, email: data.user.email };
              setUser(u);
              const p = await fetchUserProgress(u.id);
              setUserProgress(p);
              setShowAuthModal(false);
            } else {
              setAuthError('Account created! Please check your email to confirm your account or disable email confirmation in Supabase settings.');
            }
            return;
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            setAuthError(error.message);
            return;
          }
          if (data.user) {
            const u = { id: data.user.id, email: data.user.email };
            setUser(u);
            const p = await fetchUserProgress(u.id);
            setUserProgress(p);
            setShowAuthModal(false);
            return;
          }
        }
      } catch (err: any) {
        setAuthError(err.message || 'Authentication error.');
        return;
      }
      return;
    }

    const localUser = { id: email.toLowerCase().trim(), email: email.toLowerCase().trim() };
    setUser(localUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dsa_tracker_current_user', JSON.stringify(localUser));
    }
    const p = await fetchUserProgress(localUser.email);
    setUserProgress(p);
    setShowAuthModal(false);
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dsa_tracker_current_user');
    }
    const p = await fetchUserProgress();
    setUserProgress(p);
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedStatus('All');
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950">
      
      {/* Navigation Header */}
      <Navbar
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={user?.email}
        leetcodeHandle={leetcodeHandle}
        isSyncingLeetCode={isSyncingLeetCode}
        onOpenAuth={() => {
          setAuthError('');
          setShowAuthModal(true);
        }}
        onOpenLeetCodeSync={() => setShowLeetCodeModal(true)}
        onQuickLeetCodeSync={() => handleQuickLeetCodeSync()}
        onSignOut={handleSignOut}
      />

      {/* Main App Canvas / Tab Views */}
      <main className="flex flex-1 overflow-hidden p-3 sm:p-4 gap-4">
        
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <span className="text-xs font-semibold text-slate-400">Loading DSA Curriculum & User Session...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden gap-3 sm:gap-4">
            
            {/* Filter Controls */}
            {activeTab !== 'admin' && (
              <FilterBar
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedDifficulty={selectedDifficulty}
                setSelectedDifficulty={setSelectedDifficulty}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onReset={resetFilters}
              />
            )}

            {/* TAB 1: Graph View */}
            {activeTab === 'graph' && (
              <div className="relative flex-1 overflow-hidden">
                <GraphCanvas
                  nodes={nodes}
                  edges={edges}
                  userProgress={userProgress}
                  onSelectNode={id => setSelectedNodeId(id)}
                  selectedNodeId={selectedNodeId}
                  filterCategory={selectedCategory}
                  filterDifficulty={selectedDifficulty}
                  filterStatus={selectedStatus}
                  searchQuery={searchQuery}
                />
              </div>
            )}

            {/* TAB 2: Topological Study Path Plan */}
            {activeTab === 'plan' && (
              <div className="flex-1 overflow-hidden">
                <TopologicalPlanner
                  nodes={nodes}
                  edges={edges}
                  userProgress={userProgress}
                  filterCategory={selectedCategory}
                  filterDifficulty={selectedDifficulty}
                  filterStatus={selectedStatus}
                  searchQuery={searchQuery}
                  onToggleCompletion={handleToggleCompletion}
                  onSelectNode={id => {
                    setSelectedNodeId(id);
                    setActiveTab('graph');
                  }}
                />
              </div>
            )}

            {/* TAB 3: Admin Bulk CSV Importer */}
            {activeTab === 'admin' && (
              <div className="flex-1 overflow-y-auto">
                <AdminImporter
                  currentNodes={nodes}
                  currentEdges={edges}
                  onDataUpdated={(newNodes, newEdges) => {
                    setNodes(newNodes);
                    setEdges(newEdges);
                  }}
                />
              </div>
            )}

          </div>
        )}

      </main>

      {/* Node Inspector Side Drawer */}
      {selectedNodeId && (
        <NodeInspector
          nodeIdOrSlug={selectedNodeId}
          nodes={nodes}
          edges={edges}
          userProgress={userProgress}
          onToggleCompletion={handleToggleCompletion}
          onClose={() => setSelectedNodeId(null)}
          onSelectNode={id => setSelectedNodeId(id)}
        />
      )}

      {/* LeetCode Sync Modal */}
      <LeetCodeSyncModal
        isOpen={showLeetCodeModal}
        onClose={() => setShowLeetCodeModal(false)}
        userKey={user?.id || user?.email}
        onProgressUpdated={(updatedProgress, linkedHandle) => {
          setLeetcodeHandle(linkedHandle);
          if (Object.keys(updatedProgress).length > 0) {
            setUserProgress(updatedProgress);
          }
        }}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {authMode === 'login' ? 'Log In to Tracker' : 'Create Account'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isSupabaseConfigured
                    ? 'Protected with Supabase Authentication'
                    : 'Offline Mode (Local Storage)'}
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {authError && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition"
              >
                {authMode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                <span>{authMode === 'login' ? 'Log In' : 'Sign Up'}</span>
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-slate-400">
              {authMode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthError('');
                      setAuthMode('signup');
                    }}
                    className="font-bold text-emerald-400 hover:underline"
                  >
                    Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    onClick={() => {
                      setAuthError('');
                      setAuthMode('login');
                    }}
                    className="font-bold text-emerald-400 hover:underline"
                  >
                    Log In
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
