import { db } from "@/lib/db";

/** Creates an in-app notification for every user attached to a partner (firm) —
 * covers multi-user firms where more than one login shares a Partner record. */
export async function notifyPartnerUsers(
  partnerId: string,
  notification: { type: string; title: string; body?: string; href?: string },
) {
  const users = await db.user.findMany({ where: { partnerId }, select: { id: true } });
  if (users.length === 0) return;
  await db.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      href: notification.href,
    })),
  });
}

/** Notifies internal ops users (by role) — used for support tickets and
 * other events that need admin/partner-manager attention. */
export async function notifyInternalUsers(
  roles: string[],
  notification: { type: string; title: string; body?: string; href?: string },
) {
  const users = await db.user.findMany({
    where: { role: { in: roles }, partnerId: null, active: true },
    select: { id: true },
  });
  if (users.length === 0) return;
  await db.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      href: notification.href,
    })),
  });
}
