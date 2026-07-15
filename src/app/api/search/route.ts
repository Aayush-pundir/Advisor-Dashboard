import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import type { UserRole } from "@/lib/enums";

type Result = { type: string; label: string; sublabel: string; href: string };

const ADMIN_ROLES: UserRole[] = ["ADMIN", "OMNICARD_TEAM"];

export async function GET(req: NextRequest) {
  const user = await getAuthedUser();
  if (!user) return Response.json({ results: [] }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return Response.json({ results: [] });

  const results: Result[] = [];

  if (ADMIN_ROLES.includes(user.role as UserRole)) {
    const [partners, leads, tickets, contacts] = await Promise.all([
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
      db.supportTicket.findMany({
        where: { subject: { contains: q } },
        include: { user: { select: { name: true } } },
        take: 5,
      }),
      db.marketingContact.findMany({
        where: { contactName: { contains: q } },
        include: { partner: { select: { firmName: true } } },
        take: 5,
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
    for (const t of tickets) {
      results.push({
        type: "Ticket",
        label: t.subject,
        sublabel: `${t.user.name} · ${t.status}`,
        href: `/admin/support`,
      });
    }
    for (const c of contacts) {
      results.push({
        type: "Marketing contact",
        label: c.contactName,
        sublabel: c.partner.firmName,
        href: `/admin/campaigns`,
      });
    }
  } else if (user.partnerId) {
    const [leads, contacts] = await Promise.all([
      db.lead.findMany({
        where: {
          partnerId: user.partnerId,
          OR: [{ businessName: { contains: q } }, { contactName: { contains: q } }],
        },
        take: 8,
      }),
      db.marketingContact.findMany({
        where: { partnerId: user.partnerId, contactName: { contains: q } },
        take: 5,
      }),
    ]);
    for (const l of leads) {
      results.push({
        type: "Lead",
        label: l.businessName,
        sublabel: `${l.contactName} · ${l.stage}`,
        href: `/partner/leads`,
      });
    }
    for (const c of contacts) {
      results.push({
        type: "Marketing contact",
        label: c.contactName,
        sublabel: c.city ?? "",
        href: `/partner/leads?tab=marketing`,
      });
    }
  }

  return Response.json({ results });
}
