"use client";

import { useState } from "react";
import { ClassList } from "@/components/dashboard/ClassList";
import { SmartDayView } from "@/components/productivity/SmartDayView";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Tab = "today" | "classes";

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
            {new Date().toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/canvas">
            <Button variant="light">Import from Canvas</Button>
          </Link>
          <Link href="/calendar">
            <Button variant="secondary">Export to Calendar</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 -mb-2">
        {(["today", "classes"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px capitalize
              ${
                tab === t
                  ? "border-teal-500 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300"
              }`}
          >
            {t === "today" ? "Today" : "My Classes"}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "today" ? <SmartDayView /> : <ClassList />}
    </div>
  );
}
