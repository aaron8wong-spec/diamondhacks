"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ClassList } from "@/components/dashboard/ClassList";
import { CrawlExternalUrl } from "@/components/dashboard/CrawlExternalUrl";
import { SmartDayView } from "@/components/productivity/SmartDayView";
import { ScheduleChat } from "@/components/dashboard/ScheduleChat";
import { useClasses } from "@/hooks/useClasses";
import { useTravelPreferences } from "@/hooks/useTravelPreferences";
import { ALL_RESIDENCES, locationLabel } from "@/lib/travel/walking-times";

type Tab = "today" | "classes";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("today");
  const { classes, fetchClasses } = useClasses();
  const { prefs, setHomeBase } = useTravelPreferences();
  const [dismissed, setDismissed] = useState(false);

  const showTravelBanner = !prefs.homeBase && classes.length > 0 && !dismissed;

  const now     = new Date();
  const hour    = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name    = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : "";
  const dateLabel = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-5">

      {/* Residence prompt */}
      {showTravelBanner && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-orange-50 border border-orange-200 px-4 py-3">
          <span className="text-orange-400">🚶</span>
          <p className="text-sm text-orange-700 flex-1">
            Set your residence for walking time estimates between classes.
          </p>
          <select
            value=""
            onChange={(e) => { if (e.target.value) setHomeBase(e.target.value); }}
            className="text-sm rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400"
          >
            <option value="">Choose residence…</option>
            {ALL_RESIDENCES.map((r) => (
              <option key={r} value={r}>{locationLabel(r)}</option>
            ))}
          </select>
          <button
            onClick={() => setDismissed(true)}
            className="text-orange-300 hover:text-orange-500 text-sm transition"
          >Dismiss</button>
        </div>
      )}

      {/* Greeting */}
      <div>
        <p className="text-xs font-medium text-sky-400 uppercase tracking-widest">{dateLabel}</p>
        {name && (
          <h1 className="text-xl font-semibold text-gray-900 mt-0.5">
            {greeting}, {name}
          </h1>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(["today", "classes"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-[#1B4457] text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t === "today" ? "Today" : "My Classes"}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "today" ? (
        <SmartDayView />
      ) : (
        <div className="space-y-6">
          <ClassList />
          <CrawlExternalUrl />
          <ScheduleChat onClassUpdated={fetchClasses} />
        </div>
      )}

    </div>
  );
}
