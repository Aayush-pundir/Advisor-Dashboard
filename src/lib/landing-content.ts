import { db } from "@/lib/db";

export type StatPair = { big: string; small: string };
export type IconTitle = { icon: string; title: string };
export type IconTitleDesc = { icon: string; title: string; desc: string };
export type TitleTag = { title: string; tag: string };
export type AccordionItem = { title: string; body: string };
export type CaseStudy = { company: string; title: string; stat1: string; label1: string; stat2: string; label2: string };

export type LandingContent = {
  heroHeadingPrefix: string;
  heroHeadingHighlight: string;
  heroSubtext: string;
  heroBullets: string[];
  trustLogos: string[];
  endorsementHeadingPrefix: string;
  endorsementHeadingHighlight: string;
  endorsementSubtext: string;
  endorsementItems: IconTitle[];
  problemStats: StatPair[];
  problemAccordions: AccordionItem[];
  builtDifferentSubtext: string;
  builtDifferentItems: IconTitleDesc[];
  numbersGrid: StatPair[];
  financeOsItems: string[];
  platformCapabilitiesSubtext: string;
  platformCapabilities: TitleTag[];
  omniUpiItems: string[];
  whyCaSubtext: string;
  whyCaItems: IconTitleDesc[];
  featuredTestimonial: CaseStudy;
  caseStudies: CaseStudy[];
};

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  heroHeadingPrefix: "Business Fintech OS for your ",
  heroHeadingHighlight: "Spends",
  heroSubtext:
    "India's first bank-independent spend management platform — recommended by {contactName}, engineered for how modern businesses in {city} move money.",
  heroBullets: ["🛡 RBI Licensed PPI", "📂 One Stop Solution", "📍 1000+ Businesses"],
  trustLogos: [
    "Policybazaar", "Puma", "GIVA", "Senco Gold", "FNP", "The Hosteller", "Porter",
    "Pluckk", "Haldiram's", "Delhivery", "bloom", "Nykaa", "BlueStone", "Taco Bell",
  ],
  endorsementHeadingPrefix: "Your CA already found the Best ",
  endorsementHeadingHighlight: "for You.",
  endorsementSubtext:
    "When your CA recommends a platform, it's backed by professional accountability, detailed evaluation, and real client results.",
  endorsementItems: [
    { icon: "🛡", title: "Licensed By RBI" },
    { icon: "💰", title: "Guaranteed 10% Cost Savings" },
    { icon: "🧩", title: "One Stop Solution" },
  ],
  problemStats: [
    { big: "30-40 Days", small: "Travel reimbursement cycle" },
    { big: "10-20%", small: "Monthly spend reduction opportunity" },
    { big: "₹36 Lakh/Year", small: "Annual business expense leakage" },
    { big: "₹2.5-3 Lakh/Month", small: "Monthly operational expense leakage" },
    { big: "10 Man-Hours/Week", small: "Manual effort spent every week" },
  ],
  problemAccordions: [
    {
      title: "The CFO Struggle Today",
      body: "Reconciling receipts across a dozen departments every month-end, chasing approvals over WhatsApp, and reimbursements that take weeks — this is still how most Indian businesses run spend.",
    },
    {
      title: "The Harsh Reality Today",
      body: "Manual expense processes cost growing businesses real money in leakage, employee time, and audit risk — long before anyone notices it in the P&L.",
    },
  ],
  builtDifferentSubtext:
    "Every decision at OmniCard is made for Indian businesses — compliance, payment rails, and the scale you're growing toward.",
  builtDifferentItems: [
    { icon: "🛡", title: "RBI Licensed PPI Issuer", desc: "India's strictest payment compliance standard." },
    { icon: "🌐", title: "Bank Independent", desc: "Works with any existing bank account." },
    { icon: "💳", title: "RuPay Corporate Cards", desc: "Physical + virtual, accepted everywhere." },
    { icon: "⚡", title: "Real-time Everything", desc: "Controls, alerts, and approvals — live." },
    { icon: "👥", title: "5-min Onboarding", desc: "Digital KYC, instant card activation." },
    { icon: "✅", title: "Audit-Ready by Default", desc: "Every transaction documented automatically." },
  ],
  numbersGrid: [
    { big: "5", small: "Manhours Saved Weekly" },
    { big: "100%", small: "Visibility Of Your Business Spends" },
    { big: "0%", small: "Manual Effort" },
    { big: "4x Faster", small: "Processing With Digital Solutions" },
    { big: "18%", small: "More Savings Annually" },
    { big: "3x", small: "Reduced Maverick Buying" },
    { big: "30 Min", small: "To Get Started" },
    { big: "1 Click", small: "Reimbursements" },
  ],
  financeOsItems: ["Expense Reporting", "Upload Bills & Invoices", "Ready P&L", "Transaction Controls", "Easy Issuance & Loading"],
  platformCapabilitiesSubtext: "One platform. Zero compromise.",
  platformCapabilities: [
    { title: "Expense Reporting & Data", tag: "REPORTING" },
    { title: "Last Mile Digitization", tag: "DIGITIZATION" },
    { title: "Seamless Integrations", tag: "INTEGRATIONS" },
  ],
  omniUpiItems: ["No Bank A/C Needed", "Create UPI ID In 1 Click", "Send & Receive Payments", "Separate Business and Personal Expenses"],
  whyCaSubtext:
    "As your trusted financial advisor, we've evaluated dozens of platforms. OmniCard stands out for its compliance depth, real-time controls, and the genuine time it saves every finance team.",
  whyCaItems: [
    { icon: "👁", title: "Improve Financial Control", desc: "Real-time visibility into every expense — no more month-end surprises for you or your CA." },
    { icon: "📄", title: "Simplify Bookkeeping", desc: "Auto-categorised transactions flow directly into your accounting workflow, GST-ready." },
    { icon: "🔄", title: "Reduce Manual Work", desc: "Automate expense reports, approvals, and reconciliation — saving your team hours every week." },
    { icon: "🛡", title: "Enhance Compliance", desc: "Policy-enforced spending, digital receipts, and full audit trails built into every transaction." },
    { icon: "🕐", title: "Better Spend Visibility", desc: "Live dashboards give finance teams and your CA a clear, department-level picture at all times." },
  ],
  featuredTestimonial: {
    company: "Nath Bio-Genes (I) Ltd.",
    title: "How Nath Bio Genes saved ₹50L annually on regular business expenses with OmniCard",
    stat1: "50L+",
    label1: "Saved Annually",
    stat2: "5/5",
    label2: "Product Quality",
  },
  caseStudies: [
    { company: "KKSPUN India Ltd", title: "How OmniCard Helped KK Spun Eliminate Cash Dependency in Factory Operations", stat1: "0", label1: "Cash Dependency", stat2: "5/5", label2: "Service Support" },
    { company: "The Belgian Waffle Co.", title: "The Belgian Waffle Co.'s Recipe for Managing Petty Cash with OmniCard", stat1: "50%", label1: "Cut in Manpower", stat2: "250", label2: "Stores" },
    { company: "Haldiram's", title: "How OmniCard Helped Haldiram's Streamline Multi-Location Expense Management", stat1: "100%", label1: "Paperless Operations", stat2: "5/5", label2: "User friendliness" },
    { company: "BlueStone", title: "How BlueStone transformed their daily operational expenses from paperwork to real-time digital tracking", stat1: "100+", label1: "Retail Stores", stat2: "5/5", label2: "Product & Service" },
  ],
};

