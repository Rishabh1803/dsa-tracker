import { seedNodes, seedEdges } from '../src/lib/seedData';
import fs from 'fs';
import path from 'path';

const sqlHeader = `-- Supabase Database Migration & Schema (Full 205 Nodes + 66 Edges)

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  to_node UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_edge UNIQUE (from_node, to_node)
);

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_node UNIQUE (user_id, node_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Nodes & Edges: Readable by all authenticated users & public
DROP POLICY IF EXISTS "Nodes are viewable by everyone" ON public.nodes;
CREATE POLICY "Nodes are viewable by everyone" ON public.nodes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Edges are viewable by everyone" ON public.edges;
CREATE POLICY "Edges are viewable by everyone" ON public.edges FOR SELECT USING (true);

-- Admin mutation policies
DROP POLICY IF EXISTS "Admin can insert nodes" ON public.nodes;
CREATE POLICY "Admin can insert nodes" ON public.nodes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update nodes" ON public.nodes;
CREATE POLICY "Admin can update nodes" ON public.nodes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admin can insert edges" ON public.edges;
CREATE POLICY "Admin can insert edges" ON public.edges FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update edges" ON public.edges;
CREATE POLICY "Admin can update edges" ON public.edges FOR UPDATE USING (true);

-- User Progress Policies
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own progress" ON public.user_progress;
CREATE POLICY "Users can delete their own progress" ON public.user_progress FOR DELETE USING (auth.uid() = user_id);

-- 4. Full Curriculum Node Inserts
TRUNCATE TABLE public.nodes CASCADE;

`;

const nodeInserts = seedNodes.map(n => {
  const labelEscaped = n.label.replace(/'/g, "''");
  const catEscaped = n.category.replace(/'/g, "''");
  const urlEscaped = n.url.replace(/'/g, "''");
  return `  ('${n.id}', '${n.slug}', '${labelEscaped}', '${catEscaped}', '${n.difficulty}', '${urlEscaped}')`;
}).join(',\n');

const sqlNodes = `INSERT INTO public.nodes (id, slug, label, category, difficulty, url) VALUES\n${nodeInserts}\nON CONFLICT (slug) DO UPDATE SET\n  id = EXCLUDED.id,\n  label = EXCLUDED.label,\n  category = EXCLUDED.category,\n  difficulty = EXCLUDED.difficulty,\n  url = EXCLUDED.url;\n\n`;

const edgeInserts = seedEdges.map(e => {
  const edgeId = e.id || 'gen_random_uuid()';
  return `  ('${edgeId}', '${e.from}', '${e.to}')`;
}).join(',\n');

const sqlEdges = `INSERT INTO public.edges (id, from_node, to_node) VALUES\n${edgeInserts}\nON CONFLICT (from_node, to_node) DO NOTHING;\n`;

const fullSql = sqlHeader + sqlNodes + sqlEdges;

const outputPath = path.join(__dirname, 'schema.sql');
fs.writeFileSync(outputPath, fullSql, 'utf-8');

console.log(`Generated complete schema.sql with ${seedNodes.length} nodes and ${seedEdges.length} edges!`);
