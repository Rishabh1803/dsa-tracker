import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DSA Tracker | Interactive Dependency Graph & Topological Study Planner',
  description: 'Interactive Data Structures & Algorithms dependency graph visualizer and topological study queue planner built with Next.js, Vis.js, and Supabase.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
