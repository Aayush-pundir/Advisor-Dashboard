/** Static content sourced from the OmniCard CA Partner Network execution plan. */

export const PROGRAM_STATS = [
  { label: "ICAI Members", value: "4.07 Lakh+" },
  { label: "CA Firms", value: "~99,000" },
  { label: "MSMEs on Udyam", value: "5.7 Cr" },
  { label: "Partners — Yr 1 target", value: "500" },
  { label: "Run-rate target (M12)", value: "Rs 7 Cr" },
] as const;

export const FLOW_STEPS = [
  { step: 1, what: "Awareness campaign launch", who: "OmniCard" },
  { step: 2, what: "CA interest capture", who: "OmniCard" },
  { step: 3, what: "Meeting, demo & training", who: "OmniCard" },
  { step: 4, what: "Onboarding & certification", who: "OmniCard + CA" },
  { step: 5, what: "Co-branded assets prepared (48 hrs)", who: "OmniCard" },
  { step: 6, what: "Marketing to CA's clients", who: "OmniCard" },
  { step: 7, what: "Activity tracking", who: "OmniCard" },
  { step: 8, what: "Leads registered & converted", who: "OmniCard" },
  { step: 9, what: "Live tracker provided", who: "OmniCard" },
  { step: 10, what: "Payout (15% Yr-1 + 5% trailing)", who: "OmniCard" },
  { step: 11, what: "Milestone rewards", who: "OmniCard" },
  { step: 12, what: "Repeat & refer", who: "OmniCard + CA" },
] as const;

export const UNIT_ECONOMICS = [
  { label: "Partner Acquisition Cost", value: "Rs 30-40K" },
  { label: "Revenue per active CA / yr", value: "Rs 3-5 lakh" },
  { label: "Clients per active CA / yr (floor)", value: "5" },
  { label: "CA payout (15% + 5% trail)", value: "Rs 45-75K" },
  { label: "PAC payback", value: "Client #2-3" },
  { label: "Year-1 investment", value: "Rs 1.8 Cr" },
  { label: "Base-case run-rate (M12)", value: "Rs 7 Cr" },
] as const;

export const PROOF_BRANDS = [
  {
    brand: "Tally Solutions",
    strategy: "Certified partner + CA recommendation network",
    scale: "28,000+ channel partners",
  },
  {
    brand: "Zoho",
    strategy: "'Zoho for CAs' — free apps, certification, directory",
    scale: "Partner CA firms report 20% YoY practice revenue growth",
  },
  {
    brand: "ClearTax",
    strategy: "Free/discounted tax software to lock in the professional channel",
    scale: "20,000+ CA & tax expert firms; 1.5M+ customers",
  },
  {
    brand: "RazorpayX",
    strategy: "'Grow your CA practice 10X' partner dashboard",
    scale: "CA partner program across India's SME banking base",
  },
] as const;

export const KPI_TARGETS = [
  { stage: "Awareness", kpi: "Cost per partner lead", target: "<= Rs 500" },
  { stage: "Signup", kpi: "Visitor to signup", target: ">= 8%" },
  { stage: "Certification", kpi: "Signup to demo-certified", target: ">= 70%" },
  { stage: "Certification", kpi: "Time to certify", target: "<= 7 days" },
  {
    stage: "Activation (kill metric)",
    kpi: "Certified to first campaign live in 30 days",
    target: ">= 60%",
  },
  { stage: "Campaigns", kpi: "Leads per campaign per CA", target: "3-5" },
  { stage: "Sales", kpi: "Lead to demo", target: ">= 40%" },
  { stage: "Sales", kpi: "Demo to close", target: ">= 25%" },
  { stage: "Sales", kpi: "SLA adherence", target: ">= 95%" },
  { stage: "Revenue", kpi: "Clients per active CA (rolling 12M)", target: ">= 5" },
  { stage: "Retention", kpi: "NPS", target: ">= 50" },
  { stage: "Retention", kpi: "90-day dormancy", target: "< 25%" },
  { stage: "Retention", kpi: "Referred share", target: ">= 20%" },
] as const;
