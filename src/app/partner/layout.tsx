import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PartnerSidebar } from "@/components/partner/sidebar";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !session.partnerId) redirect("/login");

  const partner = await db.partner.findUnique({
    where: { id: session.partnerId },
  });
  if (!partner) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <PartnerSidebar firmName={partner.firmName} />
      <main className="flex-1 overflow-y-auto bg-background p-8">
        {children}
      </main>
    </div>
  );
}
