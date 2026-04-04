"use client";

import { EVENT_STYLE, formatShortTime } from "./types";
import type { CalendarEvent } from "./types";

interface UpcomingEventsListProps {
  events: CalendarEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

export function UpcomingEventsList({
  events,
  selectedEventId,
  onSelectEvent,
}: UpcomingEventsListProps) {
  const now = new Date();
  const upcoming = events
    .filter((e) => e.startTime >= now)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 5);

  if (upcoming.length === 0) {
    return (
      <p className="text-xs text-sky-400 italic">No upcoming events</p>
    );
  }

  let lastDayLabel = "";

  return (
    <div className="space-y-1">
      {upcoming.map((event) => {
        const s = EVENT_STYLE[event.type];
        const dayLabel = event.startTime.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        const showDayLabel = dayLabel !== lastDayLabel;
        lastDayLabel = dayLabel;

        return (
          <div key={event.id}>
            {showDayLabel && (
              <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider mt-3 mb-1 first:mt-0">
                {dayLabel}
              </p>
            )}
            <button
              onClick={() => onSelectEvent(event.id)}
              className={`w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg transition-colors
                ${event.id === selectedEventId ? "bg-sky-100/60" : "hover:bg-sky-50/50"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${s.dot}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-sky-700 truncate leading-tight">
                  {event.title}
                </p>
                <p className="text-xs text-sky-400 mt-0.5">
                  {formatShortTime(event.startTime)}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
