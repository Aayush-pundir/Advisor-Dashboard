import { Card } from "@/components/ui/card";
import { CsvExportButton } from "@/components/admin/csv-export-button";

const EXPORTS = [
  {
    label: "Commission Ledger",
    href: "/admin/commissions/export",
    description: "Every commission entry — type, amount, status, credited date.",
  },
  {
    label: "KPI Snapshots",
    href: "/admin/kpi-export",
    description: "Weekly program KPI history (Step 9 cadence).",
  },
  {
    label: "Leads",
    href: "/admin/leads/export",
    description: "Every client lead across every partner — contact info masked.",
  },
  {
    label: "Partners",
    href: "/admin/partners/export",
    description: "Full partner roster with ICP score, stage, tier, and certification level.",
  },
];

export default function AdminExportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Export Center</h1>
      <p className="mt-1 text-muted">
        Every CSV export in one place instead of hunting for the button on
        each page.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {EXPORTS.map((e) => (
          <Card key={e.href} className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-medium">{e.label}</p>
              <p className="mt-1 text-xs text-muted">{e.description}</p>
            </div>
            <CsvExportButton href={e.href} label="Export" />
          </Card>
        ))}
      </div>
    </div>
  );
}
