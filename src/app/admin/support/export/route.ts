import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const actor = await getAuthedUser();
  if (!actor) return new Response("Forbidden", { status: 403 });

  const tickets = await db.supportTicket.findMany({
    include: { user: { select: { name: true, email: true } }, partner: { select: { firmName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    tickets.map((t) => ({
      subject: t.subject,
      priority: t.priority,
      status: t.status,
      raisedBy: t.user.name,
      partner: t.partner?.firmName ?? "",
      escalationLevel: t.escalationLevel,
      createdAt: t.createdAt.toISOString(),
    })),
    [
      { key: "subject", header: "Subject" },
      { key: "priority", header: "Priority" },
      { key: "status", header: "Status" },
      { key: "raisedBy", header: "Raised By" },
      { key: "partner", header: "Partner" },
      { key: "escalationLevel", header: "Escalation Level" },
      { key: "createdAt", header: "Created At" },
    ],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="support-tickets.csv"`,
    },
  });
}
