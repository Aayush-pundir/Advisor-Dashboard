"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { notifyPartnerUsers } from "@/lib/notify";
import { CERT_MODULES, CERT_LEVEL_LABELS, computeCertLevel, type CertModuleKey } from "@/lib/enums";

/** Self-serve certification step-up — completing every module for a level
 * (DEMO -> PRODUCT -> SALES) bumps Partner.certLevel automatically. */
export async function completeCertModuleAction(moduleKey: CertModuleKey) {
  const session = await getSession();
  if (!session?.partnerId) return;

  const isValid = CERT_MODULES.some((m) => m.key === moduleKey);
  if (!isValid) return;

  await db.certificationProgress.upsert({
    where: { partnerId_moduleKey: { partnerId: session.partnerId, moduleKey } },
    create: { partnerId: session.partnerId, moduleKey },
    update: {},
  });

  const completed = await db.certificationProgress.findMany({
    where: { partnerId: session.partnerId },
    select: { moduleKey: true },
  });
  const newLevel = computeCertLevel(new Set(completed.map((c) => c.moduleKey)));

  const partner = await db.partner.findUniqueOrThrow({ where: { id: session.partnerId } });
  if (partner.certLevel !== newLevel) {
    await db.partner.update({
      where: { id: session.partnerId },
      data: { certLevel: newLevel, tierUpdatedAt: new Date() },
    });
    if (newLevel !== "NONE") {
      await notifyPartnerUsers(session.partnerId, {
        type: "CERT_LEVEL_UP",
        title: `You're now ${CERT_LEVEL_LABELS[newLevel]}!`,
        href: "/partner/achievements?tab=certification",
      });
    }
  }

  revalidatePath("/partner/achievements");
  revalidatePath("/admin/partners");
}
