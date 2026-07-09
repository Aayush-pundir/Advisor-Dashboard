"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { YEAR1_RATE, TRAILING_RATE } from "@/lib/enums";

const AVG_DEAL_VALUE = 60000; // INR annual contract value assumption

export function EarningsCalculator() {
  const [clients, setClients] = useState(5);

  const { year1, trailing, total } = useMemo(() => {
    const revenue = clients * AVG_DEAL_VALUE;
    const year1 = revenue * YEAR1_RATE;
    const trailing = revenue * TRAILING_RATE;
    return { year1, trailing, total: year1 + trailing };
  }, [clients]);

  return (
    <Card className="p-6" id="calculator">
      <h3 className="text-lg font-semibold">Earnings calculator</h3>
      <p className="mt-1 text-sm text-muted">
        See what a done-for-you referral channel is worth to your practice.
      </p>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Clients referred this year</span>
          <span className="font-semibold">{clients}</span>
        </div>
        <input
          type="range"
          min={1}
          max={60}
          value={clients}
          onChange={(e) => setClients(Number(e.target.value))}
          className="mt-2 w-full accent-brand"
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-background p-3">
          <p className="text-xs text-muted">Year-1 fee (15%)</p>
          <p className="mt-1 font-semibold">{formatINR(year1)}</p>
        </div>
        <div className="rounded-lg bg-background p-3">
          <p className="text-xs text-muted">Trailing (5% p.a.)</p>
          <p className="mt-1 font-semibold">{formatINR(trailing)}</p>
        </div>
        <div className="rounded-lg bg-brand-light p-3">
          <p className="text-xs text-brand-dark">Total Year-1 earnings</p>
          <p className="mt-1 font-semibold text-brand-dark">
            {formatINR(total)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">
        Assumes ~Rs 60,000 average annual contract value per client. Actual
        payouts vary by client plan and are auto-credited to your OmniCard
        wallet on go-live.
      </p>
    </Card>
  );
}
