import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { MarketingContactsUploader } from "@/components/partner/marketing-contacts-uploader";

export default async function PartnerMarketingContactsPage() {
  const session = await getSession();
  const contacts = await db.marketingContact.findMany({
    where: { partnerId: session!.partnerId! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Client List for Co-Branded Marketing</h1>
      <p className="mt-1 text-muted">
        Upload your full client roster so OmniCard&apos;s marketing team can
        run co-branded campaigns to them. This is separate from your{" "}
        <span className="font-medium text-foreground">Leads &amp; Pipeline</span>{" "}
        — contacts here aren&apos;t a sales pipeline, and their phone/email
        stay masked from our team unless explicitly revealed.
      </p>

      <MarketingContactsUploader />

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Contact</th>
              <th className="p-3 font-medium">Phone</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">City</th>
              <th className="p-3 font-medium">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{c.contactName}</td>
                <td className="p-3 text-muted">{c.phone}</td>
                <td className="p-3 text-muted">{c.email ?? "—"}</td>
                <td className="p-3 text-muted">{c.city ?? "—"}</td>
                <td className="p-3 text-muted">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && (
          <p className="p-6 text-center text-muted">No contacts uploaded yet.</p>
        )}
      </Card>
    </div>
  );
}
