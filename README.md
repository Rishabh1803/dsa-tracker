# Interactive DSA Learning Dependency Graph & Topological Study Planner

An interactive, production-ready web application for tracking Data Structures & Algorithms learning progress using dependency graphs and Kahn's Topological Sorting algorithm.

---

## 🌟 Key Features

1. **Interactive Vis.js Graph Canvas**:
   - Directional arrows (`Prerequisite -> Target`).
   - Dynamic node color coding:
     - 🟢 **Completed**: Marked done in database/local progress.
     - 🟡 **Ready**: All prerequisites met, pending completion.
     - 🔒 **Locked**: Prerequisites unmet.
   - Interactive zoom, drag, node click inspection, and layout stabilization controls.

2. **Topological Study Path Generator**:
   - Runs **Kahn's Algorithm** client-side.
   - Outputs a linear study queue with prerequisite topics automatically ordered before dependent topics.
   - Filter by "Ready Now" ⚡, "Locked Queue" 🔒, or "Completed History" ✅.

3. **Node Inspector Drawer**:
   - Module category, Difficulty tag, and LeetCode/GeeksForGeeks problem links.
   - Prerequisite status checklist.
   - Toggle completion status with instant graph & queue updates.

4. **Admin Bulk CSV Importer**:
   - Utility interface to paste CSV rows formatted as: `Week, Type, Topic, Name, Difficulty, Link, Prerequisites`.
   - Batch parses, validates, and upserts nodes and edges.

5. **Multi-User Backend & Dual Mode**:
   - Full **Supabase (PostgreSQL + Auth)** integration with isolated user progress tables and RLS policies.
   - Includes **Guest / Local Storage Mode** fallback for instant offline/local testing.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Setup (Optional)

1. Create a project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase/schema.sql`](file:///d:/Programming/Development/DSA%20Tracker/supabase/schema.sql).
4. Create a `.env.local` file with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Restart the Next.js server (`npm run dev`).

---

## 🌐 Deploying to Vercel

1. Push your code to a GitHub repository.
2. Import the project into **Vercel**.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Vercel Environment Variables.
4. Click **Deploy**.
