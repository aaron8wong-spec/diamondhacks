"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { FocusTimer } from "@/components/productivity/FocusTimer";

export default function FocusPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) window.location.href = "/login";
  }, [user, loading]);

  if (loading || !user) return null;

  return (
    <FocusTimer
      fullscreen
      onClose={() => { window.location.href = "/dashboard"; }}
    />
  );
}
