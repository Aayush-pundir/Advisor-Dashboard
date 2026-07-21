import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { canManageCampaigns } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { toCsv } from "@/lib/csv";
import { maskPhone, maskEmail } from "@/lib/utils";

export async function GET() {
  const actor = await getAuthedUser();
  if (!actor || !canManageCampaigns(actor.role as UserRole)) {
    return new Response("Forbidden", { status: 403 });
  }

  const contacts = await db.marketingContact.findMany({
    include: { partner: { select: { firmName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    contacts.map((c) => ({
      contactName: c.contactName,
      phone: maskPhone(c.phone),
      email: c.email ? maskEmail(c.email) : "",
      partner: c.partner.firmName,
      city: c.city ?? "",
      createdAt: c.createdAt.toISOString(),
    })),
    [
      { key: "contactName", header: "POC" },
      { key: "phone", header: "Phone (masked)" },
      { key: "email", header: "Email (masked)" },
      { key: "partner", header: "Uploaded By" },
      { key: "city", header: "City" },
      { key: "createdAt", header: "Uploaded At" },
    ],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="marketing-contacts.csv"`,
    },
  });
}
