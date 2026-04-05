"use client";

import { Button } from "@/components/ui/Button";
import { useTravelPreferences } from "@/hooks/useTravelPreferences";
import { ALL_RESIDENCES, ALL_BUILDINGS, locationLabel } from "@/lib/travel/walking-times";
import type { LocationOverride } from "@/hooks/useTravelPreferences";
import { useState } from "react";

const TYPE_OPTIONS = [
  { key: "lectures",    label: "Lectures",     prefsKey: "travelForLectures"    as const },
  { key: "discussions", label: "Discussions",  prefsKey: "travelForDiscussions" as const },
  { key: "labs",        label: "Labs",         prefsKey: "travelForLabs"        as const },
  { key: "officeHours", label: "Office Hours", prefsKey: "travelForOfficeHours" as const },
];

/* ── Shared field classes ─────────────────────────────────────────────────────*/

const selectCls =
  "rounded-lg border border-[#D3D3D3] dark:border-[#2E3347] bg-white dark:bg-[#1A1D27] px-3 py-2 text-sm text-[#000000] dark:text-[#F5F6F8] focus:outline-none focus:ring-2 focus:ring-blue-500";

const checkboxCls =
  "rounded border-[#D3D3D3] dark:border-[#2E3347] text-blue-500 focus:ring-blue-500 w-4 h-4 accent-blue-500";

/* ── Reusable card wrappers ───────────────────────────────────────────────────*/

function PrimaryCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#1A1D27] border border-[#EBEBEB] dark:border-[#1E2235] rounded-xl p-6 shadow-sm space-y-4">
      {children}
    </div>
  );
}

function SecondaryCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#F0F1F5] dark:bg-[#161820] border border-[#E2E4EC] dark:border-[#2E3347] rounded-xl p-6 space-y-4">
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const {
    prefs, setHomeBase, setTravelEnabled,
    setTravelForType, addLocationOverride, removeLocationOverride,
  } = useTravelPreferences();

  const [showAddOverride, setShowAddOverride] = useState(false);
  const [overrideGap, setOverrideGap] = useState("30");
  const [overrideLocation, setOverrideLocation] = useState("");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#000000] dark:text-[#F5F6F8]">Settings</h1>
        <p className="text-[#8F8F8F] dark:text-[#8F8F8F] mt-1 text-sm">
          Configure your campus location and travel preferences.
        </p>
      </div>

      {/* ── Your Residence — primary card ── */}
      <PrimaryCard>
        <div>
          <h2 className="text-base font-semibold text-[#000000] dark:text-[#F5F6F8]">Your Residence</h2>
          <p className="text-sm text-[#8F8F8F] dark:text-[#8F8F8F] mt-0.5">
            Used to calculate walking time to your first class each day and for Google Calendar travel events.
          </p>
        </div>
        <select
          value={prefs.homeBase ?? ""}
          onChange={(e) => setHomeBase(e.target.value || null)}
          className={`w-full max-w-xs ${selectCls}`}
        >
          <option value="">Not set</option>
          {ALL_RESIDENCES.map((r) => (
            <option key={r} value={r}>{locationLabel(r)}</option>
          ))}
        </select>
        {prefs.homeBase && (
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
            Walking times will be calculated from {locationLabel(prefs.homeBase)}.
          </p>
        )}
      </PrimaryCard>

      {/* ── Travel Events — secondary card ── */}
      <SecondaryCard>
        <div>
          <h2 className="text-base font-semibold text-[#000000] dark:text-[#F5F6F8]">Travel Events</h2>
          <p className="text-sm text-[#8F8F8F] dark:text-[#8F8F8F] mt-0.5">
            Show walking time blocks before events in your calendar and daily timeline.
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.travelEventsEnabled}
            onChange={(e) => setTravelEnabled(e.target.checked)}
            className={checkboxCls}
          />
          <span className="text-sm font-medium text-[#464646] dark:text-[#C8C8C8]">
            Enable travel blocks in calendar
          </span>
        </label>

        {prefs.travelEventsEnabled && (
          <div className="border-t border-[#D3D3D3] dark:border-[#2E3347] pt-4 space-y-4">
            <p className="text-sm font-medium text-[#464646] dark:text-[#C8C8C8]">
              Show travel time before:
            </p>
            <div className="space-y-2.5">
              {TYPE_OPTIONS.map(({ key, label, prefsKey }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs[prefsKey]}
                    onChange={(e) => setTravelForType(key, e.target.checked)}
                    className={checkboxCls}
                  />
                  <span className="text-sm text-[#464646] dark:text-[#C8C8C8]">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </SecondaryCard>

      {/* ── Location Overrides — secondary card ── */}
      {prefs.travelEventsEnabled && (
        <SecondaryCard>
          <div>
            <h2 className="text-base font-semibold text-[#000000] dark:text-[#F5F6F8]">Location Overrides</h2>
            <p className="text-sm text-[#8F8F8F] dark:text-[#8F8F8F] mt-0.5">
              If you spend long gaps at a specific location (like the library), set a rule so travel is calculated from there instead.
            </p>
          </div>

          {prefs.locationOverrides.length > 0 && (
            <div className="space-y-2">
              {prefs.locationOverrides.map((o: LocationOverride) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-lg border border-[#D3D3D3] dark:border-[#2E3347] bg-white dark:bg-[#1A1D27] px-3 py-2.5"
                >
                  <div className="text-sm text-[#464646] dark:text-[#C8C8C8]">
                    When gap &ge; <span className="font-semibold text-[#000000] dark:text-[#F5F6F8]">{o.minGapMinutes} min</span>,
                    {" "}walk from{" "}
                    <span className="font-semibold text-[#000000] dark:text-[#F5F6F8]">{locationLabel(o.location)}</span>
                  </div>
                  <button
                    onClick={() => removeLocationOverride(o.id)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium ml-3 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {showAddOverride ? (
            <div className="space-y-3 rounded-lg border border-[#D3D3D3] dark:border-[#2E3347] bg-white dark:bg-[#1A1D27] p-4">
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="text-[#464646] dark:text-[#C8C8C8]">When gap is at least</span>
                <input
                  type="number"
                  min={10}
                  max={180}
                  value={overrideGap}
                  onChange={(e) => setOverrideGap(e.target.value)}
                  className="w-16 text-center border border-[#D3D3D3] dark:border-[#2E3347] bg-white dark:bg-[#1A1D27] text-[#000000] dark:text-[#F5F6F8] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[#464646] dark:text-[#C8C8C8]">minutes, I&apos;ll be at:</span>
              </div>
              <select
                value={overrideLocation}
                onChange={(e) => setOverrideLocation(e.target.value)}
                className={`w-full ${selectCls}`}
              >
                <option value="">Select location...</option>
                <optgroup label="Landmarks">
                  <option value="Geisel">{locationLabel("Geisel")}</option>
                  <option value="Price">{locationLabel("Price")}</option>
                </optgroup>
                <optgroup label="Buildings">
                  {ALL_BUILDINGS.map((b) => (
                    <option key={b} value={b}>{locationLabel(b)}</option>
                  ))}
                </optgroup>
                <optgroup label="Residences">
                  {ALL_RESIDENCES.map((r) => (
                    <option key={r} value={r}>{locationLabel(r)}</option>
                  ))}
                </optgroup>
              </select>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={!overrideLocation}
                  onClick={() => {
                    addLocationOverride({
                      minGapMinutes: parseInt(overrideGap) || 30,
                      location: overrideLocation,
                      label: locationLabel(overrideLocation),
                    });
                    setShowAddOverride(false);
                    setOverrideLocation("");
                    setOverrideGap("30");
                  }}
                >
                  Add Rule
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddOverride(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setShowAddOverride(true)}>
              + Add Location Rule
            </Button>
          )}
        </SecondaryCard>
      )}
    </div>
  );
}
