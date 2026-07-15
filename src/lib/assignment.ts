import { db } from "@/lib/db";

const OPEN_STAGES = ["CAPTURED", "QUALIFIED", "CONTACTED", "DEMO", "PROPOSAL"];

/**
 * Workload-balanced round robin — new leads go to whichever active,
 * admin-flagged sales rep currently has the fewest open (unresolved)
 * assigned leads, so volume spreads evenly instead of piling onto whoever
 * was assigned first. Admin-set priority breaks ties (lower number wins).
 */
export async function pickNextSalesRep(): Promise<string | null> {
  const reps = await db.user.findMany({
    where: { role: "OMNICARD_TEAM", active: true, isSalesRep: true },
    select: {
      id: true,
      assignmentPriority: true,
      assignedLeads: { where: { stage: { in: OPEN_STAGES } }, select: { id: true } },
    },
  });
  if (reps.length === 0) return null;

  reps.sort((a, b) => a.assignedLeads.length - b.assignedLeads.length || a.assignmentPriority - b.assignmentPriority);
  return reps[0].id;
}
