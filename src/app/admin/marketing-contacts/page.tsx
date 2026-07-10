import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { formatDate, maskPhone, maskEmail } from "@/lib/utils";
import { RevealMarketingContact } from "@/components/admin/reveal-marketing-contact";

export default async function AdminMarketingContactsPage() {
  const contacts = await db.marketingContact.findMany({
    include: { partner: { select: { firmName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Marketing Contact Lists</h1>
      <p className="mt-1 text-muted">
        Client rosters uploaded by partners purely for co-branded campaign
        targeting — not a sales pipeline. Contact info is masked by default;
        reveal is logged.
      </p>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Contact</th>
              <th className="p-3 font-medium">Details</th>
              <th className="p-3 font-medium">Uploaded by</th>
              <th className="p-3 font-medium">City</th>
              <th className="p-3 font-medium">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{c.contactName}</td>
                <td className="p-3">
                  <RevealMarketingContact
                    contactId={c.id}
                    maskedPhone={maskPhone(c.phone)}
                    maskedEmail={c.email ? maskEmail(c.email) : "—"}
                  />
                </td>
                <td className="p-3 text-muted">{c.partner.firmName}</td>
                <td className="p-3 text-muted">{c.city ?? "—"}</td>
                <td className="p-3 text-muted">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && (
          <p className="p-6 text-center text-muted">No marketing contacts uploaded yet.</p>
        )}
      </Card>
    </div>
  );
}
