import { withAuth } from "@/lib/auth/middleware";
import { repo } from "@/lib/db";
import { callAI } from "@/lib/ai/openrouter";

/**
 * POST /api/classes/chat
 * Body: { message: string }
 *
 * Uses AI to interpret a natural language edit instruction and propose
 * a structured change to class data. Returns the proposed patch for
 * user confirmation before applying.
 */
export const POST = withAuth(async (req, user) => {
  try {
    const { message } = await req.json();
    if (!message?.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const classes = await repo.findClassesByUserId(user.id);
    if (classes.length === 0) {
      return Response.json({
        reply: "You don't have any classes imported yet. Import from Canvas first.",
        patch: null,
      });
    }

    // Build a compact representation of current classes for context
    const classContext = classes.map((cls) => ({
      id: cls.id,
      code: cls.code,
      name: cls.name,
      instructor: cls.instructor,
      schedule: cls.schedule.map((s, i) => ({
        index: i,
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][s.dayOfWeek],
        dayOfWeek: s.dayOfWeek,
        time: `${s.startTime}-${s.endTime}`,
        location: s.location,
        type: s.type,
        host: s.host,
      })),
    }));

    const prompt = `You are a schedule editing assistant. The user wants to make a change to their class schedule.

CURRENT CLASSES:
${JSON.stringify(classContext, null, 2)}

USER REQUEST: "${message}"

Analyze the request and respond with a JSON object containing:
- "reply": A short human-readable description of what you'll change (1-2 sentences)
- "patch": An object with "classId" and "changes" — the minimal update to apply. Or null if the request is unclear.

The "changes" object should be a partial class update. For schedule changes, include the FULL updated schedule array for that class (with the modification applied).

RULES:
- To cancel/remove a schedule entry: remove it from the schedule array
- To change a location: update the location field of the matching schedule entry
- To change a time: update startTime/endTime of the matching entry
- To add a new entry: append to the schedule array
- For one-week-only cancellations: explain in "reply" that this is a permanent change and ask if they want to proceed. Set patch to null.
- If the request is ambiguous, ask for clarification in "reply" and set patch to null.
- dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

Return ONLY valid JSON. No markdown, no code blocks.

Example response for "change CSE 127 lecture location to CENTR 101":
{"reply":"I'll update CSE 127 lectures to CENTR 101.","patch":{"classId":"abc123","changes":{"schedule":[...updated schedule array...]}}}

Example response for unclear request:
{"reply":"Which class are you referring to? You have CSE 125 and CSE 127.","patch":null}`;

    const response = await callAI(prompt, { maxTokens: 2000 });

    let parsed: { reply: string; patch: { classId: string; changes: Record<string, unknown> } | null };
    try {
      const match = response.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found");
      parsed = JSON.parse(match[0]);
    } catch {
      return Response.json({
        reply: "I had trouble understanding that. Could you rephrase?",
        patch: null,
      });
    }

    return Response.json(parsed);
  } catch (error) {
    console.error("Chat edit error:", error);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
});

/**
 * PATCH /api/classes/chat
 * Body: { classId: string, changes: Record<string, unknown> }
 *
 * Applies a confirmed patch from the chat.
 */
export const PATCH = withAuth(async (req, user) => {
  try {
    const { classId, changes } = await req.json();
    if (!classId || !changes) {
      return Response.json({ error: "classId and changes are required" }, { status: 400 });
    }

    const cls = await repo.findClassById(classId);
    if (!cls || cls.userId !== user.id) {
      return Response.json({ error: "Class not found" }, { status: 404 });
    }

    const updated = await repo.updateClass(classId, changes);
    return Response.json({ class: updated });
  } catch (error) {
    console.error("Chat apply error:", error);
    return Response.json({ error: "Failed to apply changes" }, { status: 500 });
  }
});
