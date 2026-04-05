// ============================================================
// Single Todo API
// Drop into src/app/api/todos/[todoId]/route.ts
// ============================================================
import { withAuth } from "@/lib/auth/middleware";
import { todoProvider } from "@/lib/extensions/todo-provider";
import { assignmentProvider } from "@/lib/extensions/assignment-provider";

export const PATCH = withAuth(async (req, _user, { params }) => {
  const { todoId } = await params;
  const body = await req.json();

  const updated = await todoProvider.updateTodo(todoId, body);
  if (!updated) {
    return Response.json({ error: "Todo not found" }, { status: 404 });
  }

  // Sync completion back to the linked milestone
  if (body.completed !== undefined && updated.canvasAssignmentId?.startsWith("milestone-")) {
    const milestoneId = updated.canvasAssignmentId.replace("milestone-", "");
    // Find the assignment that owns this milestone
    const allAssignments = await assignmentProvider.getAllAssignments(updated.userId);
    for (const assignment of allAssignments) {
      const milestone = assignment.milestones.find((m) => m.id === milestoneId);
      if (milestone) {
        await assignmentProvider.updateMilestone(assignment.id, milestoneId, {
          completed: body.completed,
        });
        break;
      }
    }
  }

  return Response.json({ todo: updated });
});

export const DELETE = withAuth(async (_req, _user, { params }) => {
  const { todoId } = await params;
  const deleted = await todoProvider.deleteTodo(todoId);
  if (!deleted) {
    return Response.json({ error: "Todo not found" }, { status: 404 });
  }
  return Response.json({ success: true });
});
