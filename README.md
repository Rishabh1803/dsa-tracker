# Interactive DSA Learning Dependency Graph & Topological Study Planner

An interactive, production-ready web application for tracking Data Structures & Algorithms learning progress using dependency graphs and Kahn's Topological Sorting algorithm.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

---

## 🌟 Key Features

1. **Interactive Vis.js Graph Canvas**:
   - Directional dependency arrows (`Prerequisite -> Target`).
   - Dynamic node color coding:
     - 🟢 **Completed**: Marked done in database/local progress.
     - 🟡 **Ready**: All prerequisites met, pending completion.
     - 🔒 **Locked**: Prerequisites unmet.
   - Interactive zoom, drag, node click inspection, layout stabilization, and dual layout modes (**Spacious Cluster** and **Module Grid**).

2. **Topological Study Path Generator**:
   - Runs **Kahn's Algorithm** client-side.
   - Outputs a linear study queue with prerequisite topics automatically ordered before dependent topics.
   - Synchronized with category, difficulty, status, and search filters.

3. **Node Inspector Drawer**:
   - Module category, difficulty tag, and LeetCode/GeeksForGeeks problem links.
   - Prerequisite status checklist.
   - Strict prerequisite enforcement preventing manual completion of locked topics.

4. **LeetCode GraphQL Account Linking**:
   - 1-click verification & progress synchronization directly from public LeetCode handles.

5. **Admin Bulk CSV Importer**:
   - Utility interface to paste CSV rows formatted as: `Week, Type, Topic, Name, Difficulty, Link, Prerequisites`.
   - Batch parses, validates, and upserts nodes and edges.

6. **Multi-User Backend & Dual Mode**:
   - Full **Supabase (PostgreSQL + Auth)** integration with isolated user progress tables and RLS policies.
   - Guest / Local Storage Mode fallback for instant offline/local testing.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **UI Library**: [React 18](https://react.dev/) & [Tailwind CSS](https://tailwindcss.com/)
- **Graph Visualization**: [Vis-Network](https://visjs.github.io/vis-network/docs/network/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with RLS)
- **CSV Parsing**: [PapaParse](https://www.papaparse.com/)

---

## 📋 Prerequisites

Before running the project locally, ensure you have the following installed:

- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher

---

## 🚀 Quick Start & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Rishabh1803/dsa-tracker.git
cd dsa-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Setup (Optional)

The application runs out-of-the-box in **Guest Mode** using browser local storage. To enable multi-user cloud synchronization:

1. Create a project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
4. Create a `.env.local` file in the root directory (use `.env.example` as a template):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

5. Restart the development server (`npm run dev`).

---

## 🧪 Available Scripts

- `npm run dev`: Starts local Next.js development server at `http://localhost:3000`.
- `npm run lint`: Runs Next.js ESLint check.
- `npm run build`: Performs TypeScript type checks and creates production build bundle.
- `npm run start`: Runs production server build.

---

## 🤝 How to Contribute

We welcome contributions from the community! Whether you are fixing a bug, adding new features, or improving documentation, please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on our workflow, coding standards, and pull request process.

Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
