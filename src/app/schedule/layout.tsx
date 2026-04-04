"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
