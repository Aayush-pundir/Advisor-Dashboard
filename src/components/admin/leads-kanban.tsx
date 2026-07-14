"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { LEAD_STAGES, LEAD_STAGE_LABELS, type LeadStage } from "@/lib/enums";
import { advanceLeadStageAction } from "@/app/actions/lead";

type KanbanLead = {
  id: string;
  businessName: string;
  contactName: string;
  dealValue: number;
  stage: string;
  partnerFirmName: string;
};

export function LeadsKanban({ leads }: { leads: KanbanLead[] }) {
  const [isPending, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [localLeads, setLocalLeads] = useState(leads);
  const [error, setError] = useState<string | null>(null);

  function moveLead(leadId: string, stage: LeadStage) {
    const lead = localLeads.find((l) => l.id === leadId);
    if (!lead || lead.stage === stage) return;

    let lossReason: string | undefined;
    if (stage === "CLOSED_LOST") {
      lossReason = window.prompt("Reason for closing this lead as lost:") ?? undefined;
      if (!lossReason?.trim()) return;
    }

    const previousStage = lead.stage;
    setLocalLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage } : l)));
    setError(null);

    startTransition(async () => {
      const result = await advanceLeadStageAction(leadId, stage, lossReason);
      if (!result.ok) {
        setLocalLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: previousStage } : l)));
        setError(result.error ?? "Could not update this lead's stage.");
      }
    });
  }

  return (
    <div className="mt-6">
      {error && (
        <p className="mb-3 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>
      )}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STAGES.map((stage) => {
          const columnLeads = localLeads.filter((l) => l.stage === stage);
          const total = columnLeads.reduce((s, l) => s + l.dealValue, 0);
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) moveLead(dragId, stage);
                setDragId(null);
              }}
              className="flex w-64 shrink-0 flex-col rounded-lg border border-border bg-background"
            >
              <div className="border-b border-border p-3">
                <p className="text-sm font-semibold">{LEAD_STAGE_LABELS[stage]}</p>
                <p className="text-xs text-muted">
                  {columnLeads.length} &middot; {formatINR(total)}
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2">
                {columnLeads.map((l) => (
                  <Card
                    key={l.id}
                    draggable
                    onDragStart={() => setDragId(l.id)}
                    onDragEnd={() => setDragId(null)}
                    className={`cursor-grab p-3 text-sm active:cursor-grabbing ${isPending && dragId === l.id ? "opacity-60" : ""}`}
                  >
                    <Link href={`/admin/leads/${l.id}`} className="font-medium text-brand-dark hover:underline">
                      {l.businessName}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">{l.contactName}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-medium">{formatINR(l.dealValue)}</span>
                      <Badge variant="neutral" className="text-[10px]">
                        {l.partnerFirmName}
                      </Badge>
                    </div>
                  </Card>
                ))}
                {columnLeads.length === 0 && (
                  <p className="p-3 text-center text-xs text-muted">No leads</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
