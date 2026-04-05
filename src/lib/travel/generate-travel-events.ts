import { parseLocationToBuilding, getWalkingMinutes, locationLabel } from "./walking-times";
import type { CalendarEvent, EventType } from "@/components/calendar-view/types";
import type { TravelPreferences } from "@/hooks/useTravelPreferences";

/** Check if travel should be generated for a given event type based on prefs */
function isTravelEnabledForType(type: string, prefs: TravelPreferences): boolean {
  switch (type) {
    case "lecture": return prefs.travelForLectures;
    case "discussion": return prefs.travelForDiscussions;
    case "lab": return prefs.travelForLabs;
    case "office_hours": return prefs.travelForOfficeHours;
    default: return false;
  }
}

/** Class-type events that participate in the travel system */
const CLASS_TYPES = new Set(["lecture", "discussion", "lab", "office_hours"]);

/**
 * Generate "travel" calendar events before each class event.
 *
 * Key distinction:
 * - "travel enabled" = show a travel block before this event
 * - "attending" = you will physically be at this location (affects origin for next event)
 *
 * An event you attend but don't want travel for (e.g. OH with toggle off) still
 * updates your physical location for subsequent travel calculations.
 *
 * A "skipped" event (user explicitly marked skip) means you won't attend, so it
 * does NOT update your location.
 */
export function generateTravelEvents(
  classEvents: CalendarEvent[],
  homeBase: string | null,
  prefs: TravelPreferences,
): CalendarEvent[] {
  if (classEvents.length === 0 || !prefs.travelEventsEnabled) return [];

  // Group events by calendar date
  const byDate = new Map<string, CalendarEvent[]>();
  for (const ev of classEvents) {
    if (!CLASS_TYPES.has(ev.type)) continue;
    const dateKey = ev.startTime.toISOString().split("T")[0];
    let arr = byDate.get(dateKey);
    if (!arr) { arr = []; byDate.set(dateKey, arr); }
    arr.push(ev);
  }

  const travelEvents: CalendarEvent[] = [];

  for (const [, dayEvents] of byDate) {
    const sorted = [...dayEvents].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    // Track where you physically are (updated by ALL attended events)
    let currentBuilding: string | null = null;
    let currentEndTime: Date | null = null;
    let hadAnyEvent = false;

    for (let i = 0; i < sorted.length; i++) {
      const classEv = sorted[i];
      const isToggled = prefs.skippedEventIds.includes(classEv.id);
      const typeEnabled = isTravelEnabledForType(classEv.type, prefs);

      // skippedEventIds acts as an override toggle:
      // - type ON + toggled = skip (no travel)
      // - type OFF + toggled = enable (override)
      // - type ON + not toggled = travel
      // - type OFF + not toggled = no travel
      const wantTravel = typeEnabled ? !isToggled : isToggled;

      const building = classEv.location
        ? parseLocationToBuilding(classEv.location)
        : null;

      if (wantTravel && building) {
        // Determine origin
        let fromName: string | null;

        if (currentBuilding) {
          fromName = currentBuilding;
        } else if (!hadAnyEvent) {
          // First event of the day — use home base
          fromName = homeBase;
        } else {
          fromName = null;
        }

        // Check location overrides for long gaps
        if (fromName && currentEndTime) {
          const gapMinutes = (classEv.startTime.getTime() - currentEndTime.getTime()) / 60_000;
          for (const override of prefs.locationOverrides) {
            if (gapMinutes >= override.minGapMinutes) {
              fromName = override.location;
              break;
            }
          }
        }

        if (fromName && fromName !== building) {
          const walkMins = getWalkingMinutes(fromName, building);
          if (walkMins != null && walkMins > 0) {
            // Travel ends at class start, starts walkMins before that
            // Allow overlap with previous class (no clamping)
            const endTime = new Date(classEv.startTime);
            const startTime = new Date(endTime.getTime() - walkMins * 60_000);

            const fromLabel = locationLabel(fromName);
            const toLabel = locationLabel(building);

            travelEvents.push({
              id: `travel-${classEv.id}`,
              title: `${fromName} → ${building}`,
              startTime,
              endTime,
              type: "travel" as EventType,
              location: `${fromLabel} → ${toLabel}`,
              description: `${walkMins} min walk`,
              classCode: classEv.classCode,
            });
          }
        }
      }

      // Only update physical location for events with travel enabled.
      // If travel is off for a type (e.g. OH), treat it as if you're not going.
      if (wantTravel && building) {
        currentBuilding = building;
        currentEndTime = classEv.endTime;
      }
      hadAnyEvent = true;
    }
  }

  return travelEvents;
}
