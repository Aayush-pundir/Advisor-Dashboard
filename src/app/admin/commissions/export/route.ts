import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { canViewCommissions } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { toCsv } from "@/lib/csv";

export async function GET(request: Request) {
  const actor = await getAuthedUser();
  if (!actor || !canViewCommissions(actor.role as UserRole)) {
    return new Response("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get("partnerId") || undefined;
  const status = searchParams.get("status") || undefined;
  const type = searchParams.get("type") || undefined;
  const billingCycle = searchParams.get("billingCycle") || undefined;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  const where = {
    ...(partnerId ? { partnerId } : {}),
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(billingCycle ? { lead: { billingCycle } } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
          },
        }
      : {}),
  };

  const commissions = await db.commission.findMany({
    where,
    include: {
      partner: { select: { id: true, firmName: true } },
      lead: { select: { id: true, businessName: true, dealValue: true, billingCycle: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    commissions.map((c) => ({
      clientId: c.lead?.id ?? "",
      clientName: c.lead?.businessName ?? "",
      partnerId: c.partner.id,
      partnerName: c.partner.firmName,
      revenueFromClient: c.lead?.dealValue ?? "",
      commercials: c.lead?.billingCycle === "MONTHLY" ? "Monthly" : "Annual",
      period: c.createdAt.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      type: c.type,
      advisoryFees: c.amount,
      status: c.status,
      paidAt: c.paidAt?.toISOString() ?? "",
    })),
    [
      { key: "clientId", header: "Client ID" },
      { key: "clientName", header: "Client Name" },
      { key: "partnerId", header: "Partner ID" },
      { key: "partnerName", header: "Partner Name" },
      { key: "revenueFromClient", header: "Revenue From Client (INR)" },
      { key: "commercials", header: "Annual/Monthly Commercials" },
      { key: "period", header: "Period" },
      { key: "type", header: "Type" },
      { key: "advisoryFees", header: "Advisory Fees (INR)" },
      { key: "status", header: "Status" },
      { key: "paidAt", header: "Paid Date" },
    ],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="advisory-fees-mis.csv"`,
    },
  });
}
