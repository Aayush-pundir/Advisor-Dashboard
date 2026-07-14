"use server";

import { db } from "@/lib/db";
import { randomBytes, createHmac } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

/** Partners can sync leads into their own CRM via a simple API key + outbound
 * webhook, fired whenever one of their leads closes won. This is deliberately
 * simple (no OAuth, no rate limiting) — a self-serve escape hatch, not a
 * public platform API. */
export async function generateApiKeyAction(): Promise<{ ok: boolean; apiKey?: string }> {
  const session = await getSession();
  if (!session?.partnerId) return { ok: false };

  const apiKey = `omc_${randomBytes(24).toString("hex")}`;
  await db.partner.update({ where: { id: session.partnerId }, data: { apiKey } });

  revalidatePath("/partner/settings");
  return { ok: true, apiKey };
}

export async function revokeApiKeyAction() {
  const session = await getSession();
  if (!session?.partnerId) return;

  await db.partner.update({ where: { id: session.partnerId }, data: { apiKey: null } });
  revalidatePath("/partner/settings");
}

export async function setWebhookUrlAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.partnerId) return { ok: false, error: "Not signed in." };

  const webhookUrl = String(formData.get("webhookUrl") ?? "").trim();
  if (webhookUrl && !/^https?:\/\//.test(webhookUrl)) {
    return { ok: false, error: "Webhook URL must start with http:// or https://" };
  }

  const partner = await db.partner.findUniqueOrThrow({ where: { id: session.partnerId } });
  const webhookSecret = partner.webhookSecret ?? randomBytes(16).toString("hex");

  await db.partner.update({
    where: { id: session.partnerId },
    data: { webhookUrl: webhookUrl || null, webhookSecret: webhookUrl ? webhookSecret : partner.webhookSecret },
  });

  revalidatePath("/partner/settings");
  return { ok: true };
}

/** Fires a signed webhook when a partner's lead closes won — best-effort,
 * never blocks or throws into the caller's transaction. */
export async function fireLeadClosedWebhook(partnerId: string, lead: { id: string; businessName: string; dealValue: number }) {
  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    select: { webhookUrl: true, webhookSecret: true },
  });
  if (!partner?.webhookUrl || !partner.webhookSecret) return;

  const payload = JSON.stringify({
    event: "lead.closed_won",
    leadId: lead.id,
    businessName: lead.businessName,
    dealValue: lead.dealValue,
    timestamp: new Date().toISOString(),
  });
  const signature = createHmac("sha256", partner.webhookSecret).update(payload).digest("hex");

  try {
    await fetch(partner.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-OmniCard-Signature": signature },
      body: payload,
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // best-effort — the partner's endpoint being down shouldn't block a lead close
  }
}
