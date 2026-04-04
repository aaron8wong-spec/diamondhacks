import type { ClassInfo } from "@/hooks/useClasses";

export interface ClassEvent {
  id: string;
  code: string;
  name: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  type?: string;
}

function parseTimeStr(timeStr: string, base: Date): Date {
  const match = timeStr.trim().match(/^(\d+):(\d+)\s*(am|pm)?$/i);
  if (!match) return base;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const p = match[3]?.toLowerCase();
  if (p === "pm" && h !== 12) h += 12;
  if (p === "am" && h === 12) h = 0;
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

export function getTodaysEvents(classes: ClassInfo[]): ClassEvent[] {
  const today = new Date();
  const dow = today.getDay();
  const events: ClassEvent[] = [];

  classes.forEach((cls) => {
    cls.schedule.forEach((slot, i) => {
      if (slot.dayOfWeek === dow) {
        events.push({
          id: `${cls.id}-${i}`,
          code: cls.code,
          name: cls.name,
          startTime: parseTimeStr(slot.startTime, today),
          endTime: parseTimeStr(slot.endTime, today),
          location: slot.location,
          type: slot.type,
        });
      }
    });
  });

  return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${Math.round(mins)}m`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
