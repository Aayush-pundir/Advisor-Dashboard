import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatINR, formatDate } from "@/lib/utils";
import { COMMISSION_TYPES, COMMISSION_STATUSES, type CommissionStatus, type UserRole } from "@/lib/enums";
import { getAuthedUser } from "@/lib/auth";
import { canViewCommissions } from "@/lib/permissions";
import { CsvExportButton } from "@/components/admin/csv-export-button";

const statusVariant: Record<CommissionStatus, "neutral" | "warning" | "success"> = {
  PENDING: "neutral",
  CREDITED: "warning",
  PAID: "success",
};

export default async function AdminCommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ partnerId?: string; status?: string; type?: string; billingCycle?: string; from?: string; to?: string }>;
}) {
  const actor = await getAuthedUser();
  if (!actor || !canViewCommissions(actor.role as UserRole)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold">You don&apos;t have access to the commission ledger</p>
        <p className="mt-1 text-muted">This view is limited to Admin and OmniCard Team roles.</p>
      </div>
    );
  }

  const { partnerId, status, type, billingCycle, from, to } = await searchParams;

  const where = {
    ...(partnerId ? { partnerId } : {}),
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(billingCycle ? { lead: { billingCycle } } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
          },
        }
      : {}),
  };

  const [commissions, partners] = await Promise.all([
    db.commission.findMany({
      where,
      include: { partner: { select: { id: true, firmName: true } }, lead: { select: { id: true, businessName: true, dealValue: true, billingCycle: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.partner.findMany({ select: { id: true, firmName: true }, orderBy: { firmName: "asc" } }),
  ]);

  const qs = new URLSearchParams();
  if (partnerId) qs.set("partnerId", partnerId);
  if (status) qs.set("status", status);
  if (type) qs.set("type", type);
  if (billingCycle) qs.set("billingCycle", billingCycle);
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const exportHref = `/admin/commissions/export${qs.toString() ? `?${qs.toString()}` : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advisory Fees Ledger</h1>
          <p className="mt-1 text-muted">
            15% Year-1 + 5% trailing advisory fee, auto-credited to CA wallets on client go-live.
          </p>
        </div>
        <CsvExportButton href={exportHref} />
      </div>

      <form method="GET" className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-muted">Partner</label>
          <select name="partnerId" defaultValue={partnerId ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">All partners</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firmName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">Status</label>
          <select name="status" defaultValue={status ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">All statuses</option>
            {COMMISSION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">Type</label>
          <select name="type" defaultValue={type ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">All types</option>
            {COMMISSION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">Commercials</label>
          <select name="billingCycle" defaultValue={billingCycle ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">Annual & monthly</option>
            <option value="ANNUAL">Annual</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">From</label>
          <input type="date" name="from" defaultValue={from ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">To</label>
          <input type="date" name="to" defaultValue={to ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
        </div>
        <Button type="submit" size="sm">
          Apply filters
        </Button>
        {(partnerId || status || type || billingCycle || from || to) && (
          <Link href="/admin/commissions" className="text-sm text-muted hover:text-brand hover:underline">
            Clear
          </Link>
        )}
      </form>

      <p className="text-xs text-muted">{commissions.length} record(s)</p>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Client ID</th>
              <th className="p-3 font-medium">Client name</th>
              <th className="p-3 font-medium">Partner ID</th>
              <th className="p-3 font-medium">Partner name</th>
              <th className="p-3 font-medium">Revenue from client</th>
              <th className="p-3 font-medium">Commercials</th>
              <th className="p-3 font-medium">Period</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Advisory fees</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Paid date</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-3 text-xs text-muted">{c.lead?.id.slice(0, 8) ?? "—"}</td>
                <td className="p-3">{c.lead?.businessName ?? "—"}</td>
                <td className="p-3 text-xs text-muted">{c.partner.id.slice(0, 8)}</td>
                <td className="p-3">{c.partner.firmName}</td>
                <td className="p-3">{c.lead ? formatINR(c.lead.dealValue) : "—"}</td>
                <td className="p-3 text-muted">{c.lead?.billingCycle === "MONTHLY" ? "Monthly" : "Annual"}</td>
                <td className="p-3 text-muted">
                  {c.createdAt.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </td>
                <td className="p-3 text-muted">{c.type.replace("_", " ")}</td>
                <td className="p-3 font-medium">{formatINR(c.amount)}</td>
                <td className="p-3">
                  <Badge variant={statusVariant[c.status as CommissionStatus]}>{c.status}</Badge>
                </td>
                <td className="p-3 text-muted">{c.paidAt ? formatDate(c.paidAt) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {commissions.length === 0 && (
          <p className="p-6 text-center text-muted">No commission records match these filters.</p>
        )}
      </Card>
    </div>
  );
}
