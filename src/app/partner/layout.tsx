import { getAuthedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PartnerSidebar } from "@/components/partner/sidebar";
import { TopBar } from "@/components/shared/top-bar";
import { SupportWidget } from "@/components/shared/support-widget";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthedUser();
  if (!user || !user.partnerId) redirect("/login");
  if (user.mustChangePassword) redirect("/change-password");

  const [partner, unreadCount] = await Promise.all([
    db.partner.findUnique({ where: { id: user.partnerId } }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  if (!partner) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <PartnerSidebar firmName={partner.firmName} unreadCount={unreadCount} />
      <div className="flex flex-1 flex-col">
        <TopBar unreadCount={unreadCount} />
        <main className="flex-1 overflow-y-auto bg-background p-8">
          {children}
        </main>
      </div>
      <SupportWidget />
    </div>
  );
}