/** Deep-merges saved overrides onto the defaults so new fields added later
 * never crash on an older saved row. */
function mergeWithDefaults(overrides: Partial<LandingContent>): LandingContent {
  return { ...DEFAULT_LANDING_CONTENT, ...overrides };
}

export async function getLandingContent(): Promise<LandingContent> {
  const row = await db.landingPageContent.findUnique({ where: { id: "singleton" } });
  if (!row) return DEFAULT_LANDING_CONTENT;
  try {
    return mergeWithDefaults(JSON.parse(row.data));
  } catch {
    return DEFAULT_LANDING_CONTENT;
  }
}

// ---------------------------------------------------------------------------
// Form (de)serialization — list fields are edited as one item per line in a
// textarea, using " | " to separate sub-fields, so the editor stays a plain
// HTML form instead of a dynamic list-builder UI.
// ---------------------------------------------------------------------------

function toLines(items: string[]): string {
  return items.join("\n");
}

function fromLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function toPipeLines(rows: string[][]): string {
  return rows.map((r) => r.join(" | ")).join("\n");
}

function fromPipeLines(text: string, fieldCount: number): string[][] {
  return fromLines(text).map((line) => {
    const parts = line.split("|").map((p) => p.trim());
    return Array.from({ length: fieldCount }, (_, i) => parts[i] ?? "");
  });
}

