"use client";

import { useState, useCallback, useEffect } from "react";

export interface TravelPreferences {
  homeBase: string | null;
  travelEventsEnabled: boolean;
}

const STORAGE_KEY = "canvascal_travel_prefs";

const DEFAULT_PREFS: TravelPreferences = {
  homeBase: null,
  travelEventsEnabled: true,
};

function loadPrefs(): TravelPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: TravelPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function useTravelPreferences() {
  const [prefs, setPrefs] = useState<TravelPreferences>(DEFAULT_PREFS);

  // Load from localStorage on mount (client only)
  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const setHomeBase = useCallback((homeBase: string | null) => {
    setPrefs((prev) => {
      const next = { ...prev, homeBase };
      savePrefs(next);
      return next;
    });
  }, []);

  const setTravelEnabled = useCallback((travelEventsEnabled: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, travelEventsEnabled };
      savePrefs(next);
      return next;
    });
  }, []);

  return { prefs, setHomeBase, setTravelEnabled };
}
