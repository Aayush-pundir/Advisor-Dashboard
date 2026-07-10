"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession, getAuthedUser } from "@/lib/auth";
import { canRevealPii } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { notifyInternalUsers } from "@/lib/notify";
import type { UserRole } from "@/lib/enums";

export type MarketingContactRow = {
  contactName: string;
  phone: string;
  email?: string;
  city?: string;
};

/** Partner: bulk-upload their full client roster purely for co-branded
 * campaign targeting — deliberately separate from the Lead pipeline (no
 * stage, no deal value, no commission). Contact info stays masked to
 * marketing/admin until explicitly revealed, same pattern as lead PII. */
export async function bulkImportMarketingContactsAction(
  rows: MarketingContactRow[],
): Promise<{ ok: boolean; created: number; skipped: number; error?: string }> {
  const session = await getSession();
  if (!session?.partnerId) {
    return { ok: false, created: 0, skipped: 0, error: "You must be signed in as an advisor." };
  }

  const valid = rows.filter((r) => r.contactName?.trim() && r.phone?.trim());
  if (valid.length === 0) {
    return { ok: false, created: 0, skipped: rows.length, error: "No valid rows found — each row needs at least a contact name and phone." };
  }

  const result = await db.marketingContact.createMany({
    data: valid.map((r) => ({
      partnerId: session.partnerId!,
      contactName: r.contactName.trim(),
      phone: r.phone.trim(),
      email: r.email?.trim() || null,
      city: r.city?.trim() || null,
    })),
  });

  await notifyInternalUsers(["ADMIN", "MARKETING_OPS"], {
    type: "MARKETING_CONTACTS_UPLOADED",
    title: `${result.count} client contacts uploaded for campaigns`,
    href: "/admin/marketing-contacts",
  });

  revalidatePath("/partner/marketing-contacts");
  revalidatePath("/admin/marketing-contacts");

  return { ok: true, created: result.count, skipped: rows.length - valid.length };
}

/** Admin/marketing: reveal one contact's raw phone/email — audited, same
 * reveal-on-demand pattern as lead PII. */
export async function revealMarketingContactAction(
  contactId: string,
): Promise<{ ok: boolean; phone?: string; email?: string; error?: string }> {
  const actor = await getAuthedUser();
  if (!actor || !canRevealPii(actor.role as UserRole)) {
    return { ok: false, error: "Your role can't reveal client contact details." };
  }

  const contact = await db.marketingContact.findUnique({
    where: { id: contactId },
    select: { phone: true, email: true, contactName: true },
  });
  if (!contact) return { ok: false, error: "Contact not found." };

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "REVEAL_MARKETING_CONTACT_PII",
    targetType: "MarketingContact",
    targetId: contactId,
    meta: contact.contactName,
  });

  return { ok: true, phone: contact.phone, email: contact.email ?? undefined };
}
