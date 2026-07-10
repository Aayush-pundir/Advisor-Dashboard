import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { canViewCommissions } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const actor = await getAuthedUser();
  if (!actor || !canViewCommissions(actor.role as UserRole)) {
    return new Response("Forbidden", { status: 403 });
  }

  const commissions = await db.commission.findMany({
    include: { partner: { select: { firmName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    commissions.map((c) => ({
      partner: c.partner.firmName,
      type: c.type,
      amount: c.amount,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      creditedAt: c.creditedAt?.toISOString() ?? "",
    })),
    [
      { key: "partner", header: "Partner" },
      { key: "type", header: "Type" },
      { key: "amount", header: "Amount (INR)" },
      { key: "status", header: "Status" },
      { key: "createdAt", header: "Created At" },
      { key: "creditedAt", header: "Credited At" },
    ],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="commission-ledger.csv"`,
    },
  });
}
