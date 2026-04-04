"use client";

import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-600">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl border border-sky-100 bg-white/70 backdrop-blur-sm px-3 py-2 text-sm text-slate-700 placeholder-sky-300 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200 ${error ? "border-red-300" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
