"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { isSameDay } from "./types";
import type { CalendarEvent, EventType } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeSlotBase {
  display: string;   // "9:00 AM"
  hour: number;
  minute: number;
}

interface TimeSlot extends TimeSlotBase {
  conflictsWithClass: boolean;
  inGap: boolean;
  label?: "Good gap" | "Before class" | "After class";
}

export interface NewCalendarEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  type: EventType;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPE_OPTIONS: { type: EventType; label: string; icon: string }[] = [
  { type: "study",    label: "Study block",    icon: "◎" },
  { type: "task",     label: "Focus session",  icon: "⟳" },
  { type: "reminder", label: "Reminder",       icon: "○" },
  { type: "personal", label: "Personal",       icon: "·" },
];

const DEFAULT_TITLES: Record<string, string> = {
  study:    "Study block",
  task:     "Focus session",
  reminder: "Reminder",
  personal: "Personal time",
};

const DURATIONS = [25, 30, 45, 60];
const CLASS_TYPES: EventType[] = ["lecture", "discussion", "lab"];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateBaseSlots(): TimeSlotBase[] {
  const slots: TimeSlotBase[] = [];
  for (let h = 7; h < 22; h++) {
    for (const m of [0, 30]) {
      const period = h >= 12 ? "PM" : "AM";
      const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const dm = m === 0 ? "00" : "30";
      slots.push({ display: `${dh}:${dm} ${period}`, hour: h, minute: m });
    }
  }
  return slots;
}

const BASE_SLOTS = generateBaseSlots();

