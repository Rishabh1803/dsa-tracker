'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { DSANode, DSAEdge } from '@/lib/types';
import { generateDeterministicUuid, cleanUrl } from '@/lib/seedData';
import { saveLocalNodes, saveLocalEdges, supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { validateGraphCycles } from '../../supabase/cycleCheck';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Database, Sparkles, XCircle } from 'lucide-react';

interface AdminImporterProps {
  currentNodes: DSANode[];
  currentEdges: DSAEdge[];
  onDataUpdated: (newNodes: DSANode[], newEdges: DSAEdge[]) => void;
}

const SAMPLE_CSV = `Week,Type,Topic,Name,Difficulty,Link,Prerequisites,Notes
Week 1,Array,Arrays,Running Sum of 1d Array,Easy,https://leetcode.com/problems/running-sum-of-1d-array/,,Foundational prefix sum
Week 1,Array,Arrays,Subarray Sum Equals K,Medium,https://leetcode.com/problems/subarray-sum-equals-k/,running-sum;two-sum,Hash map prefix sum
Week 2,Graph,Graphs,Depth First Traversal,Easy,https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1,,DFS graph traversal
Week 2,Graph,Graphs,Topological Sort,Medium,https://www.geeksforgeeks.org/problems/topological-sort/1,detect-cycle-directed,Kahn algorithm`;

