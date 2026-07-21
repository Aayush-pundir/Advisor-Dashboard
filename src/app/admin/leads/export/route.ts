import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { canManageLeads } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { toCsv } from "@/lib/csv";
import { maskPhone, maskEmail } from "@/lib/utils";

export async function GET(request: Request) {
  const actor = await getAuthedUser();
  if (!actor || !canManageLeads(actor.role as UserRole)) {
    return new Response("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage") || undefined;
  const source = searchParams.get("source") || undefined;
  const category = searchParams.get("category") || undefined;
  const assignedToId = searchParams.get("assignedToId") || undefined;
  const partnerId = searchParams.get("partnerId") || undefined;

  const leads = await db.lead.findMany({
    where: {
      ...(stage ? { stage } : {}),
      ...(source ? { source } : {}),
      ...(category ? { category } : {}),
      ...(assignedToId ? { assignedToId: assignedToId === "UNASSIGNED" ? null : assignedToId } : {}),
      ...(partnerId ? { partnerId } : {}),
    },
    include: { partner: { select: { firmName: true } }, assignedTo: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    leads.map((l) => ({
      businessName: l.businessName,
      contactName: l.contactName,
      phone: maskPhone(l.phone),
      email: maskEmail(l.email),
      partner: l.partner.firmName,
      source: l.source,
      stage: l.stage,
      category: l.category ?? "",
      dealValue: l.dealValue,
      billingCycle: l.billingCycle,
      assignedTo: l.assignedTo?.name ?? "",
      createdAt: l.createdAt.toISOString(),
    })),
    [
      { key: "businessName", header: "Business" },
      { key: "contactName", header: "POC" },
      { key: "phone", header: "Phone (masked)" },
      { key: "email", header: "Email (masked)" },
      { key: "partner", header: "Referred By" },
      { key: "source", header: "Source" },
      { key: "stage", header: "Stage" },
      { key: "category", header: "Category" },
      { key: "dealValue", header: "Deal Value (INR)" },
      { key: "billingCycle", header: "Billing Cycle" },
      { key: "assignedTo", header: "Assigned To" },
      { key: "createdAt", header: "Captured At" },
    ],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads.csv"`,
    },
  });
}
