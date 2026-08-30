# Complete Deployment & Hosting Guide (Vercel + Supabase)

This guide walks you through deploying the **Interactive DSA Learning Dependency Graph & Topological Study Planner** live to **Vercel** with **Supabase (PostgreSQL + Auth)**.

---

## 🗄️ Step 1: Set Up Supabase Database & Auth

1. Go to [Supabase.com](https://supabase.com) and sign in / create a free account.
2. Click **New Project**, select an organization, name your project (e.g. `dsa-graph-tracker`), set a database password, and choose your preferred region.
3. Once the database is provisioned, click **SQL Editor** in the left sidebar menu.
4. Click **New Query**, then copy and paste the full contents of [`supabase/schema.sql`](file:///d:/Programming/Development/DSA%20Tracker/supabase/schema.sql).
5. Click **Run** (or `Ctrl+Enter`). This will:
   - Create the `nodes`, `edges`, and `user_progress` relational tables.
   - Set up Row Level Security (RLS) policies for multi-user isolation.
   - Insert all 205 seed nodes and 66 prerequisite edges into your live database.
6. Navigate to **Project Settings ➔ API** in the Supabase dashboard and copy your two credentials:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **anon / public key** (e.g. `eyJhbGciOi...`)

---

## 📦 Step 2: Push Code to GitHub

Open a terminal in `d:\Programming\Development\DSA Tracker` and run:

```bash
git init
git add .
git commit -m "Initial commit: DSA Dependency Graph & Topological Study Planner"
```

Create a new repository on [GitHub](https://github.com/new) and link your remote:

```bash
git remote add origin https://github.com/YOUR_USERNAME/dsa-tracker.git
git branch -M main
git push -u origin main
```

---

## 🚀 Step 3: Deploy to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New... ➔ Project**.
3. Import your GitHub repository (`dsa-tracker`).
4. In the **Configure Project** screen, expand **Environment Variables** and add:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | *Your Supabase Project URL* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Your Supabase Anon Public Key* |

5. Click **Deploy**.

Vercel will automatically build and deploy your Next.js application in ~1-2 minutes!

---

## 🔒 Optional: Supabase Auth Email Confirmation Settings

By default, Supabase requires users to click an email confirmation link upon signing up. If you want instant sign-up without email confirmation:
1. Go to **Authentication ➔ Providers ➔ Email** in your Supabase dashboard.
2. Uncheck **Confirm Email**.
3. Click **Save**.

Your production deployment is now 100% live with real-time multi-user dependency graph tracking!
