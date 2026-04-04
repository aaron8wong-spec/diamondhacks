"use client";

import { useState, useEffect, useRef } from "react";
import { isSameDay, isToday, formatShortTime } from "./types";
import { CalendarEventCard } from "./CalendarEventCard";
import type { CalendarEvent } from "./types";

const START_HOUR = 7;
const END_HOUR = 22;
const PX_PER_HOUR = 64;
const TOTAL_PX = (END_HOUR - START_HOUR) * PX_PER_HOUR;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDays(anchor: Date): Date[] {
  const d = new Date(anchor);
  const dow = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow); // Sunday
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
}

function timeToPixels(date: Date): number {
  return (date.getHours() - START_HOUR + date.getMinutes() / 60) * PX_PER_HOUR;
}

function durationToPixels(start: Date, end: Date): number {
  const mins = (end.getTime() - start.getTime()) / 60_000;
  return Math.max(24, (mins / 60) * PX_PER_HOUR);
}

interface LayoutEvent {
  event: CalendarEvent;
  col: number;
  totalCols: number;
}

function layoutDayEvents(events: CalendarEvent[]): LayoutEvent[] {
  const sorted = [...events].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );
  const result: LayoutEvent[] = sorted.map((e) => ({ event: e, col: 0, totalCols: 1 }));

  // Assign columns for overlapping events
  const cols: CalendarEvent[][] = [];
  for (let i = 0; i < sorted.length; i++) {
    const e = sorted[i];
    let placed = false;
    for (let c = 0; c < cols.length; c++) {
      const last = cols[c][cols[c].length - 1];
      if (last.endTime <= e.startTime) {
        cols[c].push(e);
        result[i].col = c;
        placed = true;
        break;
      }
    }
    if (!placed) {
      result[i].col = cols.length;
      cols.push([e]);
    }
  }

  // Calculate totalCols for each event (max col among overlapping events)
  for (let i = 0; i < result.length; i++) {
    let maxCol = result[i].col;
    for (let j = 0; j < result.length; j++) {
      if (i !== j) {
        const a = result[i].event;
        const b = result[j].event;
        if (a.startTime < b.endTime && b.startTime < a.endTime) {
          maxCol = Math.max(maxCol, result[j].col);
        }
      }
    }
    result[i].totalCols = maxCol + 1;
  }

  return result;
}

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string | null) => void;
  onNavigateToDate: (d: Date) => void;
}

export function CalendarWeekView({
  currentDate,
  events,
  selectedEventId,
  onSelectEvent,
  onNavigateToDate,
}: CalendarWeekViewProps) {
  const days = getWeekDays(currentDate);
  const [now, setNow] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const offset = timeToPixels(now) - 80;
      scrollRef.current.scrollTop = Math.max(0, offset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nowTop = timeToPixels(now);
  const isCurrentWeek = days.some((d) => isToday(d));

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="flex border-b border-sky-100/40 bg-white shrink-0">
        <div className="w-14 shrink-0" /> {/* spacer for time col */}
        {days.map((day, i) => {
          const today = isToday(day);
          return (
            <div
              key={i}
              className="flex-1 py-3 text-center cursor-pointer hover:bg-sky-50/50 transition-colors"
              onClick={() => onNavigateToDate(day)}
            >
              <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                {DAY_LABELS[day.getDay()]}
              </p>
              <div
                className={`mx-auto mt-1 w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                  ${today ? "bg-sky-400 text-white" : "text-sky-700"}`}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex" style={{ minHeight: `${TOTAL_PX}px` }}>
          {/* Time labels */}
          <div className="w-14 shrink-0 relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-2 text-xs text-sky-400"
                style={{ top: `${(h - START_HOUR) * PX_PER_HOUR - 8}px` }}
              >
                {h === 12
                  ? "12pm"
                  : h < 12
                  ? `${h}am`
                  : `${h - 12}pm`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, di) => {
            const dayEvents = events.filter((e) => isSameDay(e.startTime, day));
            const layout = layoutDayEvents(dayEvents);
            const today = isToday(day);

            return (
              <div
                key={di}
                className={`flex-1 relative border-l border-sky-100/40 ${today ? "bg-sky-50/30" : ""}`}
                style={{ height: `${TOTAL_PX}px` }}
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-sky-100/40"
                    style={{ top: `${(h - START_HOUR) * PX_PER_HOUR}px` }}
                  />
                ))}

                {/* Half-hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={`h-${h}`}
                    className="absolute left-0 right-0 border-t border-sky-50"
                    style={{ top: `${(h - START_HOUR) * PX_PER_HOUR + PX_PER_HOUR / 2}px` }}
                  />
                ))}

                {/* Current time indicator */}
                {today && isCurrentWeek && (
                  <>
                    <div
                      className="absolute left-0 right-0 border-t-2 border-sky-400 z-10 pointer-events-none"
                      style={{ top: `${nowTop}px` }}
                    />
                    <div
                      className="absolute w-2 h-2 rounded-full bg-sky-400 z-10 pointer-events-none"
                      style={{ top: `${nowTop - 4}px`, left: "-4px" }}
                    />
                  </>
                )}

                {/* Events */}
                {layout.map(({ event, col, totalCols }) => {
                  const top = timeToPixels(event.startTime);
                  const height = durationToPixels(event.startTime, event.endTime);
                  const width = `calc(${100 / totalCols}% - 4px)`;
                  const left = `calc(${(col / totalCols) * 100}% + 2px)`;

                  return (
                    <CalendarEventCard
                      key={event.id}
                      event={event}
                      selected={event.id === selectedEventId}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(
                          event.id === selectedEventId ? null : event.id
                        );
                      }}
                      style={{ position: "absolute", top, height, width, left, zIndex: event.id === selectedEventId ? 20 : 10 }}
                      className="rounded-lg"
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
