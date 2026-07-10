"use client";

import { useMemo, useState } from "react";
import { formatINR } from "@/lib/utils";
import {
  DEFAULT_ANNUAL_CHURN,
  ltvCommissionPerClient,
  expectedTrailingYears,
} from "@/lib/enums";

export function EarningsCalculator() {
  const [clients, setClients] = useState(10);
  const [acv, setAcv] = useState(500000);

  const { year1Total, trailingTotal, lifetimeTotal, tenureYears } = useMemo(() => {
    const perClient = ltvCommissionPerClient(acv, DEFAULT_ANNUAL_CHURN);
    return {
      year1Total: perClient.year1 * clients,
      trailingTotal: perClient.trailing * clients,
      lifetimeTotal: perClient.total * clients,
      tenureYears: 1 + expectedTrailingYears(DEFAULT_ANNUAL_CHURN),
    };
  }, [clients, acv]);

  return (
    <div
      id="calculator"
      className="rounded-2xl border border-[#1B1714]/10 bg-[#FAF9F7] p-6 sm:p-9 shadow-[0_24px_60px_rgba(23,19,16,0.08)]"
    >
      <div className="text-center">
        <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#D6362B]">
          Model your earnings
        </div>
        <h3
          className="mt-3 text-[26px] font-semibold leading-tight text-[#171310] sm:text-[32px]"
          style={{ fontFamily: "var(--font-plex-serif)" }}
        >
          What this partnership is worth to your firm
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-[#1B1714]/65">
          Based on lifetime client value, assuming a 10% annual churn rate —
          15% in Year 1, then 5% every year the client stays active.
        </p>
      </div>

      <div className="mt-9 grid gap-8 sm:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-[#1B1714]/70">
              Clients you refer
            </span>
            <span className="font-[family-name:var(--font-plex-serif)] text-lg font-semibold text-[#171310]">
              {clients}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={clients}
            onChange={(e) => setClients(Number(e.target.value))}
            className="mt-3 w-full accent-[#D6362B]"
          />
          <div className="mt-1 flex justify-between text-[11px] text-[#1B1714]/45">
            <span>1</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-[#1B1714]/70">
              Avg. contract value / client / yr
            </span>
            <span className="font-[family-name:var(--font-plex-serif)] text-lg font-semibold text-[#171310]">
              {formatINR(acv)}
            </span>
          </div>
          <input
            type="range"
            min={100000}
            max={5000000}
            step={50000}
            value={acv}
            onChange={(e) => setAcv(Number(e.target.value))}
            className="mt-3 w-full accent-[#D6362B]"
          />
          <div className="mt-1 flex justify-between text-[11px] text-[#1B1714]/45">
            <span>Rs 1L</span>
            <span>Rs 50L</span>
          </div>
        </div>
      </div>

      <div className="mt-9 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#1B1714]/10 bg-white p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1B1714]/50">
            Year-1 earnings (15%)
          </p>
          <p
            className="mt-2 text-xl font-semibold text-[#171310]"
            style={{ fontFamily: "var(--font-plex-serif)" }}
          >
            {formatINR(year1Total)}
          </p>
        </div>
        <div className="rounded-xl border border-[#1B1714]/10 bg-white p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1B1714]/50">
            Lifetime trailing (5%)
          </p>
          <p
            className="mt-2 text-xl font-semibold text-[#171310]"
            style={{ fontFamily: "var(--font-plex-serif)" }}
          >
            {formatINR(trailingTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-[#D6362B]/25 bg-[#D6362B]/[0.06] p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#D6362B]">
            Total lifetime value
          </p>
          <p
            className="mt-2 text-xl font-semibold text-[#D6362B]"
            style={{ fontFamily: "var(--font-plex-serif)" }}
          >
            {formatINR(lifetimeTotal)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-[12px] leading-relaxed text-[#1B1714]/45">
        At 10% annual churn, a client stays active for ~{tenureYears.toFixed(0)}{" "}
        years on average — Year-1 fee is auto-credited on go-live, trailing
        fees credit every year the client renews.
      </p>
    </div>
  );
}
