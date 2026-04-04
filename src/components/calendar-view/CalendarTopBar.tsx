"use client";

import Link from "next/link";
import type { CalendarView } from "./types";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getViewLabel(view: CalendarView, date: Date): string {
  if (view === "month") {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  }
  if (view === "week") {
    const sun = new Date(date);
    sun.setDate(date.getDate() - date.getDay());
    const sat = new Date(sun);
    sat.setDate(sun.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    if (sun.getMonth() === sat.getMonth()) {
      return `${sun.toLocaleDateString([], opts)} – ${sat.getDate()}, ${sat.getFullYear()}`;
    }
    return `${sun.toLocaleDateString([], opts)} – ${sat.toLocaleDateString([], opts)}, ${sat.getFullYear()}`;
  }
  return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

interface CalendarTopBarProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  onNavigate: (dir: 1 | -1) => void;
  onToday: () => void;
  onAddEvent: () => void;
}

export function CalendarTopBar({ currentDate, view, onViewChange, onNavigate, onToday, onAddEvent }: CalendarTopBarProps) {
  const label = getViewLabel(view, currentDate);
  return (
    <header className="flex items-center h-14 px-4 border-b border-sky-100/60 glass-strong shrink-0 gap-3">
      <Link href="/dashboard" className="text-sky-400 hover:text-sky-600 transition text-sm mr-1 shrink-0" title="Back">
        ←
      </Link>
      <span className="text-sm font-semibold text-sky-700 shrink-0">
        Canvas<span className="text-sky-400">Cal</span>
      </span>

      <button
        onClick={onAddEvent}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-400 text-white hover:bg-sky-500 transition shadow-sm shadow-sky-200/50 shrink-0 mr-2"
      >
        <span className="text-base leading-none">+</span> New
      </button>

      <div className="flex items-center gap-1">
        <button onClick={onToday} className="px-3 py-1.5 text-xs font-medium text-sky-600 rounded-xl border border-sky-100 bg-white/60 hover:bg-white/90 transition">
          Today
        </button>
        <button onClick={() => onNavigate(-1)} className="w-7 h-7 flex items-center justify-center rounded-xl text-sky-400 hover:bg-sky-50 transition text-sm">‹</button>
        <button onClick={() => onNavigate(1)}  className="w-7 h-7 flex items-center justify-center rounded-xl text-sky-400 hover:bg-sky-50 transition text-sm">›</button>
      </div>

      <h1 className="text-sm font-semibold text-sky-800 flex-1 min-w-0 truncate">{label}</h1>

      <div className="flex rounded-xl border border-sky-100 overflow-hidden shrink-0 text-xs bg-white/60">
        {(["day", "week", "month"] as CalendarView[]).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-3 py-1.5 font-medium capitalize transition
              ${view === v ? "bg-sky-400 text-white" : "text-sky-500 hover:bg-sky-50"}`}
          >
            {v}
          </button>
        ))}
      </div>
    </header>
  );
}
