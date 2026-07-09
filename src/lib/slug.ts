export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function randomReferralCode(firmName: string) {
  const prefix = slugify(firmName).slice(0, 6).toUpperCase().replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix || "CA"}-${suffix}`;
}
