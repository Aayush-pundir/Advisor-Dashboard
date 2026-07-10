import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import type { UserRole } from "@/lib/enums";

type Result = { type: string; label: string; sublabel: string; href: string };

const ADMIN_ROLES: UserRole[] = ["ADMIN", "PARTNER_MANAGER", "MARKETING_OPS", "SALES"];

export async function GET(req: NextRequest) {
  const user = await getAuthedUser();
  if (!user) return Response.json({ results: [] }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return Response.json({ results: [] });

  const results: Result[] = [];

  if (ADMIN_ROLES.includes(user.role as UserRole)) {
    const [partners, leads] = await Promise.all([
      db.partner.findMany({
        where: {
          OR: [
            { firmName: { contains: q } },
            { contactName: { contains: q } },
            { email: { contains: q } },
          ],
        },
        take: 8,
      }),
      db.lead.findMany({
        where: {
          OR: [
            { businessName: { contains: q } },
            { contactName: { contains: q } },
            { email: { contains: q } },
          ],
        },
        include: { partner: { select: { firmName: true } } },
        take: 8,
      }),
    ]);

    for (const p of partners) {
      results.push({
        type: "Partner",
        label: p.firmName,
        sublabel: `${p.contactName} · ${p.stage}`,
        href: `/admin/partners/${p.id}`,
      });
    }
    for (const l of leads) {
      results.push({
        type: "Lead",
        label: l.businessName,
        sublabel: `Referred by ${l.partner.firmName} · ${l.stage}`,
        href: `/admin/leads`,
      });
    }
  } else if (user.partnerId) {
    const leads = await db.lead.findMany({
      where: {
        partnerId: user.partnerId,
        OR: [
          { businessName: { contains: q } },
          { contactName: { contains: q } },
        ],
      },
      take: 10,
    });
    for (const l of leads) {
      results.push({
        type: "Lead",
        label: l.businessName,
        sublabel: `${l.contactName} · ${l.stage}`,
        href: `/partner/leads`,
      });
    }
  }

  return Response.json({ results });
}