export function serializeForForm(content: LandingContent) {
  return {
    heroBullets: toLines(content.heroBullets),
    trustLogos: toLines(content.trustLogos),
    endorsementItems: toPipeLines(content.endorsementItems.map((i) => [i.icon, i.title])),
    problemStats: toPipeLines(content.problemStats.map((s) => [s.big, s.small])),
    problemAccordions: toPipeLines(content.problemAccordions.map((a) => [a.title, a.body])),
    builtDifferentItems: toPipeLines(content.builtDifferentItems.map((i) => [i.icon, i.title, i.desc])),
    numbersGrid: toPipeLines(content.numbersGrid.map((s) => [s.big, s.small])),
    financeOsItems: toLines(content.financeOsItems),
    platformCapabilities: toPipeLines(content.platformCapabilities.map((c) => [c.title, c.tag])),
    omniUpiItems: toLines(content.omniUpiItems),
    whyCaItems: toPipeLines(content.whyCaItems.map((i) => [i.icon, i.title, i.desc])),
    caseStudies: toPipeLines(content.caseStudies.map((c) => [c.company, c.title, c.stat1, c.label1, c.stat2, c.label2])),
  };
}

export function parseFromForm(formData: FormData): LandingContent {
  const str = (name: string) => String(formData.get(name) ?? "");

  return {
    heroHeadingPrefix: str("heroHeadingPrefix"),
    heroHeadingHighlight: str("heroHeadingHighlight"),
    heroSubtext: str("heroSubtext"),
    heroBullets: fromLines(str("heroBullets")),
    trustLogos: fromLines(str("trustLogos")),
    endorsementHeadingPrefix: str("endorsementHeadingPrefix"),
    endorsementHeadingHighlight: str("endorsementHeadingHighlight"),
    endorsementSubtext: str("endorsementSubtext"),
    endorsementItems: fromPipeLines(str("endorsementItems"), 2).map(([icon, title]) => ({ icon, title })),
    problemStats: fromPipeLines(str("problemStats"), 2).map(([big, small]) => ({ big, small })),
    problemAccordions: fromPipeLines(str("problemAccordions"), 2).map(([title, body]) => ({ title, body })),
    builtDifferentSubtext: str("builtDifferentSubtext"),
    builtDifferentItems: fromPipeLines(str("builtDifferentItems"), 3).map(([icon, title, desc]) => ({ icon, title, desc })),
    numbersGrid: fromPipeLines(str("numbersGrid"), 2).map(([big, small]) => ({ big, small })),
    financeOsItems: fromLines(str("financeOsItems")),
    platformCapabilitiesSubtext: str("platformCapabilitiesSubtext"),
    platformCapabilities: fromPipeLines(str("platformCapabilities"), 2).map(([title, tag]) => ({ title, tag })),
    omniUpiItems: fromLines(str("omniUpiItems")),
    whyCaSubtext: str("whyCaSubtext"),
    whyCaItems: fromPipeLines(str("whyCaItems"), 3).map(([icon, title, desc]) => ({ icon, title, desc })),
    featuredTestimonial: {
      company: str("featuredCompany"),
      title: str("featuredTitle"),
      stat1: str("featuredStat1"),
      label1: str("featuredLabel1"),
      stat2: str("featuredStat2"),
      label2: str("featuredLabel2"),
    },
    caseStudies: fromPipeLines(str("caseStudies"), 6).map(([company, title, stat1, label1, stat2, label2]) => ({
      company,
      title,
      stat1,
      label1,
      stat2,
      label2,
    })),
  };
}

/** Substitutes {contactName}/{city}/{firmName} tokens editors can use in
 * free-text fields (e.g. the hero subtext) with a specific advisor's data. */
export function fillTokens(text: string, tokens: { contactName: string; city: string; firmName: string }): string {
  return text
    .replaceAll("{contactName}", tokens.contactName)
    .replaceAll("{city}", tokens.city)
    .replaceAll("{firmName}", tokens.firmName);
}
