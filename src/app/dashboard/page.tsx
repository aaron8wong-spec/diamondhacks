"use client";

import { useState } from "react";
import { ClassList } from "@/components/dashboard/ClassList";
import { CrawlExternalUrl } from "@/components/dashboard/CrawlExternalUrl";
import { SmartDayView } from "@/components/productivity/SmartDayView";
import { Button } from "@/components/ui/Button";
import { useClasses } from "@/hooks/useClasses";
import { useTravelPreferences } from "@/hooks/useTravelPreferences";
import { ALL_RESIDENCES, locationLabel } from "@/lib/travel/walking-times";
import Link from "next/link";

type Tab = "today" | "classes";

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("today");
  const { classes } = useClasses();
  const { prefs, setHomeBase } = useTravelPreferences();
  const [dismissed, setDismissed] = useState(false);

  const showTravelBanner = !prefs.homeBase && classes.length > 0 && !dismissed;

  return (
    <div className="space-y-6">
      {/* Travel home base prompt */}
      {showTravelBanner && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-orange-50 border border-orange-200 px-4 py-3">
          <span className="text-orange-400 text-lg">🚶</span>
          <p className="text-sm text-orange-700 flex-1">
            Set your residence for walking time estimates between classes.
          </p>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) setHomeBase(e.target.value);
            }}
            className="text-sm rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400"
          >
            <option value="">Choose residence...</option>
            {ALL_RESIDENCES.map((r) => (
              <option key={r} value={r}>{locationLabel(r)}</option>
            ))}
          </select>
          <button
            onClick={() => setDismissed(true)}
            className="text-orange-300 hover:text-orange-500 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">
            Dashboard
          </h1>
          <p className="text-sky-400 mt-0.5 text-sm">
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
      <CrawlExternalUrl />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-sky-100 -mb-2">
        {(["today", "classes"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px capitalize
              ${
                tab === t
                  ? "border-teal-500 text-sky-600"
                  : "border-transparent text-sky-400 hover:text-sky-600 hover:border-sky-200"
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