export const AdminImporter: React.FC<AdminImporterProps> = ({
  currentNodes,
  currentEdges,
  onDataUpdated,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{ nodes: DSANode[]; edges: DSAEdge[] } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleParseAndValidateCsv = () => {
    setStatusMessage(null);
    setParsedPreview(null);

    if (!csvText.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste or upload CSV content before validating.' });
      return;
    }

    Papa.parse(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const newNodesMap = new Map<string, DSANode>();
          const rawEdgesList: { fromSlug: string; toSlug: string }[] = [];

          // Map existing slugs to IDs
          const slugToIdMap = new Map<string, string>();
          currentNodes.forEach(n => slugToIdMap.set(n.slug, n.id));

          results.data.forEach((row: any) => {
            const label = row.Name || row.label || row.Topic || '';
            if (!label) return;

            const slug = row.Slug || label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const category = row.Topic || row.Type || row.category || 'General';
            let difficulty = row.Difficulty || row.difficulty || 'Easy';
            if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
              difficulty = 'Easy';
            }
            const url = cleanUrl(row.Link || row.url || 'https://leetcode.com');

            const id = slugToIdMap.get(slug) || generateDeterministicUuid(slug);
            slugToIdMap.set(slug, id);

            const newNode: DSANode = {
              id,
              slug,
              label,
              category,
              difficulty: difficulty as any,
              url,
            };

            newNodesMap.set(slug, newNode);

            // Handle Prerequisites column (comma or semicolon separated slugs)
            const prereqsRaw = row.Prerequisites || row.prerequisites || '';
            if (prereqsRaw) {
              const prereqSlugs = prereqsRaw.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean);
              prereqSlugs.forEach((pSlug: string) => {
                rawEdgesList.push({
                  fromSlug: pSlug,
                  toSlug: slug,
                });
              });
            }
          });

          const parsedNodes = Array.from(newNodesMap.values());
          if (parsedNodes.length === 0) {
            setStatusMessage({ type: 'error', text: 'No valid rows found in CSV. Check column headers.' });
            return;
          }

          // Merge current nodes with parsed nodes to form candidate graph
          const candidateNodeMap = new Map(currentNodes.map(n => [n.slug, n]));
          parsedNodes.forEach(n => candidateNodeMap.set(n.slug, n));
          const candidateNodes = Array.from(candidateNodeMap.values());

          // Build candidate edges and check for dangling prerequisite references
          const candidateEdges: DSAEdge[] = [...currentEdges];
          const missingPrereqs: string[] = [];

          rawEdgesList.forEach(rawEdge => {
            const fromId = slugToIdMap.get(rawEdge.fromSlug);
            const toId = slugToIdMap.get(rawEdge.toSlug);

            if (!fromId) {
              missingPrereqs.push(rawEdge.fromSlug);
            } else if (toId) {
              candidateEdges.push({
                id: generateDeterministicUuid(`edge-${fromId}->${toId}`),
                from: fromId,
                to: toId,
              });
            }
          });

          if (missingPrereqs.length > 0) {
            setStatusMessage({
              type: 'error',
              text: `Validation Rejected: Declared prerequisite(s) "${Array.from(new Set(missingPrereqs)).join(', ')}" do not exist in the curriculum.`,
            });
            return;
          }

          // Run Phase 0 Cycle Detection on candidate graph
          const cycleCheck = validateGraphCycles(candidateNodes, candidateEdges);
          if (cycleCheck.hasCycle) {
            setStatusMessage({
              type: 'error',
              text: `Validation Rejected: This import would introduce a circular dependency cycle: ${cycleCheck.cyclePath?.join(' ➔ ')}`,
            });
            return;
          }

          setParsedPreview({ nodes: parsedNodes, edges: candidateEdges });
          setStatusMessage({
            type: 'success',
            text: `Validation Passed! CSV parsed ${parsedNodes.length} nodes and verified 100% DAG graph integrity with 0 cycles and 0 orphan edges.`,
          });
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: `CSV Parsing error: ${err.message}` });
        }
      },
    });
  };

  const handleApplyUpsert = async () => {
    if (!parsedPreview) return;

    // Merge parsed nodes with existing nodes
    const nodeMap = new Map(currentNodes.map(n => [n.slug, n]));
    parsedPreview.nodes.forEach(n => nodeMap.set(n.slug, n));
    const mergedNodes = Array.from(nodeMap.values());

    saveLocalNodes(mergedNodes);
    saveLocalEdges(parsedPreview.edges);

    if (isSupabaseConfigured && supabase) {
      try {
        const nodeInserts = parsedPreview.nodes.map(n => ({
          id: n.id,
          slug: n.slug,
          label: n.label,
          category: n.category,
          difficulty: n.difficulty,
          url: n.url,
        }));

        await supabase.from('nodes').upsert(nodeInserts, { onConflict: 'slug' });
      } catch (e) {
        console.error('Supabase bulk upsert error:', e);
      }
    }

    onDataUpdated(mergedNodes, parsedPreview.edges);
    setParsedPreview(null);
    setCsvText('');
    setStatusMessage({
      type: 'success',
      text: `Curriculum updated! Batch imported ${parsedPreview.nodes.length} nodes into the graph.`,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Database className="h-5 w-5 text-emerald-400" />
            <span>Phase 5 Admin Curriculum & CSV Importer</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Paste CSV formatted as: <code className="text-emerald-400">Week, Type, Topic, Name, Difficulty, Link, Prerequisites</code>
          </p>
        </div>

        <button
          onClick={() => setCsvText(SAMPLE_CSV)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Load Sample CSV</span>
        </button>
      </div>

      {/* Input Textarea */}
      <div>
        <textarea
          rows={8}
          placeholder="Paste CSV text here..."
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`flex items-start gap-2.5 rounded-xl p-4 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border border-rose-500/30 bg-rose-500/10 text-rose-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleParseAndValidateCsv}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
        >
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>Parse & Validate DAG</span>
        </button>

        {parsedPreview && (
          <button
            onClick={handleApplyUpsert}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Commit {parsedPreview.nodes.length} Nodes to Curriculum</span>
          </button>
        )}
      </div>

      {/* Parsed Preview Table */}
      {parsedPreview && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
            Validated Nodes Preview ({parsedPreview.nodes.length})
          </h3>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 sticky top-0 bg-slate-900">
                <tr>
                  <th className="py-2 px-3">UUID ID</th>
                  <th className="py-2 px-3">Slug</th>
                  <th className="py-2 px-3">Label</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {parsedPreview.nodes.map(n => (
                  <tr key={n.slug} className="border-b border-slate-800/50 hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono text-[10px] text-slate-500">{n.id.slice(0, 8)}...</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-emerald-400">{n.slug}</td>
                    <td className="py-2 px-3 font-medium text-white">{n.label}</td>
                    <td className="py-2 px-3 text-slate-400">{n.category}</td>
                    <td className="py-2 px-3">{n.difficulty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
