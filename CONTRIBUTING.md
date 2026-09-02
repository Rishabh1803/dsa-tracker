# Contributing to DSA Tracker

Thank you for your interest in contributing to **DSA Tracker**! We welcome contributions from developers of all skill levels.

This document outlines the process for contributing to this project, including coding standards, workflow guidelines, and how to submit pull requests.

---

## 📋 Open-Source Contribution Workflow

We follow a standard GitHub issue and pull request workflow:

```
GitHub Issue
  └─► Claim / assign issue
        └─► Fork repository
              └─► Create feature/fix branch
                    └─► Implement changes & verify locally
                          └─► Commit & push to your fork
                                └─► Open Pull Request (PR)
                                      └─► Code Review & Approval
                                            └─► Merge into main
```

---

## 🚀 Step-by-Step Guide

### 1. Find or Create an Issue
Before starting work, browse existing [GitHub Issues](https://github.com/Rishabh1803/dsa-tracker/issues). If you plan to fix a bug or add a new feature:
- Comment on the issue to let others know you are working on it.
- If no issue exists for your intended work, please open a new issue first to discuss the proposed change.

### 2. Fork and Clone the Repository
Fork the repository to your GitHub account, then clone it locally:

```bash
git clone https://github.com/YOUR-USERNAME/dsa-tracker.git
cd dsa-tracker
```

### 3. Install Dependencies
Ensure you have **Node.js (v18+)** installed, then run:

```bash
npm install
```

### 4. Create a Feature/Fix Branch
Create a descriptive branch off `main`:

```bash
git checkout -b fix/issue-9-encoding-artifacts
# or for new features:
git checkout -b feature/add-dark-mode-toggle
```

### 5. Make Your Changes
Implement your changes while preserving existing functionality and coding styles:
- **TypeScript**: Write strictly typed code (`tsconfig.json` enforces `strict`).
- **React Components**: Use functional components with PascalCase filenames (e.g., `GraphCanvas.tsx`).
- **Styling**: Prefer Tailwind CSS utility classes.
- **Imports**: Use the `@/*` alias for imports from `src/` (e.g., `@/lib/types`).

### 6. Verify Your Changes Locally
Start the development server to verify user flows:

```bash
npm run dev
```

Before committing, **you MUST run both linting and build validation**:

```bash
# 1. Run Next.js lint check
npm run lint

# 2. Perform production build & TypeScript type-check
npm run build
```

Both commands must complete cleanly with **0 errors**.

### 7. Commit Your Changes
Write clear, concise commit messages using an imperative subject line:

```bash
git add .
git commit -m "Fix UI text encoding artifacts in node labels"
```

Good commit subject prefixes: `Add`, `Fix`, `Update`, `Enforce`, `Refactor`.

### 8. Push to Your Fork
Push your branch to your GitHub fork:

```bash
git push origin fix/issue-9-encoding-artifacts
```

### 9. Open a Pull Request
Go to the original repository on GitHub ([Rishabh1803/dsa-tracker](https://github.com/Rishabh1803/dsa-tracker)) and click **Compare & pull request**.

Fill out the Pull Request template completely:
- **Title**: Imperative description (e.g., `Fix UI text encoding artifacts in node labels`).
- **Description**: Summary of changes and rationale.
- **Related Issue**: Reference the issue number (e.g., `Fixes #9` or `Closes #9`).
- **Testing Performed**: State the verification commands run (`npm run lint`, `npm run build`) and manual checks performed.
- **Screenshots / Media**: Include screenshots or screen recordings for any visual UI or graph changes.

---

## 🛠️ Project Structure Overview

- `src/app/`: Next.js 14 App Router routes and page components.
- `src/components/`: Reusable React UI components (`GraphCanvas`, `FilterBar`, `NodeInspector`, etc.).
- `src/lib/`: Domain types (`types.ts`), graph algorithms (`topoSort.ts`), seed data (`seedData.ts`), and Supabase helpers.
- `supabase/`: Database schema (`schema.sql`) and utility scripts.

---

## 📜 Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please be respectful, inclusive, and constructive in all communications.

---

## ❓ Need Help?

If you have questions or need guidance on an issue, feel free to comment directly on the relevant GitHub Issue or reach out to the maintainers.
