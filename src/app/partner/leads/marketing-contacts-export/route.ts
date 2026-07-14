import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const session = await getSession();
  if (!session?.partnerId) return new Response("Forbidden", { status: 403 });

  const contacts = await db.marketingContact.findMany({
    where: { partnerId: session.partnerId },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    contacts.map((c) => ({
      contactName: c.contactName,
      phone: c.phone,
      email: c.email ?? "",
      city: c.city ?? "",
      createdAt: c.createdAt.toISOString(),
    })),
    [
      { key: "contactName", header: "Contact" },
      { key: "phone", header: "Phone" },
      { key: "email", header: "Email" },
      { key: "city", header: "City" },
      { key: "createdAt", header: "Uploaded At" },
    ],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="marketing-contacts.csv"`,
    },
  });
}
