"use client";

import { useState, useEffect } from "react";
import type { ClassEvent } from "./types";

interface LeaveReminderProps {
  nextClass: ClassEvent;
  travelMinutes: number;
  onChangeTravelTime?: (mins: number) => void;
}

export function LeaveReminder({
  nextClass,
  travelMinutes,
  onChangeTravelTime,
}: LeaveReminderProps) {
  const [now, setNow] = useState(() => new Date());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(travelMinutes));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  const leaveAt = new Date(nextClass.startTime.getTime() - travelMinutes * 60_000);
  const minsUntilLeave = (leaveAt.getTime() - now.getTime()) / 60_000;

  const isUrgent = minsUntilLeave <= 5 && minsUntilLeave > 0;
  const isLate = minsUntilLeave <= 0;

  const leaveLabel = leaveAt.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  let statusText = "";
  let subText = "";

  if (isLate) {
    const minsLate = Math.abs(Math.floor(minsUntilLeave));
    statusText = minsLate === 0 ? "Leave now" : `${minsLate}m overdue`;
    subText = "Head to class";
  } else if (minsUntilLeave < 60) {
    statusText = `Leave in ${Math.ceil(minsUntilLeave)}m`;
    subText = `Depart by ${leaveLabel}`;
  } else {
    const h = Math.floor(minsUntilLeave / 60);
    const m = Math.round(minsUntilLeave % 60);
    statusText = `Leave in ${h}h${m > 0 ? ` ${m}m` : ""}`;
    subText = `Depart by ${leaveLabel}`;
  }

  const handleSaveTravel = () => {
    const val = parseInt(draft);
    if (!isNaN(val) && val >= 0 && onChangeTravelTime) {
      onChangeTravelTime(val);
    }
    setEditing(false);
  };

  return (
    <div
      className={`rounded-2xl border shadow-sm p-4 transition-colors ${
        isLate
          ? "bg-amber-50 border-sky-100"
          : isUrgent
          ? "bg-amber-50 border-sky-100"
          : "bg-white border-sky-100/60"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-1">
            Leave reminder
          </p>
          <p
            className={`text-lg font-semibold ${
              isLate || isUrgent ? "text-sky-600" : "text-sky-700"
            }`}
          >
            {statusText}
          </p>
          <p className="text-sm text-sky-400 mt-0.5">{subText}</p>
          <p className="text-xs text-sky-400 mt-1">
            for {nextClass.code}
            {nextClass.location ? ` · ${nextClass.location}` : ""}
          </p>
        </div>

        {/* Travel time editor */}
        <div className="text-right shrink-0">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={60}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTravel()}
                autoFocus
                className="w-12 text-sm text-center border border-sky-100 rounded-lg px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-sky-300"
              />
              <span className="text-xs text-sky-400">min</span>
              <button
                onClick={handleSaveTravel}
                className="text-sky-500 text-xs font-medium ml-1"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-sky-400 hover:text-sky-600 transition-colors"
            >
              {travelMinutes}m walk ✎
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
