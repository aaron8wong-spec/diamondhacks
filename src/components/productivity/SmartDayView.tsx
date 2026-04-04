"use client";

import { useState } from "react";
import { useClasses } from "@/hooks/useClasses";
import { getTodaysEvents } from "./types";
import { RightNowPanel } from "./RightNowPanel";
import { LeaveReminder } from "./LeaveReminder";
import { DailyTimeline } from "./DailyTimeline";
import { TinyTasks } from "./TinyTasks";
import { FocusTimer } from "./FocusTimer";

// Mock events for demo / when no real data exists
function makeMockEvents() {
  const today = new Date();
  const at = (h: number, m: number) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d;
  };
  return [
    {
      id: "demo-1",
      code: "CSE 101",
      name: "Introduction to Programming",
      startTime: at(9, 0),
      endTime: at(10, 15),
      location: "PCYNH 106",
      type: "Lecture",
    },
    {
      id: "demo-2",
      code: "MATH 20C",
      name: "Calculus & Analytic Geometry",
      startTime: at(11, 0),
      endTime: at(11, 50),
      location: "CENTR 115",
      type: "Lecture",
    },
    {
      id: "demo-3",
      code: "CSE 110",
      name: "Software Engineering",
      startTime: at(14, 0),
      endTime: at(15, 15),
      location: "EBU3B 2154",
      type: "Discussion",
    },
  ];
}

export function SmartDayView() {
  const { classes, loading } = useClasses();
  const [travelMins, setTravelMins] = useState(10);

  const realEvents = getTodaysEvents(classes);
  const events = realEvents.length > 0 ? realEvents : makeMockEvents();
  const usingMock = realEvents.length === 0 && !loading;

  const now = new Date();
  const nextClass = events.find((e) => e.startTime > now);
  const showLeaveReminder =
    nextClass != null &&
    nextClass.startTime.getTime() - now.getTime() < 90 * 60_000;

  return (
    <div className="space-y-4">
      {/* Demo banner */}
      {usingMock && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-xs text-slate-400">
            Showing sample schedule. Import your Canvas classes to see your real day.
          </span>
        </div>
      )}

      {/* Top: Right Now */}
      <RightNowPanel events={events} />

      {/* Leave reminder — only when approaching next class */}
      {showLeaveReminder && nextClass && (
        <LeaveReminder
          nextClass={nextClass}
          travelMinutes={travelMins}
          onChangeTravelTime={setTravelMins}
        />
      )}

      {/* Main layout: timeline + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timeline — takes up 2/3 */}
        <div className="lg:col-span-2">
          <DailyTimeline events={events} />
        </div>

        {/* Sidebar — tasks + timer */}
        <div className="flex flex-col gap-4">
          <TinyTasks />
          <FocusTimer />
        </div>
      </div>
    </div>
  );
}
