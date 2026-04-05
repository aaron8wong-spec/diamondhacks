"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const NAV_ITEMS = [
  { label: "Today",    href: "/dashboard" },
  { label: "Schedule", href: "/dashboard/schedule" },
  { label: "Focus",    href: "/focus"     },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) window.location.href = "/login";
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-b from-[#E9ECF4] via-[#F2F3F9] to-[#F7F8FC] dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-gray-200/80 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo + nav */}
          <div className="flex items-center gap-7">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#163847] text-xs font-bold text-white">
                C
              </span>
              CanvasCal
            </Link>

            <nav className="flex items-center gap-0.5">
              {NAV_ITEMS.map(({ label, href }) => {
                const active =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
              {initial}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logout();
                window.location.href = "/login";
              }}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Sign out
            </Button>
          </div>

        </div>
      </header>

      {/* ── Page content ── */}
      <main className={`w-full flex-1 ${
        pathname.startsWith("/dashboard/schedule")
          ? "px-0 py-0"
          : "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
      }`}>
        {children}
      </main>

    </div>
  );
}
