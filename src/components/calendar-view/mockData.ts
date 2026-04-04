import type { CalendarEvent, EventType } from "./types";

function at(base: Date, h: number, m: number): Date {
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getMonday(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  r.setDate(r.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

interface CoursePattern {
  id: string;
  code: string;
  name: string;
  type: EventType;
  days: number[]; // 0=Sun ... 6=Sat
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  location: string;
}

const PATTERNS: CoursePattern[] = [
  {
    id: "cse101",
    code: "CSE 101",
    name: "Introduction to Programming",
    type: "lecture",
    days: [1, 3, 5],
    startH: 9, startM: 0, endH: 10, endM: 15,
    location: "PCYNH 106",
  },
  {
    id: "math20c",
    code: "MATH 20C",
    name: "Calculus & Analytic Geometry",
    type: "lecture",
    days: [1, 3, 5],
    startH: 11, startM: 0, endH: 11, endM: 50,
    location: "CENTR 115",
  },
  {
    id: "cse110",
    code: "CSE 110",
    name: "Software Engineering",
    type: "discussion",
    days: [2, 4],
    startH: 14, startM: 0, endH: 15, endM: 15,
    location: "CSE B270",
  },
  {
    id: "cse110lab",
    code: "CSE 110",
    name: "Software Engineering Lab",
    type: "lab",
    days: [4],
    startH: 16, startM: 0, endH: 17, endM: 50,
    location: "EBU3B 2154",
  },
  {
    id: "cogs9",
    code: "COGS 9",
    name: "Introduction to Data Science",
    type: "lecture",
    days: [2, 4],
    startH: 9, startM: 30, endH: 10, endM: 45,
    location: "YORK 2722",
  },
];

let counter = 0;
function uid() {
  return `evt-${++counter}`;
}

export function generateMockEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Generate recurring classes for 5 weeks (2 back + current + 2 forward)
  const today = new Date();
  const refMonday = getMonday(today);

  for (let weekOffset = -2; weekOffset <= 2; weekOffset++) {
    const weekStart = addDays(refMonday, weekOffset * 7);

    for (const p of PATTERNS) {
      for (const dow of p.days) {
        // dow: 0=Sun,1=Mon ... weekStart is Monday (1)
        const dayOffset = dow === 0 ? 6 : dow - 1; // offset from Monday
        const date = addDays(weekStart, dayOffset);
        events.push({
          id: uid(),
          title: p.code,
          classCode: p.code,
          startTime: at(date, p.startH, p.startM),
          endTime: at(date, p.endH, p.endM),
          type: p.type,
          location: p.location,
          description: p.name,
        });
      }
    }
  }

  // One-off events anchored to this week
  const mon = addDays(refMonday, 0);
  const tue = addDays(refMonday, 1);
  const wed = addDays(refMonday, 2);
  const thu = addDays(refMonday, 3);
  const fri = addDays(refMonday, 4);

  // Study blocks
  events.push({
    id: uid(),
    title: "Study — CSE 101",
    startTime: at(mon, 13, 0),
    endTime: at(mon, 14, 30),
    type: "study",
    location: "Geisel Library",
  });
  events.push({
    id: uid(),
    title: "Study — MATH 20C",
    startTime: at(wed, 13, 0),
    endTime: at(wed, 14, 0),
    type: "study",
    location: "Price Center",
  });
  events.push({
    id: uid(),
    title: "Study group — CSE 110",
    startTime: at(fri, 16, 0),
    endTime: at(fri, 17, 30),
    type: "study",
    location: "CSE Building",
  });

  // Tasks
  events.push({
    id: uid(),
    title: "PA1 due",
    startTime: at(tue, 23, 59),
    endTime: at(tue, 23, 59),
    type: "task",
    description: "CSE 101 Programming Assignment 1",
  });
  events.push({
    id: uid(),
    title: "Problem Set 4",
    startTime: at(fri, 23, 59),
    endTime: at(fri, 23, 59),
    type: "task",
    description: "MATH 20C Problem Set",
  });

  // Reminders
  events.push({
    id: uid(),
    title: "Office hours — Prof. Chen",
    startTime: at(tue, 11, 0),
    endTime: at(tue, 12, 0),
    type: "reminder",
    location: "CSE 4218",
  });

  // Personal
  events.push({
    id: uid(),
    title: "Lunch with friends",
    startTime: at(thu, 12, 0),
    endTime: at(thu, 13, 0),
    type: "personal",
    location: "Price Center",
  });

  return events;
}
