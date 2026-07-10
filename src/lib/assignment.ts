import { db } from "@/lib/db";

const OPEN_STAGES = ["CAPTURED", "QUALIFIED", "CONTACTED", "DEMO", "PROPOSAL"];

/**
 * Workload-balanced round robin — new leads go to whichever active SALES
 * rep currently has the fewest open (unresolved) assigned leads, so volume
 * spreads evenly instead of piling onto whoever was assigned first.
 */
export async function pickNextSalesRep(): Promise<string | null> {
  const reps = await db.user.findMany({
    where: { role: "SALES", active: true },
    select: { id: true, assignedLeads: { where: { stage: { in: OPEN_STAGES } }, select: { id: true } } },
  });
  if (reps.length === 0) return null;

  reps.sort((a, b) => a.assignedLeads.length - b.assignedLeads.length);
  return reps[0].id;
}
