import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET(request: Request) {
  const actor = await getAuthedUser();
  if (!actor) return new Response("Forbidden", { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const priority = searchParams.get("priority") || undefined;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  const where = {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
          },
        }
      : {}),
  };

  const tickets = await db.supportTicket.findMany({
    where,
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
      resolution: t.resolution ?? "",
      createdAt: t.createdAt.toISOString(),
      resolvedAt: t.resolvedAt?.toISOString() ?? "",
    })),
    [
      { key: "subject", header: "Subject" },
      { key: "priority", header: "Priority" },
      { key: "status", header: "Status" },
      { key: "raisedBy", header: "Raised By" },
      { key: "partner", header: "Partner" },
      { key: "escalationLevel", header: "Escalation Level" },
      { key: "resolution", header: "Resolution" },
      { key: "createdAt", header: "Created At" },
      { key: "resolvedAt", header: "Resolved At" },
    ],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="support-tickets.csv"`,
    },
  });
}
