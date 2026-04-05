"use client";

import { EVENT_STYLE, formatShortTime } from "./types";
import type { CalendarEvent } from "./types";

interface CalendarEventCardProps {
  event: CalendarEvent;
  selected?: boolean;
  compact?: boolean; // for month view pills
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}

export function CalendarEventCard({
  event,
  selected = false,
  compact = false,
  onClick,
  style,
  className = "",
}: CalendarEventCardProps) {
  const s = EVENT_STYLE[event.type];

  if (compact) {
    return (
      <button
        onClick={onClick}
        style={style}
        className={`w-full text-left flex items-center gap-1 px-1.5 py-0.5 rounded text-xs truncate
          ${s.pill} hover:brightness-95 transition-all ${selected ? "ring-1 ring-offset-0 ring-current" : ""}
          ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
        <span className="truncate font-medium">{event.title}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      style={style}
      className={`w-full text-left rounded-lg px-2.5 py-2 overflow-hidden transition-all
        ${s.card}
        ${selected ? "shadow-md ring-1 ring-current/20" : "hover:brightness-95 hover:shadow-sm"}
        ${className}`}
    >
      <p className="text-xs font-semibold leading-tight truncate">{event.title}</p>
      {event.startTime && !event.allDay && (
        <p className="text-xs opacity-70 mt-0.5 leading-tight">
          {formatShortTime(event.startTime)}
          {event.endTime &&
            event.endTime.getTime() !== event.startTime.getTime() &&
            ` – ${formatShortTime(event.endTime)}`}
        </p>
      )}
      {event.location && (
        <p className="text-xs opacity-60 truncate mt-0.5 leading-tight">
          {event.location}
        </p>
      )}
      {event.host && (
        <p className="text-xs opacity-60 truncate mt-0.5 leading-tight">
          {event.host}
        </p>
      )}
    </button>
  );
}
