import { parseLocationToBuilding, getWalkingMinutes, locationLabel } from "./walking-times";
import type { CalendarEvent, EventType } from "@/components/calendar-view/types";

const PEAK_BUFFER = 2; // extra minutes for class-change rush

/**
 * Generate "travel" calendar events that appear before each class event.
 *
 * - First class of the day: travel from homeBase (if set) to class building.
 * - Subsequent classes: travel from previous class building to next class building.
 * - Same building back-to-back: no travel event.
 * - Unknown buildings: skipped (no travel event generated).
 */
export function generateTravelEvents(
  classEvents: CalendarEvent[],
  homeBase: string | null,
): CalendarEvent[] {
  if (classEvents.length === 0) return [];

  // Group events by calendar date string
  const byDate = new Map<string, CalendarEvent[]>();
  for (const ev of classEvents) {
    // Only generate travel for class-type events
    const t = ev.type as string;
    if (t !== "lecture" && t !== "discussion" && t !== "lab" && t !== "office_hours") continue;

    const dateKey = ev.startTime.toISOString().split("T")[0];
    let arr = byDate.get(dateKey);
    if (!arr) {
      arr = [];
      byDate.set(dateKey, arr);
    }
    arr.push(ev);
  }

  const travelEvents: CalendarEvent[] = [];

  for (const [, dayEvents] of byDate) {
    // Sort by start time
    const sorted = [...dayEvents].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    for (let i = 0; i < sorted.length; i++) {
      const classEv = sorted[i];
      const toBuilding = classEv.location
        ? parseLocationToBuilding(classEv.location)
        : null;
      if (!toBuilding) continue;

      let fromName: string | null;
      let prevEndTime: Date | null;

      if (i === 0) {
        // First class of the day — travel from home
        fromName = homeBase;
        prevEndTime = null;
      } else {
        // Travel from previous class
        const prevEv = sorted[i - 1];
        fromName = prevEv.location
          ? parseLocationToBuilding(prevEv.location)
          : null;
        prevEndTime = prevEv.endTime;
      }

      if (!fromName) continue;
      if (fromName === toBuilding) continue; // same building

      const walkMins = getWalkingMinutes(fromName, toBuilding);
      if (walkMins == null || walkMins === 0) continue;

      const totalMins = walkMins + PEAK_BUFFER;
      const endTime = new Date(classEv.startTime);
      let startTime = new Date(endTime.getTime() - totalMins * 60_000);

      // If travel overlaps previous class, clamp
      let tight = false;
      if (prevEndTime && startTime < prevEndTime) {
        startTime = new Date(prevEndTime);
        tight = true;
      }

      const fromLabel = locationLabel(fromName);
      const toLabel = locationLabel(toBuilding);
      const tightTag = tight ? " (tight)" : "";

      travelEvents.push({
        id: `travel-${classEv.id}`,
        title: `Walk to ${toBuilding}${tightTag}`,
        startTime,
        endTime,
        type: "travel" as EventType,
        location: `${fromLabel} → ${toLabel}`,
        description: `${walkMins} min walk + ${PEAK_BUFFER} min buffer`,
        classCode: classEv.classCode,
      });
    }
  }

  return travelEvents;
}
