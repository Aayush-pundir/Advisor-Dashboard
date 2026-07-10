"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthedUser, getSession } from "@/lib/auth";
import { canManagePartners } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { notifyInternalUsers } from "@/lib/notify";
import { slugify, randomReferralCode } from "@/lib/slug";
import { pickNextSalesRep } from "@/lib/assignment";
import type { UserRole } from "@/lib/enums";

export type BulkLeadRow = {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  city?: string;
  dealValue?: number;
};

/** Partner-side bulk client upload (Step 6.1 at scale) — every row is tagged
 * BULK_UPLOAD so admin/marketing can distinguish self-service imports from
 * organically captured leads when running masked campaigns. */
export async function bulkImportLeadsAction(
  rows: BulkLeadRow[],
): Promise<{ ok: boolean; created: number; skipped: number; error?: string }> {
  const session = await getSession();
  if (!session?.partnerId) {
    return { ok: false, created: 0, skipped: 0, error: "You must be signed in as an advisor." };
  }

  const valid = rows.filter((r) => r.businessName?.trim() && r.contactName?.trim() && r.phone?.trim() && r.email?.trim());
  if (valid.length === 0) {
    return { ok: false, created: 0, skipped: rows.length, error: "No valid rows found — each row needs a business name, contact name, phone and email." };
  }

  let created = 0;
  for (const r of valid) {
    const assignedToId = await pickNextSalesRep();
    await db.lead.create({
      data: {
        partnerId: session.partnerId!,
        businessName: r.businessName.trim(),
        contactName: r.contactName.trim(),
        phone: r.phone.trim(),
        email: r.email.trim(),
        dealValue: r.dealValue && r.dealValue > 0 ? Math.round(r.dealValue) : 0,
        source: "BULK_UPLOAD",
        stage: "CAPTURED",
        assignedToId,
      },
    });
    created += 1;
  }

  await notifyInternalUsers(["ADMIN", "MARKETING_OPS"], {
    type: "BULK_LEADS_UPLOADED",
    title: `${created} client leads bulk-uploaded`,
    body: "New leads are available for masked campaign targeting.",
    href: "/admin/leads",
  });

  revalidatePath("/partner/leads");
  revalidatePath("/admin/leads");

  return { ok: true, created, skipped: rows.length - valid.length };
}

export type BulkPartnerRow = {
  firmName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  icaiNumber?: string;
};

/** Admin-side bulk partner (advisor) onboarding — creates Lead-stage Partner
 * records in one pass instead of one-by-one signup entry. */
export async function bulkImportPartnersAction(
  rows: BulkPartnerRow[],
): Promise<{ ok: boolean; created: number; skipped: number; error?: string }> {
  const actor = await getAuthedUser();
  if (!actor || !canManagePartners(actor.role as UserRole)) {
    return { ok: false, created: 0, skipped: 0, error: "Your role can't add partners." };
  }

  const valid = rows.filter(
    (r) => r.firmName?.trim() && r.contactName?.trim() && r.email?.trim() && r.phone?.trim() && r.city?.trim() && r.state?.trim(),
  );
  if (valid.length === 0) {
    return { ok: false, created: 0, skipped: rows.length, error: "No valid rows found — each row needs firm name, contact name, email, phone, city and state." };
  }

  const existingEmails = new Set(
    (await db.partner.findMany({ where: { email: { in: valid.map((r) => r.email.trim().toLowerCase()) } }, select: { email: true } })).map(
      (p) => p.email,
    ),
  );

  let created = 0;
  for (const r of valid) {
    const email = r.email.trim().toLowerCase();
    if (existingEmails.has(email)) continue;

    let slug = slugify(r.firmName.trim());
    const slugTaken = await db.partner.findUnique({ where: { slug } });
    if (slugTaken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    await db.partner.create({
      data: {
        firmName: r.firmName.trim(),
        contactName: r.contactName.trim(),
        email,
        phone: r.phone.trim(),
        city: r.city.trim(),
        state: r.state.trim(),
        icaiNumber: r.icaiNumber?.trim() || null,
        slug,
        referralCode: randomReferralCode(r.firmName.trim()),
        stage: "LEAD",
      },
    });
    created += 1;
  }

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "BULK_IMPORT_PARTNERS",
    targetType: "Partner",
    targetId: "bulk",
    meta: `${created} partners imported`,
  });

  revalidatePath("/admin/partners");

  return { ok: true, created, skipped: rows.length - created };
}
