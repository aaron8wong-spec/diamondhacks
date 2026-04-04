"use client";

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ enabled, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <button
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 disabled:opacity-40 ${
          enabled ? "bg-sky-400" : "bg-sky-100"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {label && (
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      )}
    </label>
  );
}
