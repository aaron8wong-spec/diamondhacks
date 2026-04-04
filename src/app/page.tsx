"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) window.location.href = "/dashboard";
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="max-w-xl text-center mb-14 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 text-sky-500 text-xs font-semibold tracking-widest uppercase mb-5 border border-sky-100">
          Student Productivity
        </div>
        <h1 className="text-6xl font-extralight tracking-tight text-sky-900 leading-tight">
          Canvas<span className="font-semibold text-sky-400">Cal</span>
        </h1>
        <p className="mt-5 text-lg text-slate-400 font-light leading-relaxed">
          A calm, intelligent schedule companion.<br />
          Import your Canvas classes. Own your time.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link href="/register">
            <Button size="lg">Get started free</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">Sign in</Button>
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid gap-4 sm:grid-cols-3 max-w-2xl w-full animate-fade-up">
        {[
          {
            step: "01",
            title: "Connect Canvas",
            desc: "Log in once through a secure browser session. Your credentials never leave your device.",
          },
          {
            step: "02",
            title: "Import Classes",
            desc: "AI navigates your Canvas courses and extracts your full schedule automatically.",
          },
          {
            step: "03",
            title: "Own Your Day",
            desc: "See your week at a glance, find focus windows, and export directly to Google Calendar.",
          },
        ].map(({ step, title, desc }) => (
          <div
            key={step}
            className="glass rounded-2xl p-5 text-left"
          >
            <span className="text-xs font-bold text-sky-300 tracking-widest">{step}</span>
            <h3 className="mt-2 text-sm font-semibold text-sky-800">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Soft decorative orbs */}
      <div
        className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(186,230,253,0.3) 0%, transparent 70%)", filter: "blur(40px)", transform: "translate(-30%, -30%)" }}
      />
      <div
        className="fixed bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(165,243,252,0.25) 0%, transparent 70%)", filter: "blur(40px)", transform: "translate(30%, 30%)" }}
      />
    </div>
  );
}
