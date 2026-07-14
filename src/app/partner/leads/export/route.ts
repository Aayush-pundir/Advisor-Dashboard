import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const session = await getSession();
  if (!session?.partnerId) return new Response("Forbidden", { status: 403 });

  const leads = await db.lead.findMany({
    where: { partnerId: session.partnerId },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    leads.map((l) => ({
      businessName: l.businessName,
      contactName: l.contactName,
      phone: l.phone,
      email: l.email,
      source: l.source,
      stage: l.stage,
      dealValue: l.dealValue,
      createdAt: l.createdAt.toISOString(),
    })),
    [
      { key: "businessName", header: "Business" },
      { key: "contactName", header: "Contact" },
      { key: "phone", header: "Phone" },
      { key: "email", header: "Email" },
      { key: "source", header: "Source" },
      { key: "stage", header: "Stage" },
      { key: "dealValue", header: "Deal Value (INR)" },
      { key: "createdAt", header: "Captured At" },
    ],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="my-leads.csv"`,
    },
  });
}