function computeSlots(
  events: CalendarEvent[],
  date: Date,
  durationMins: number
): TimeSlot[] {
  const classes = events
    .filter((e) => isSameDay(e.startTime, date) && CLASS_TYPES.includes(e.type))
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return BASE_SLOTS.map((slot) => {
    const start = new Date(date);
    start.setHours(slot.hour, slot.minute, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMins);

    const conflictsWithClass = classes.some(
      (c) => start < c.endTime && c.startTime < end
    );

    if (conflictsWithClass) {
      return { ...slot, conflictsWithClass: true, inGap: false };
    }

    // Check if slot sits cleanly within a free gap between classes
    for (let i = 0; i < classes.length - 1; i++) {
      const gapStart = classes[i].endTime;
      const gapEnd = classes[i + 1].startTime;
      const gapMins = (gapEnd.getTime() - gapStart.getTime()) / 60_000;
      if (gapMins >= 30 && start >= gapStart && end <= gapEnd) {
        return { ...slot, conflictsWithClass: false, inGap: true, label: "Good gap" };
      }
    }

    // Before next class (slot ends ≤45 min before class starts)
    for (const cls of classes) {
      const minsUntil = (cls.startTime.getTime() - end.getTime()) / 60_000;
      if (minsUntil >= 0 && minsUntil <= 45) {
        return { ...slot, conflictsWithClass: false, inGap: false, label: "Before class" };
      }
    }

    // After class (slot starts ≤30 min after class ends)
    for (const cls of classes) {
      const minsSince = (start.getTime() - cls.endTime.getTime()) / 60_000;
      if (minsSince >= 0 && minsSince <= 30) {
        return { ...slot, conflictsWithClass: false, inGap: false, label: "After class" };
      }
    }

    return { ...slot, conflictsWithClass: false, inGap: false };
  });
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  r.setHours(0, 0, 0, 0);
  return r;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TimeSelectionModalProps {
  events: CalendarEvent[];
  initialDate?: Date;
  onConfirm: (event: NewCalendarEvent) => void;
  onClose: () => void;
}

export function TimeSelectionModal({
  events,
  initialDate,
  onConfirm,
  onClose,
}: TimeSelectionModalProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate ? new Date(new Date(initialDate).setHours(0, 0, 0, 0)) : today
  );
  const [selectedTime, setSelectedTime] = useState<TimeSlotBase | null>(null);
  const [selectedType, setSelectedType] = useState<EventType>("task");
  const [duration, setDuration] = useState(25);
  const [title, setTitle] = useState(DEFAULT_TITLES["task"]);
  const [dateOffset, setDateOffset] = useState(0); // shift the 7-day window

  const days = useMemo(
    () => Array.from({ length: 9 }, (_, i) => addDays(today, i + dateOffset)),
    [today, dateOffset]
  );

  const slots = useMemo(
    () => computeSlots(events, selectedDate, duration),
    [events, selectedDate, duration]
  );

  // Auto-select the first "Good gap" slot when date or duration changes
  useEffect(() => {
    const best = slots.find((s) => s.inGap && !s.conflictsWithClass);
    if (best) setSelectedTime(best);
    else setSelectedTime(null);
  }, [slots]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleTypeChange = useCallback((type: EventType) => {
    setSelectedType(type);
    setTitle(DEFAULT_TITLES[type] ?? "");
  }, []);

  const handleConfirm = () => {
    if (!selectedTime) return;
    const start = new Date(selectedDate);
    start.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);
    onConfirm({ title: title || DEFAULT_TITLES[selectedType], startTime: start, endTime: end, type: selectedType });
  };

  const hasClasses = events.some(
    (e) => isSameDay(e.startTime, selectedDate) && CLASS_TYPES.includes(e.type)
  );

  const gapCount = slots.filter((s) => s.inGap).length;

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-900/20 backdrop-blur-[2px]"
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Schedule event"
      >
        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-sky-100/60">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-2">
                When do you want to schedule this?
              </p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title…"
                className="text-lg font-semibold text-sky-800 placeholder-stone-300 bg-transparent outline-none w-full truncate"
              />
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-sky-400 hover:text-sky-600 hover:bg-sky-100 transition-colors shrink-0 mt-0.5"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Type pills */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {EVENT_TYPE_OPTIONS.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${selectedType === type
                    ? "bg-teal-500 text-white"
                    : "bg-stone-100 text-sky-500 hover:bg-sky-100"
                  }`}
              >
                <span className="text-[10px]">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Date strip ── */}
        <div className="px-4 py-3 border-b border-sky-100/60">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDateOffset((p) => Math.max(0, p - 3))}
              disabled={dateOffset === 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-sky-400 hover:bg-sky-100 disabled:opacity-25 transition-colors shrink-0 text-sm"
              aria-label="Earlier days"
            >
              ‹
            </button>

            <div className="flex gap-1.5 flex-1 overflow-hidden">
              {days.map((day) => {
                const isSel = isSameDay(day, selectedDate);
                const isTod = isSameDay(day, today);
                const hasEvts = events.some(
                  (e) => isSameDay(e.startTime, day) && CLASS_TYPES.includes(e.type)
                );
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center py-1.5 px-2 rounded-xl flex-1 transition-all
                      ${isSel
                        ? "bg-teal-500 text-white"
                        : "text-sky-500 hover:bg-sky-50"
                      }`}
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-wide leading-none
                      ${isSel ? "text-teal-100" : isTod ? "text-sky-400" : "text-sky-400"}`}
                    >
                      {DAY_NAMES[day.getDay()]}
                    </span>
                    <span className={`text-sm font-semibold mt-0.5 leading-none
                      ${isSel ? "text-white" : isTod ? "text-sky-500" : "text-sky-700"}`}
                    >
                      {day.getDate()}
                    </span>
                    <span className={`text-[9px] mt-0.5 leading-none
                      ${isSel ? "text-teal-200" : "text-sky-400"}`}
                    >
                      {MONTH_SHORT[day.getMonth()]}
                    </span>
                    {hasEvts && !isSel && (
                      <span className="w-1 h-1 rounded-full bg-teal-300 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setDateOffset((p) => p + 3)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-sky-400 hover:bg-sky-100 transition-colors shrink-0 text-sm"
              aria-label="Later days"
            >
              ›
            </button>
          </div>
        </div>

        {/* ── Time + Duration ── */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between gap-4 shrink-0">
          <div>
            <p className="text-xs font-semibold text-sky-700">What time works?</p>
            {hasClasses && gapCount > 0 && (
              <p className="text-xs text-sky-400 mt-0.5">
                {gapCount} gap{gapCount !== 1 ? "s" : ""} between your classes today
              </p>
            )}
            {hasClasses && gapCount === 0 && (
              <p className="text-xs text-sky-400 mt-0.5">No free gaps — all times shown</p>
            )}
            {!hasClasses && (
              <p className="text-xs text-sky-400 mt-0.5">No classes scheduled</p>
            )}
          </div>

          {/* Duration pills */}
          <div className="flex gap-1 shrink-0">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors
                  ${duration === d
                    ? "bg-stone-800 text-white"
                    : "bg-stone-100 text-sky-500 hover:bg-sky-100"
                  }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        {/* ── Time grid ── */}
        <div className="overflow-y-auto flex-1 px-6 pb-3">
          <div className="grid grid-cols-3 gap-2 pt-1 pb-1">
            {slots.map((slot) => {
              const isSelected =
                selectedTime?.hour === slot.hour &&
                selectedTime?.minute === slot.minute;

              if (slot.conflictsWithClass) {
                return (
                  <div
                    key={slot.display}
                    className="rounded-xl px-3 py-2.5 border border-stone-50 opacity-30 cursor-not-allowed text-center"
                    title="Conflicts with a class"
                  >
                    <p className="text-xs text-sky-300 font-medium">{slot.display}</p>
                  </div>
                );
              }

              return (
                <button
                  key={slot.display}
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-xl px-3 py-2.5 border text-left transition-all focus:outline-none focus:ring-2 focus:ring-sky-200
                    ${isSelected
                      ? "bg-teal-500 border-teal-500 text-white shadow-sm"
                      : slot.inGap
                      ? "bg-teal-50 border-teal-100 text-teal-700 hover:bg-sky-100 hover:border-teal-200"
                      : "bg-stone-50 border-sky-100/60 text-sky-600 hover:bg-sky-100 hover:border-sky-100"
                    }`}
                >
                  <p className={`text-xs font-semibold leading-tight
                    ${isSelected ? "text-white" : ""}`}
                  >
                    {slot.display}
                  </p>
                  {slot.label && !isSelected && (
                    <p className={`text-[10px] mt-0.5 leading-tight font-medium
                      ${slot.label === "Good gap"
                        ? "text-sky-400"
                        : slot.label === "Before class"
                        ? "text-amber-500"
                        : "text-sky-400"
                      }`}
                    >
                      {slot.label}
                    </p>
                  )}
                  {isSelected && slot.label && (
                    <p className="text-[10px] mt-0.5 text-teal-100 leading-tight">
                      {slot.label}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-sky-100/60 flex items-center justify-between gap-3 shrink-0 bg-stone-50/50">
          {selectedTime ? (
            <p className="text-xs text-sky-500">
              {selectedDate.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
              {" · "}
              {selectedTime.display}
              {" · "}
              {duration} min
            </p>
          ) : (
            <p className="text-xs text-sky-400">Select a time to schedule</p>
          )}

          <div className="flex gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-sky-500 hover:text-sky-700 hover:bg-sky-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedTime}
              className="px-5 py-2 text-sm font-medium rounded-xl transition-all
                bg-teal-500 text-white hover:bg-teal-600
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
