import { getAuthedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { markAllNotificationsReadAction } from "@/app/actions/settings";
import { notificationIcon } from "@/lib/notification-icons";
import Link from "next/link";

export default async function PartnerNotificationsPage() {
  const user = await getAuthedUser();
  const notifications = await db.notification.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="mt-1 text-muted">Milestones, leads, advisory fees, and campaigns as they happen.</p>
        </div>
        <form action={markAllNotificationsReadAction}>
          <Button variant="outline" size="sm" type="submit">
            Mark all as read
          </Button>
        </form>
      </div>

      <Card className="mt-6 divide-y divide-border">
        {notifications.map((n) => (
          <Link
            key={n.id}
            href={n.href ?? "/partner"}
            className={`flex items-start gap-3 p-4 hover:bg-brand-light/40 ${!n.readAt ? "bg-brand-light/20" : ""}`}
          >
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.readAt ? "bg-brand" : "bg-transparent"}`} />
            <span className="mt-0.5 shrink-0 text-base leading-none">{notificationIcon(n.type)}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{n.title}</p>
              {n.body && <p className="mt-0.5 text-xs text-muted">{n.body}</p>}
              <p className="mt-1 text-xs text-muted">{formatDate(n.createdAt)}</p>
            </div>
          </Link>
        ))}
        {notifications.length === 0 && (
          <p className="p-6 text-center text-muted">No notifications yet.</p>
        )}
      </Card>
    </div>
  );
}
