import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number) {
  if (amount >= 10000000) return `Rs ${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(2)} L`;
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Masks all but the last 2 digits of a phone number, e.g. "9876543210" -> "98XXXXXX10". */
export function maskPhone(phone: string) {
  if (phone.length <= 4) return phone;
  const head = phone.slice(0, 2);
  const tail = phone.slice(-2);
  return `${head}${"X".repeat(phone.length - 4)}${tail}`;
}

/** Masks an email's local part, e.g. "jane.doe@example.com" -> "j***@example.com". */
export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 1)}${"*".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

/** Calendar-quarter label, e.g. "2026-Q3" — shared by badge milestones and the leaderboard. */
export function quarterLabel(d: Date) {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

export function quarterStart(d: Date) {
  const quarterMonth = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), quarterMonth, 1);
}
