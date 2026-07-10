import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { canManageLeads } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { toCsv } from "@/lib/csv";
import { maskPhone, maskEmail } from "@/lib/utils";

export async function GET() {
  const actor = await getAuthedUser();
  if (!actor || !canManageLeads(actor.role as UserRole)) {
    return new Response("Forbidden", { status: 403 });
  }

  const leads = await db.lead.findMany({
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
      dealValue: l.dealValue,
      assignedTo: l.assignedTo?.name ?? "",
      createdAt: l.createdAt.toISOString(),
    })),
    [
      { key: "businessName", header: "Business" },
      { key: "contactName", header: "Contact" },
      { key: "phone", header: "Phone (masked)" },
      { key: "email", header: "Email (masked)" },
      { key: "partner", header: "Referred By" },
      { key: "source", header: "Source" },
      { key: "stage", header: "Stage" },
      { key: "dealValue", header: "Deal Value (INR)" },
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
