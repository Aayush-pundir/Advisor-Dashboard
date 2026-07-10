import { db } from "@/lib/db";

export async function logAudit(entry: {
  actorId?: string | null;
  actorName: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  meta?: string | null;
}) {
  await db.auditLog.create({
    data: {
      actorId: entry.actorId ?? null,
      actorName: entry.actorName,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      meta: entry.meta ?? null,
    },
  });
}
