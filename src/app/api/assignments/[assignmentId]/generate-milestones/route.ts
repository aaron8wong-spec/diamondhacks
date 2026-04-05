// ============================================================
// Drop into src/app/api/assignments/[assignmentId]/generate-milestones/route.ts
// ============================================================
import { withAuth } from "@/lib/auth/middleware";
import { assignmentProvider } from "@/lib/extensions/assignment-provider";

export const POST = withAuth(async (req, _user, { params }) => {
  const { assignmentId } = await params;
  try {
    let extraContext: string | undefined;
    try {
      const body = await req.json();
      extraContext = body.extraContext;
    } catch { /* no body is fine */ }
    const assignment = await assignmentProvider.generateMilestones(assignmentId, extraContext);
    return Response.json({ assignment });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate milestones";
    return Response.json({ error: message }, { status: 500 });
  }
});
