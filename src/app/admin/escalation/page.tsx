import { Card } from "@/components/ui/card";

const TIERS = [
  {
    level: "L1",
    role: "Partner Success Manager",
    owner: "Karan Mehra",
    contact: "ops@omnicard.in · +91 70427 04232",
    sla: "First response within 4 business hours",
    scope: "General questions, campaign/asset requests, minor account issues",
  },
  {
    level: "L2",
    role: "Partner Manager",
    owner: "Karan Mehra",
    contact: "ops@omnicard.in",
    sla: "Response within 24 hours",
    scope: "Onboarding/certification blockers, commission disputes, deal-registration conflicts",
  },
  {
    level: "L3",
    role: "Regional Head",
    owner: "TBD per region",
    contact: "escalations@omnicard.in",
    sla: "Response within 48 hours",
    scope: "Territory disputes, MDF budget overruns, repeated SLA breaches",
  },
  {
    level: "L4",
    role: "Leadership",
    owner: "Ananya Rao (Admin)",
    contact: "admin@omnicard.in",
    sla: "Response within 5 business days",
    scope: "Contract-level disputes, partner offboarding, legal/compliance escalations",
  },
];

export default function EscalationMatrixPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Escalation Matrix</h1>
      <p className="mt-1 text-muted">
        Every support ticket starts at L1. Use &quot;Escalate&quot; on a ticket to move it up a tier —
        each tier has a named owner and an SLA.
      </p>

      <div className="mt-6 grid gap-4">
        {TIERS.map((t) => (
          <Card key={t.level} className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                {t.level} &middot; {t.role}
              </p>
              <p className="mt-1 text-sm font-medium">{t.owner}</p>
              <p className="text-xs text-muted">{t.contact}</p>
              <p className="mt-2 max-w-xl text-xs text-muted">{t.scope}</p>
            </div>
            <div className="rounded-lg bg-brand-light px-3 py-2 text-xs font-medium text-brand-dark sm:text-right">
              {t.sla}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
