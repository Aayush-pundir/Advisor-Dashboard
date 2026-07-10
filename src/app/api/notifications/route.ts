import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const user = await getAuthedUser();
  if (!user) return Response.json({ notifications: [], unreadCount: 0 }, { status: 401 });

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  return Response.json({ notifications, unreadCount });
}

export async function POST(req: NextRequest) {
  const user = await getAuthedUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, all } = body as { id?: string; all?: boolean };

  if (all) {
    await db.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
  } else if (id) {
    await db.notification.updateMany({
      where: { id, userId: user.id },
      data: { readAt: new Date() },
    });
  }

  return Response.json({ ok: true });
}
