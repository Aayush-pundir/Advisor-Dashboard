import { getAuthedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { TopBar } from "@/components/shared/top-bar";
import { SupportWidget } from "@/components/shared/support-widget";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthedUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/change-password");

  const [unreadCount, pendingAccept, pendingCountersign, awaitingDemo, pendingDeals, pendingMdf, openTickets, highRiskClients] =
    await Promise.all([
      db.notification.count({ where: { userId: user.id, readAt: null } }),
      db.partner.count({ where: { stage: "LEAD" } }),
      db.partner.count({ where: { stage: "MEETING_SCHEDULED" } }),
      db.partner.count({ where: { stage: "ONBOARDING", demoScheduledAt: null } }),
      db.dealRegistration.count({ where: { status: "PENDING" } }),
      db.mdfRequest.count({ where: { status: "PENDING" } }),
      db.supportTicket.count({ where: { status: { in: ["OPEN", "ESCALATED"] } } }),
      db.lead.count({ where: { riskLevel: "HIGH", stage: "CLOSED_WON" } }),
    ]);
  const queueCount =
    pendingAccept + pendingCountersign + awaitingDemo + pendingDeals + pendingMdf + openTickets + highRiskClients;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar name={user.name} role={user.role} queueCount={queueCount} />
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
