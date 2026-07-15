import { db } from "@/lib/db";
import { notifyInternalUsers } from "@/lib/notify";

/**
 * The record-activity timeline flags overdue tasks visually, but nothing
 * actually notifies anyone — this closes that loop. There's no job queue in
 * this app, so it runs lazily whenever the admin dashboard loads instead of
 * on a schedule; `escalatedAt` guards against re-notifying on every load.
 */
export async function escalateOverdueActivities() {
  const overdue = await db.recordActivity.findMany({
    where: {
      status: { not: "COMPLETED" },
      escalatedAt: null,
      dueDate: { lt: new Date() },
    },
  });
  if (overdue.length === 0) return;

  for (const activity of overdue) {
    const href = activity.relatedToType === "LEAD" ? `/admin/leads/${activity.relatedToId}` : `/admin/partners/${activity.relatedToId}`;
    const roles = ["ADMIN", "OMNICARD_TEAM"];

    await notifyInternalUsers(roles, {
      type: "ACTIVITY_OVERDUE",
      title: `Overdue: ${activity.subject}`,
      body: `Logged by ${activity.createdByName}, was due ${activity.dueDate!.toLocaleDateString("en-IN")}.`,
      href,
    });
  }

  await db.recordActivity.updateMany({
    where: { id: { in: overdue.map((a) => a.id) } },
    data: { escalatedAt: new Date() },
  });
}
