/**
 * Lightweight fuzzy-match duplicate detection — no Postgres trigram index
 * available on SQLite, so this runs in application code at read time
 * instead of being a stored/indexed check. Non-blocking: callers surface a
 * warning and offer merge, they never prevent the record from being saved.
 */

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/** 0 (no match) to 1 (identical), based on normalized edit distance. */
function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  const dist = levenshtein(na, nb);
  return 1 - dist / Math.max(na.length, nb.length);
}

export type PartnerDupeCandidate = { id: string; firmName: string; email: string; phone: string };

/** Same email/phone is treated as an exact duplicate signal; otherwise a
 * high firm-name similarity (typo, "Pvt Ltd" vs "Private Limited", etc). */
export function findPossibleDuplicates(
  target: PartnerDupeCandidate,
  candidates: PartnerDupeCandidate[],
  threshold = 0.8,
): PartnerDupeCandidate[] {
  return candidates.filter((c) => {
    if (c.id === target.id) return false;
    if (normalize(c.email) === normalize(target.email)) return true;
    if (normalize(c.phone) === normalize(target.phone)) return true;
    return similarity(c.firmName, target.firmName) >= threshold;
  });
}

/** Builds a partnerId -> duplicate list map for an entire partner set, so a
 * list view can flag every row in one pass instead of one query per row. */
export function buildDuplicateMap(
  partners: PartnerDupeCandidate[],
  threshold = 0.8,
): Map<string, PartnerDupeCandidate[]> {
  const map = new Map<string, PartnerDupeCandidate[]>();
  for (const p of partners) {
    const dupes = findPossibleDuplicates(p, partners, threshold);
    if (dupes.length > 0) map.set(p.id, dupes);
  }
  return map;
}

export type LeadDupeCandidate = { id: string; businessName: string; email: string; phone: string };

/** Same check as partner duplicates, applied to client leads — catches the
 * same client being submitted twice under a slightly different spelling
 * (detection only; leads aren't merged, since combining their commissions
 * and stage history safely needs more care than the partner-merge case). */
export function findPossibleDuplicateLeads(
  target: LeadDupeCandidate,
  candidates: LeadDupeCandidate[],
  threshold = 0.8,
): LeadDupeCandidate[] {
  return candidates.filter((c) => {
    if (c.id === target.id) return false;
    if (normalize(c.email) === normalize(target.email)) return true;
    if (normalize(c.phone) === normalize(target.phone)) return true;
    return similarity(c.businessName, target.businessName) >= threshold;
  });
}

export function buildLeadDuplicateMap(
  leads: LeadDupeCandidate[],
  threshold = 0.8,
): Map<string, LeadDupeCandidate[]> {
  const map = new Map<string, LeadDupeCandidate[]>();
  for (const l of leads) {
    const dupes = findPossibleDuplicateLeads(l, leads, threshold);
    if (dupes.length > 0) map.set(l.id, dupes);
  }
  return map;
}
