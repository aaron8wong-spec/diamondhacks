"use client";

import { useState } from "react";
import { MiniCalendar } from "./MiniCalendar";
import { UpcomingEventsList } from "./UpcomingEventsList";
import { FocusTimer } from "@/components/productivity/FocusTimer";
import { TinyTasks } from "@/components/productivity/TinyTasks";
import { EVENT_STYLE } from "./types";
import type { CalendarEvent, EventType, CalendarView } from "./types";
import { ALL_RESIDENCES, locationLabel } from "@/lib/travel/walking-times";

const ALL_TYPES: EventType[] = [
  "lecture",
  "discussion",
  "lab",
  "office_hours",
  "travel",
  "study",
  "task",
  "reminder",
  "personal",
];

interface CalendarSidebarProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedEventId: string | null;
  hiddenTypes: Set<EventType>;
  onSelectEvent: (id: string) => void;
  onNavigateToDate: (d: Date) => void;
  onViewChange: (v: CalendarView) => void;
  onToggleType: (t: EventType) => void;
  homeBase: string | null;
  travelEnabled: boolean;
  onHomeBaseChange: (v: string | null) => void;
  onTravelToggle: (v: boolean) => void;
}

type SidebarSection = "upcoming" | "focus" | "tasks" | "filters" | "travel";

export function CalendarSidebar({
  currentDate,
  events,
  selectedEventId,
  hiddenTypes,
  onSelectEvent,
  onNavigateToDate,
  onToggleType,
  homeBase,
  travelEnabled,
  onHomeBaseChange,
  onTravelToggle,
}: CalendarSidebarProps) {
  const [openSection, setOpenSection] = useState<SidebarSection>("upcoming");

  const toggle = (s: SidebarSection) =>
    setOpenSection((prev) => (prev === s ? "upcoming" : s));

  const filteredEvents = events.filter((e) => !hiddenTypes.has(e.type));

  const now = new Date();
  const nextEvent = filteredEvents
    .filter((e) => e.startTime > now)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0];

  return (
    <aside className="w-56 border-r border-sky-100/60 glass flex flex-col overflow-y-auto shrink-0">
      {/* Mini calendar */}
      <div className="p-4 border-b border-sky-100/60">
        <MiniCalendar
          selectedDate={currentDate}
          events={filteredEvents}
          onSelectDate={onNavigateToDate}
        />
      </div>

      {/* Next up */}
      {nextEvent && (
        <div className="px-4 py-3 border-b border-sky-100/60">
          <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
            Next up
          </p>
          <button
            onClick={() => onSelectEvent(nextEvent.id)}
            className="w-full text-left"
          >
            <div
              className={`rounded-xl px-3 py-2.5 ${EVENT_STYLE[nextEvent.type].card}`}
            >
              <p className="text-xs font-semibold leading-tight">
                {nextEvent.title}
              </p>
              <p className="text-xs opacity-70 mt-0.5">
                {nextEvent.startTime.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
                {nextEvent.location ? ` · ${nextEvent.location}` : ""}
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Collapsible sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Upcoming events */}
        <div className="border-b border-sky-100/60">
          <button
            onClick={() => toggle("upcoming")}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-sky-50/50 transition-colors"
          >
            Upcoming
            <span className="text-sky-300 normal-case font-normal text-sm">
              {openSection === "upcoming" ? "−" : "+"}
            </span>
          </button>
          {openSection === "upcoming" && (
            <div className="px-3 pb-3">
              <UpcomingEventsList
                events={filteredEvents}
                selectedEventId={selectedEventId}
                onSelectEvent={onSelectEvent}
              />
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="border-b border-sky-100/60">
          <button
            onClick={() => toggle("filters")}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-sky-50/50 transition-colors"
          >
            Categories
            <span className="text-sky-300 normal-case font-normal text-sm">
              {openSection === "filters" ? "−" : "+"}
            </span>
          </button>
          {openSection === "filters" && (
            <div className="px-3 pb-3 space-y-1">
              {ALL_TYPES.map((type) => {
                const s = EVENT_STYLE[type];
                const hidden = hiddenTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => onToggleType(type)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors
                      ${hidden ? "opacity-40" : "hover:bg-sky-50/50"}`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                    <span className="text-slate-600 capitalize">{s.label}</span>
                    {hidden && (
                      <span className="ml-auto text-sky-300">hidden</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Travel settings */}
        <div className="border-b border-sky-100/60">
          <button
            onClick={() => toggle("travel")}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-sky-50/50 transition-colors"
          >
            Travel
            <span className="text-sky-300 normal-case font-normal text-sm">
              {openSection === "travel" ? "−" : "+"}
            </span>
          </button>
          {openSection === "travel" && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Home base</label>
                <select
                  value={homeBase ?? ""}
                  onChange={(e) => onHomeBaseChange(e.target.value || null)}
                  className="w-full text-xs rounded-lg border border-sky-200 bg-white px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-400"
                >
                  <option value="">Not set</option>
                  {ALL_RESIDENCES.map((r) => (
                    <option key={r} value={r}>{locationLabel(r)}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={travelEnabled}
                  onChange={(e) => onTravelToggle(e.target.checked)}
                  className="rounded border-sky-300 text-sky-500 focus:ring-sky-400"
                />
                Show travel blocks
              </label>
              {homeBase && (
                <p className="text-xs text-slate-400">
                  Walking times from {locationLabel(homeBase)} to your first class each day.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Focus timer */}
        <div className="border-b border-sky-100/60">
          <button
            onClick={() => toggle("focus")}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-sky-50/50 transition-colors"
          >
            Focus timer
            <span className="text-sky-300 normal-case font-normal text-sm">
              {openSection === "focus" ? "−" : "+"}
            </span>
          </button>
          {openSection === "focus" && (
            <div className="px-3 pb-3">
              <FocusTimer />
            </div>
          )}
        </div>

        {/* Quick tasks */}
        <div>
          <button
            onClick={() => toggle("tasks")}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-sky-50/50 transition-colors"
          >
            Tasks
            <span className="text-sky-300 normal-case font-normal text-sm">
              {openSection === "tasks" ? "−" : "+"}
            </span>
          </button>
          {openSection === "tasks" && (
            <div className="px-3 pb-3">
              <TinyTasks />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
