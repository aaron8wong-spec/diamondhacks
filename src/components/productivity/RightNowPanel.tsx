"use client";

import { useState, useEffect } from "react";
import type { ClassEvent } from "./types";

const QUICK_TASKS = [
  "Review your notes from last class",
  "Check Canvas for new announcements",
  "Respond to pending messages",
  "Skim the reading for next class",
  "Grab water or a snack",
  "Do a quick stretch",
  "Organize your notes",
  "Write down any questions for next class",
];

function getQuickTasks(availableMinutes: number): string[] {
  const seed = new Date().getHours();
  const shuffled = [...QUICK_TASKS].sort(
    (a, b) => ((a.charCodeAt(0) + seed) % 7) - ((b.charCodeAt(0) + seed) % 7),
  );
  return shuffled.slice(0, availableMinutes < 10 ? 2 : 3);
}

function fmtMins(mins: number): string {
  if (mins < 60) return `${Math.floor(mins)} min`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

interface RightNowPanelProps {
  events: ClassEvent[];
  hasClasses?: boolean;
  nextDay?: { dayName: string; events: ClassEvent[] } | null;
  onStartFocus?: () => void;
}

export function RightNowPanel({ events, hasClasses, nextDay, onStartFocus }: RightNowPanelProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const currentClass  = events.find((e) => e.startTime <= now && now < e.endTime);
  const nextClass     = events.find((e) => e.startTime > now);
  const allDone       = events.length > 0 && events.every((e) => e.endTime <= now);
  const minsUntilNext = nextClass
    ? (nextClass.startTime.getTime() - now.getTime()) / 60_000
    : null;

  // ── All done ──────────────────────────────────────────────────────────────

  if (allDone) {
    return (
      <div className="rounded-2xl border border-sky-100/60 bg-gradient-to-br from-teal-50/60 to-white p-6">
        <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-widest mb-2">Right now</p>
        <p className="text-2xl font-light text-sky-800">All done for today</p>
        <p className="text-sm text-sky-400 mt-1">No more classes. Good work.</p>
        {onStartFocus && (
          <button
            onClick={onStartFocus}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 text-sm font-medium hover:bg-sky-100 hover:shadow-sm active:scale-[0.98] transition-all"
          >
            <PlayIcon /> Wind down with a focus session
          </button>
        )}
      </div>
    );
  }

  // ── In class ──────────────────────────────────────────────────────────────

  if (currentClass) {
    const minsLeft = Math.ceil((currentClass.endTime.getTime() - now.getTime()) / 60_000);
    const nextAfter = events.find((e) => e.startTime >= currentClass.endTime);
    const gapAfter  = nextAfter
      ? (nextAfter.startTime.getTime() - currentClass.endTime.getTime()) / 60_000
      : null;

    return (
      <div
        className="rounded-2xl border border-sky-200/50 p-6"
        style={{ background: "linear-gradient(135deg,rgba(224,242,254,0.7) 0%,rgba(255,255,255,0.7) 100%)", backdropFilter: "blur(12px)" }}
      >
        <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-widest mb-2">Happening now</p>
        <p className="text-2xl font-semibold text-sky-700">
          {currentClass.code}
          {currentClass.type === "office_hours" ? " · OH" : ""}
        </p>
        <p className="text-sm text-sky-500 mt-0.5">
          {currentClass.type === "office_hours" && currentClass.host
            ? currentClass.host
            : currentClass.name}
        </p>
        <p className="text-sm text-sky-400 mt-2">
          Ends in {minsLeft} min{minsLeft !== 1 ? "s" : ""}
          {currentClass.location ? ` · ${currentClass.location}` : ""}
        </p>

        {gapAfter !== null && gapAfter >= 20 && onStartFocus && (
          <button
            onClick={onStartFocus}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 text-sm font-medium hover:bg-sky-100 hover:shadow-sm active:scale-[0.98] transition-all"
          >
            <PlayIcon /> {fmtMins(gapAfter)} free after — start a focus session
          </button>
        )}
      </div>
    );
  }

  // ── No classes today, next day preview ───────────────────────────────────

  if (!nextClass && hasClasses && nextDay) {
    const first = nextDay.events[0];
    const startLabel = first.startTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return (
      <div className="rounded-2xl border border-sky-100/60 bg-gradient-to-br from-sky-50/40 to-white p-6">
        <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-widest mb-2">Right now</p>
        <p className="text-2xl font-light text-sky-800">No classes today</p>
        <p className="text-sm text-sky-400 mt-2">
          Next up: <span className="font-semibold text-sky-500">{first.code}</span>{" "}
          {nextDay.dayName.toLowerCase() === "tomorrow" ? "tomorrow" : `on ${nextDay.dayName}`} at {startLabel}
          {first.location ? ` · ${first.location}` : ""}
        </p>
        {nextDay.events.length > 1 && (
          <p className="text-xs text-sky-300 mt-1">
            +{nextDay.events.length - 1} more class{nextDay.events.length - 1 !== 1 ? "es" : ""} that {nextDay.dayName.toLowerCase()}
          </p>
        )}
        {onStartFocus && (
          <button
            onClick={onStartFocus}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 text-sm font-medium hover:bg-sky-100 hover:shadow-sm active:scale-[0.98] transition-all"
          >
            <PlayIcon /> Start a focus session
          </button>
        )}
      </div>
    );
  }

  // ── No classes at all ─────────────────────────────────────────────────────

  if (!nextClass || minsUntilNext === null) {
    return (
      <div className="rounded-2xl border border-sky-100/60 bg-gradient-to-br from-sky-50/40 to-white p-6">
        <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-widest mb-2">Right now</p>
        <p className="text-2xl font-light text-sky-800">No classes today</p>
        <p className="text-sm text-sky-300 mt-1">Enjoy your free day.</p>
      </div>
    );
  }

  // ── Free time before next class ───────────────────────────────────────────

  const hasEnoughForFocus = minsUntilNext >= 25;
  const hasShortWindow    = minsUntilNext >= 8 && minsUntilNext < 25;
  const suggestions       = getQuickTasks(minsUntilNext);
  const timeStr           = nextClass.startTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const focusDuration     = Math.min(Math.floor(minsUntilNext) - 5, 20);

  return (
    <div className="rounded-2xl border border-sky-100/60 bg-gradient-to-br from-white to-sky-50/40 p-6">
      <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-widest mb-2">Right now</p>

      <p className="text-2xl font-light text-sky-800 leading-snug">
        {fmtMins(minsUntilNext)} until{" "}
        <span className="font-semibold text-sky-600">{nextClass.code}</span>
      </p>
      <p className="text-sm text-sky-400 mt-0.5">
        {timeStr}{nextClass.location ? ` · ${nextClass.location}` : ""}
      </p>

      <div className="mt-5">
        {hasEnoughForFocus ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartFocus}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <PlayIcon /> Start {focusDuration}-min focus
            </button>
            <span className="text-xs text-sky-300">or knock out a task below</span>
          </div>
        ) : hasShortWindow ? (
          <div>
            <p className="text-xs font-medium text-sky-400 mb-2.5">Quick things you could do:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((task) => (
                <span
                  key={task}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-600"
                >
                  <span className="w-1 h-1 rounded-full bg-sky-300 shrink-0" />
                  {task}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-sky-400">Head over soon — class starts at {timeStr}.</p>
        )}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
