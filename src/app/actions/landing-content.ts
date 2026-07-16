"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthedUser } from "@/lib/auth";
import { canManageCampaigns, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import type { UserRole } from "@/lib/enums";
import { parseFromForm } from "@/lib/landing-content";

export async function updateLandingContentAction(formData: FormData) {
  const actor = await getAuthedUser();
  if (!actor || !canManageCampaigns(actor.role as UserRole)) {
    throw new ForbiddenError("edit the co-branded landing page");
  }

  const content = parseFromForm(formData);

  await db.landingPageContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", data: JSON.stringify(content) },
    update: { data: JSON.stringify(content) },
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "UPDATE_LANDING_CONTENT",
    targetType: "LandingPageContent",
    targetId: "singleton",
  });

  revalidatePath("/admin/landing-content");
  revalidatePath("/advisor/[slug]", "page");
}
