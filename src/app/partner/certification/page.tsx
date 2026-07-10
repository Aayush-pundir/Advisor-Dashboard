import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CERT_LEVELS, CERT_LEVEL_LABELS, CERT_MODULES, type CertLevel } from "@/lib/enums";
import { CertModuleButton } from "@/components/partner/cert-module-button";
import { cn } from "@/lib/utils";

export default async function PartnerCertificationPage() {
  const session = await getSession();
  const [partner, progress] = await Promise.all([
    db.partner.findUniqueOrThrow({ where: { id: session!.partnerId! } }),
    db.certificationProgress.findMany({ where: { partnerId: session!.partnerId! } }),
  ]);
  const completed = new Set(progress.map((p) => p.moduleKey));
  const certLevel = partner.certLevel as CertLevel;

  return (
    <div>
      <h1 className="text-2xl font-bold">Certification Track</h1>
      <p className="mt-1 text-muted">
        Complete every module in a level to step up — from Demo Certified to
        Product Certified to fully Sales Certified.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm text-muted">Current level:</span>
        <Badge variant={certLevel === "NONE" ? "neutral" : "success"}>
          {CERT_LEVEL_LABELS[certLevel]}
        </Badge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {CERT_LEVELS.filter((l) => l !== "NONE").map((level) => {
          const modules = CERT_MODULES.filter((m) => m.level === level);
          const doneCount = modules.filter((m) => completed.has(m.key)).length;
          const isCurrentOrPast = CERT_LEVELS.indexOf(certLevel) >= CERT_LEVELS.indexOf(level);
          return (
            <Card key={level} className={cn("p-5", isCurrentOrPast && "border-brand")}>
              <p className="text-xs font-semibold uppercase text-muted">{CERT_LEVEL_LABELS[level]}</p>
              <p className="mt-1 text-lg font-semibold">
                {doneCount}/{modules.length} modules
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {modules.map((m) => (
                  <div key={m.key} className="flex items-center justify-between gap-2">
                    <span className="text-sm">{m.label}</span>
                    <CertModuleButton moduleKey={m.key} done={completed.has(m.key)} />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
