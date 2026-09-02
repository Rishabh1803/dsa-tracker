'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle, Code2, ExternalLink } from 'lucide-react';
import { UserProgressMap } from '@/lib/types';
import { toggleNodeCompletionInDb } from '@/lib/supabase/client';

interface LeetCodeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  userKey?: string;
  onProgressUpdated: (updatedProgress: UserProgressMap, linkedHandle: string) => void;
}

export const LeetCodeSyncModal: React.FC<LeetCodeSyncModalProps> = ({
  isOpen,
  onClose,
  userKey,
  onProgressUpdated,
}) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dsa_tracker_linked_leetcode_handle');
      if (saved) setUsername(saved);
    }
  }, []);

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResultMessage(null);

    const cleanHandle = username.trim().toLowerCase();

    if (!userKey) {
      setError('Please log in to your account first before linking or syncing LeetCode.');
      return;
    }

    if (!cleanHandle) {
      setError('Please enter your LeetCode username.');
      return;
    }

    setLoading(true);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dsa_tracker_linked_leetcode_handle', cleanHandle);
      }

      const res = await fetch('/api/sync-leetcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanHandle }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to sync LeetCode progress.');
      }

      const matchedNodeIds: string[] = data.matchedNodeIds || [];
      let latestProgress: UserProgressMap = {};

      if (matchedNodeIds.length > 0) {
        for (const nodeId of matchedNodeIds) {
          latestProgress = await toggleNodeCompletionInDb(nodeId, false, userKey);
        }
      }

      onProgressUpdated(latestProgress, cleanHandle);
      onClose(); // Automatically close modal after successful account link & sync!
    } catch (err: any) {
      setError(err.message || 'Error syncing with LeetCode API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Link LeetCode Account</h3>
              <p className="text-xs text-slate-400">Connect once for 1-click auto-sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSync} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">LeetCode Username Handle</label>
            <div className="relative mt-1.5">
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. rishabh1803"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none font-semibold"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Once linked, your LeetCode handle is saved to your account. Clicking &quot;Sync&quot; will automatically verify your Accepted submissions without typing your handle again.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resultMessage && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{resultMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Linking & Verifying...' : 'Link & Sync Account'}</span>
          </button>
        </form>

        <div className="mt-4 border-t border-slate-800/80 pt-3 text-center">
          <a
            href="https://leetcode.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-400 hover:underline"
          >
            <span>Open LeetCode.com</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
