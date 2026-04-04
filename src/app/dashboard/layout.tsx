"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) window.location.href = "/login";
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Frosted glass nav */}
      <header className="sticky top-0 z-30 border-b border-sky-100/60 glass-strong">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-lg font-semibold text-sky-700 tracking-tight">
                Canvas<span className="text-sky-400">Cal</span>
              </Link>
              <nav className="flex gap-0.5">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Classes</Button>
                </Link>
                <Link href="/schedule">
                  <Button variant="ghost" size="sm">Calendar</Button>
                </Link>
                <Link href="/focus">
                  <Button variant="ghost" size="sm">Focus</Button>
                </Link>
                <Link href="/canvas">
                  <Button variant="ghost" size="sm">Import</Button>
                </Link>
                <Link href="/calendar">
                  <Button variant="ghost" size="sm">Export</Button>
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-sky-400">{user.username}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => { await logout(); window.location.href = "/login"; }}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
