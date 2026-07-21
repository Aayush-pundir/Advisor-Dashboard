"use client";

import { useMemo, useState } from "react";
import { formatINR } from "@/lib/utils";
import {
  DEFAULT_ANNUAL_CHURN,
  ltvCommissionPerClient,
  acvFromExpenditure,
} from "@/lib/enums";

export function DashboardCalculator() {
  const [clients, setClients] = useState(10);
  const [expenditure, setExpenditure] = useState(25000000);

  const { year1Total, trailingTotal, lifetimeTotal } = useMemo(() => {
    const acv = acvFromExpenditure(expenditure);
    const perClient = ltvCommissionPerClient(acv, DEFAULT_ANNUAL_CHURN);
    return {
      year1Total: perClient.year1 * clients,
      trailingTotal: perClient.trailing * clients,
      lifetimeTotal: perClient.total * clients,
    };
  }, [clients, expenditure]);

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-muted">Clients you refer</span>
            <span className="text-sm font-semibold">{clients}</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={clients}
            onChange={(e) => setClients(Number(e.target.value))}
            className="mt-2 w-full accent-brand"
          />
          <div className="mt-1 flex justify-between text-[11px] text-muted">
            <span>1</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-muted">Client&apos;s avg. annual expenditure</span>
            <span className="text-sm font-semibold">{formatINR(expenditure)}</span>
          </div>
          <input
            type="range"
            min={5000000}
            max={250000000}
            step={2500000}
            value={expenditure}
            onChange={(e) => setExpenditure(Number(e.target.value))}
            className="mt-2 w-full accent-brand"
          />
          <div className="mt-1 flex justify-between text-[11px] text-muted">
            <span>Rs 50L</span>
            <span>Rs 25Cr</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-3 text-center">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Year-1 earnings (15%)</p>
          <p className="mt-1 text-lg font-semibold">{formatINR(year1Total)}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3 text-center">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Lifetime trailing (5%)</p>
          <p className="mt-1 text-lg font-semibold">{formatINR(trailingTotal)}</p>
        </div>
        <div className="rounded-lg border border-brand/25 bg-brand-light p-3 text-center">
          <p className="text-[11px] font-medium uppercase tracking-wide text-brand-dark">Total lifetime value</p>
          <p className="mt-1 text-lg font-semibold text-brand-dark">{formatINR(lifetimeTotal)}</p>
        </div>
      </div>
    </div>
  );
}
