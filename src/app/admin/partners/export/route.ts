import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { canManagePartners } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const actor = await getAuthedUser();
  if (!actor || !canManagePartners(actor.role as UserRole)) {
    return new Response("Forbidden", { status: 403 });
  }

  const partners = await db.partner.findMany({ orderBy: { createdAt: "desc" } });

  const csv = toCsv(
    partners.map((p) => ({
      firmName: p.firmName,
      contactName: p.contactName,
      email: p.email,
      phone: p.phone,
      city: p.city,
      state: p.state,
      stage: p.stage,
      badgeTier: p.badgeTier,
      certLevel: p.certLevel,
      createdAt: p.createdAt.toISOString(),
    })),
    [
      { key: "firmName", header: "Firm" },
      { key: "contactName", header: "POC" },
      { key: "email", header: "Email" },
      { key: "phone", header: "Phone" },
      { key: "city", header: "City" },
      { key: "state", header: "State" },
      { key: "stage", header: "Stage" },
      { key: "badgeTier", header: "Badge Tier" },
      { key: "certLevel", header: "Cert Level" },
      { key: "createdAt", header: "Signed Up At" },
    ],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="partners.csv"`,
    },
  });
}
