-- Supabase Database Migration & Schema (Phase 0 Compliant)

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
-- Nodes & Edges: Readable by all authenticated users & public, writable by admins only
CREATE POLICY "Nodes are viewable by everyone" ON public.nodes FOR SELECT USING (true);
CREATE POLICY "Edges are viewable by everyone" ON public.edges FOR SELECT USING (true);

-- Admin mutation policies (role check)
CREATE POLICY "Admin can insert nodes" ON public.nodes FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
CREATE POLICY "Admin can update nodes" ON public.nodes FOR UPDATE USING (
  auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
CREATE POLICY "Admin can insert edges" ON public.edges FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
CREATE POLICY "Admin can update edges" ON public.edges FOR UPDATE USING (
  auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- User Progress: Readable/writable strictly by the authenticated user owner
CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "Users can delete their own progress" ON public.user_progress FOR DELETE USING (
  auth.uid() = user_id
);

-- 4. Dynamic SQL Seed Insert Generator Procedure / Statements
-- Insert Nodes
INSERT INTO public.nodes (id, slug, label, category, difficulty, url) VALUES
  ('4b18ec00-000b-4000-8000-4b18ec000000', 'running-sum', 'Running Sum of 1d Array', 'Arrays', 'Easy', 'https://leetcode.com/problems/running-sum-of-1d-array/'),
  ('5039f600-000b-4000-8000-5039f6000000', 'even-digits', 'Numbers with Even Digits', 'Arrays', 'Easy', 'https://leetcode.com/problems/find-numbers-with-even-number-of-digits/'),
  ('5e6bd400-0009-4000-8000-5e6bd4000000', 'max-words', 'Max Words in Sentences', 'Arrays', 'Easy', 'https://leetcode.com/problems/maximum-number-of-words-found-in-sentences/'),
  ('58ef3000-0007-4000-8000-58ef30000000', 'stock-1', 'Best Time to Buy and Sell Stock', 'Arrays', 'Easy', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/'),
  ('43fcb400-0007-4000-8000-43fcb4000000', 'two-sum', 'Two Sum', 'Arrays', 'Easy', 'https://leetcode.com/problems/two-sum/'),
  ('1e405a00-000c-4000-8000-1e405a000000', 'max-subarray', 'Maximum Subarray (Kadane)', 'Arrays', 'Medium', 'https://leetcode.com/problems/maximum-subarray/'),
  ('61205600-0013-4000-8000-612056000000', 'product-except-self', 'Product of Array Except Self', 'Arrays', 'Medium', 'https://leetcode.com/problems/product-of-array-except-self/'),
  ('026c2600-000f-4000-8000-026c26000000', 'subarray-sum-k', 'Subarray Sum Equals K', 'Arrays', 'Medium', 'https://leetcode.com/problems/subarray-sum-equals-k/'),
  ('0390ea00-0010-4000-8000-0390ea000000', 'contiguous-array', 'Contiguous Array', 'Arrays', 'Medium', 'https://leetcode.com/problems/contiguous-array/'),
  ('165d2800-000f-4000-8000-165d28000000', 'subarray-div-k', 'Subarray Sums Divisible by K', 'Arrays', 'Medium', 'https://leetcode.com/problems/subarray-sums-divisible-by-k/')
ON CONFLICT (slug) DO UPDATE SET
  label = EXCLUDED.label,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  url = EXCLUDED.url;
