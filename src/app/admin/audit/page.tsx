import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { canViewAuditLog } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function AdminAuditPage() {
  const actor = await getAuthedUser();
  if (!actor || !canViewAuditLog(actor.role as UserRole)) redirect("/admin");

  const entries = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <p className="mt-1 text-muted">Who certified, advanced, or approved what, across the CRM.</p>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">When</th>
              <th className="p-3 font-medium">Actor</th>
              <th className="p-3 font-medium">Action</th>
              <th className="p-3 font-medium">Target</th>
              <th className="p-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="p-3 whitespace-nowrap text-muted">{formatDate(e.createdAt)}</td>
                <td className="p-3">{e.actorName}</td>
                <td className="p-3 font-medium">{e.action.replace(/_/g, " ")}</td>
                <td className="p-3 text-muted">{e.targetType}</td>
                <td className="p-3 text-muted">{e.meta}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && <p className="p-6 text-center text-muted">No activity logged yet.</p>}
      </Card>
    </div>
  );
}
