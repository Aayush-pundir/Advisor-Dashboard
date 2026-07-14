import { getAuthedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { PartnerSidebar } from "@/components/partner/sidebar";
import { TopBar } from "@/components/shared/top-bar";
import { SupportWidget } from "@/components/shared/support-widget";
import { MobileNavProvider } from "@/components/shared/mobile-nav-context";

const ONBOARDING_ALLOWED_PATHS = ["/partner", "/partner/settings", "/partner/notifications", "/partner/documents"];

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

  const isCertified = partner.stage === "CERTIFIED" || partner.stage === "ACTIVE";
  const pathname = (await headers()).get("x-pathname") ?? "/partner";
  if (!isCertified && !ONBOARDING_ALLOWED_PATHS.includes(pathname)) {
    redirect("/partner");
  }

  return (
    <MobileNavProvider>
      <div className="flex min-h-screen">
        <PartnerSidebar firmName={partner.firmName} isCertified={isCertified} />
        <div className="flex flex-1 flex-col">
          <TopBar unreadCount={unreadCount} />
          <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-8">
            {children}
          </main>
        </div>
        <SupportWidget />
      </div>
    </MobileNavProvider>
  );
}
