"use client";

import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "light" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary:   "bg-sky-400 hover:bg-sky-500 text-white shadow-sm shadow-sky-200/50",
  light:     "bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100",
  secondary: "bg-white/70 hover:bg-white text-slate-600 border border-sky-100 backdrop-blur-sm",
  danger:    "bg-red-400 hover:bg-red-500 text-white",
  ghost:     "hover:bg-sky-50 text-sky-600",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
