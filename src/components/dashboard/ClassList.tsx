"use client";

import { useClasses } from "@/hooks/useClasses";
import { ClassCard } from "./ClassCard";
import { EmptyState } from "./EmptyState";

export function ClassList() {
  const { classes, loading, error, toggleClass, deleteClass } = useClasses();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return <EmptyState />;
  }

  const enabledCount = classes.filter((c) => c.enabled).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {enabledCount} of {classes.length} classes enabled for calendar export
        </p>
      </div>
      <div className="space-y-4">
        {classes.map((cls) => (
          <ClassCard
            key={cls.id}
            classInfo={cls}
            onToggle={toggleClass}
            onDelete={deleteClass}
          />
        ))}
      </div>
    </div>
  );
}
