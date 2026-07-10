import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import Link from "next/link";

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const [partners, leads] = query
    ? await Promise.all([
        db.partner.findMany({
          where: {
            OR: [
              { firmName: { contains: query } },
              { contactName: { contains: query } },
              { email: { contains: query } },
            ],
          },
          take: 20,
        }),
        db.lead.findMany({
          where: {
            OR: [
              { businessName: { contains: query } },
              { contactName: { contains: query } },
              { email: { contains: query } },
            ],
          },
          include: { partner: { select: { firmName: true } } },
          take: 20,
        }),
      ])
    : [[], []];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <form className="mt-4 max-w-lg">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search partners or leads by name / email"
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
            autoFocus
          />
        </form>
      </div>

      {query && (
        <>
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Partners ({partners.length})
            </h2>
            <Card className="divide-y divide-border">
              {partners.map((p) => (
                <Link key={p.id} href={`/admin/partners/${p.id}`} className="block px-5 py-3 hover:bg-brand-light/40">
                  <p className="text-sm font-medium">{p.firmName}</p>
                  <p className="text-xs text-muted">
                    {p.contactName} &middot; {p.email} &middot; {p.stage}
                  </p>
                </Link>
              ))}
              {partners.length === 0 && <p className="p-5 text-center text-sm text-muted">No matches.</p>}
            </Card>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Leads ({leads.length})
            </h2>
            <Card className="divide-y divide-border">
              {leads.map((l) => (
                <Link key={l.id} href="/admin/leads" className="block px-5 py-3 hover:bg-brand-light/40">
                  <p className="text-sm font-medium">{l.businessName}</p>
                  <p className="text-xs text-muted">
                    {l.contactName} &middot; referred by {l.partner.firmName} &middot; {formatINR(l.dealValue)}
                  </p>
                </Link>
              ))}
              {leads.length === 0 && <p className="p-5 text-center text-sm text-muted">No matches.</p>}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
