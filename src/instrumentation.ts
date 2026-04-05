/**
 * Next.js instrumentation hook — runs once when the server starts.
 * Used to start the background reminder scheduler.
 */
export async function register() {
  // Only run on the server, not during build
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureSchedulerRunning } = await import("@/lib/scheduler/reminder-scheduler");
    ensureSchedulerRunning();
  }
}
