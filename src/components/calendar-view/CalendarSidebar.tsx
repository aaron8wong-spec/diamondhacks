"use client";

import { useState } from "react";
import { MiniCalendar } from "./MiniCalendar";
import { UpcomingEventsList } from "./UpcomingEventsList";
import { FocusTimer } from "@/components/productivity/FocusTimer";
import { TinyTasks } from "@/components/productivity/TinyTasks";
import { EVENT_STYLE } from "./types";
import type { CalendarEvent, EventType, CalendarView } from "./types";

const ALL_TYPES: EventType[] = [
  "lecture",
  "discussion",
  "lab",
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
}

type SidebarSection = "upcoming" | "focus" | "tasks" | "filters";

export function CalendarSidebar({
  currentDate,
  events,
  selectedEventId,
  hiddenTypes,
  onSelectEvent,
  onNavigateToDate,
  onToggleType,
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
