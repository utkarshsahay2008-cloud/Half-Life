import "@/lib/polyfills";
import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "HALF-LIFE — AI Temporal Decay & Fact Freshness Lab",
  description:
    "Production-grade stale-answer detector for AI applications powered by Bifrost Gateway (Maxim AI) and Tavily search grounding.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('half-life-theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[#F8FAFC] dark:bg-[#070A13] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200">
        {/* Atmospheric Refraction Ambient Light Washes & Delicate Grid */}
        <div className="ambient-glow-mesh bg-subtle-grid">
          <div className="ambient-orb-1" />
          <div className="ambient-orb-2" />
          <div className="ambient-orb-3" />
          <div className="ambient-orb-4" />
        </div>

        {/* Global Sticky Glass Header */}
        <Navbar />

        {/* Main Application Area */}
        <main className="relative z-10 flex-1">
          {children}
        </main>

        {/* Parallel / Intercepting Route Modal Slot */}
        {modal}

        {/* Footer */}
        <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#070A13]/80 py-6 backdrop-blur-md transition-colors">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">HALF-LIFE</span>
              <span>— AI Temporal Decay & Fact Freshness Lab</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Bifrost Multi-Model Gateway</span>
              <span>•</span>
              <span>Tavily Search Grounding</span>
              <span>•</span>
              <span>Prisma SQLite Engine</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
