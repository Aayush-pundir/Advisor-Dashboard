import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { canViewAuditLog } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const actor = await getAuthedUser();
  if (!actor || !canViewAuditLog(actor.role as UserRole)) {
    return new Response("Forbidden", { status: 403 });
  }

  const entries = await db.auditLog.findMany({ orderBy: { createdAt: "desc" } });

  const csv = toCsv(
    entries.map((e) => ({
      createdAt: e.createdAt.toISOString(),
      actorName: e.actorName,
      action: e.action,
      targetType: e.targetType,
      meta: e.meta,
    })),
    [
      { key: "createdAt", header: "When" },
      { key: "actorName", header: "Actor" },
      { key: "action", header: "Action" },
      { key: "targetType", header: "Target" },
      { key: "meta", header: "Detail" },
    ],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="audit-log.csv"`,
    },
  });
}
