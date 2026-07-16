import { db } from "@/lib/db";
import { captureLeadAction } from "@/app/actions/partner";
import { notFound } from "next/navigation";
import { CoLandingAccordion } from "@/components/site/co-landing-accordion";

type Advisor = {
  id: string;
  firmName: string;
  contactName: string;
  city: string;
  logoUrl: string | null;
};

const TRUST_LOGOS = [
  "Policybazaar", "Puma", "GIVA", "Senco Gold", "FNP", "The Hosteller", "Porter",
  "Pluckk", "Haldiram's", "Delhivery", "bloom", "Nykaa", "BlueStone", "Taco Bell",
];

const ENDORSEMENT_ITEMS = [
  { icon: "🛡", title: "Licensed By RBI" },
  { icon: "💰", title: "Guaranteed 10% Cost Savings" },
  { icon: "🧩", title: "One Stop Solution" },
];

const PROBLEM_STATS = [
  { big: "30-40 Days", small: "Travel reimbursement cycle" },
  { big: "10-20%", small: "Monthly spend reduction opportunity" },
  { big: "₹36 Lakh/Year", small: "Annual business expense leakage" },
  { big: "₹2.5-3 Lakh/Month", small: "Monthly operational expense leakage" },
  { big: "10 Man-Hours/Week", small: "Manual effort spent every week" },
];

const BUILT_DIFFERENT = [
  ["🛡", "RBI Licensed PPI Issuer", "India's strictest payment compliance standard."],
  ["🌐", "Bank Independent", "Works with any existing bank account."],
  ["💳", "RuPay Corporate Cards", "Physical + virtual, accepted everywhere."],
  ["⚡", "Real-time Everything", "Controls, alerts, and approvals — live."],
  ["👥", "5-min Onboarding", "Digital KYC, instant card activation."],
  ["✅", "Audit-Ready by Default", "Every transaction documented automatically."],
];

const NUMBERS_GRID = [
  ["5", "Manhours Saved Weekly"], ["100%", "Visibility Of Your Business Spends"],
  ["0%", "Manual Effort"], ["4x Faster", "Processing With Digital Solutions"],
  ["18%", "More Savings Annually"], ["3x", "Reduced Maverick Buying"],
  ["30 Min", "To Get Started"], ["1 Click", "Reimbursements"],
];

const FINANCE_OS_ITEMS = ["Expense Reporting", "Upload Bills & Invoices", "Ready P&L", "Transaction Controls", "Easy Issuance & Loading"];

const PLATFORM_CAPABILITIES = [
  ["Expense Reporting & Data", "REPORTING"],
  ["Last Mile Digitization", "DIGITIZATION"],
  ["Seamless Integrations", "INTEGRATIONS"],
];

const OMNI_UPI_ITEMS = ["No Bank A/C Needed", "Create UPI ID In 1 Click", "Send & Receive Payments", "Separate Business and Personal Expenses"];

const WHY_CA_RECOMMENDS = [
  ["👁", "Improve Financial Control", "Real-time visibility into every expense — no more month-end surprises for you or your CA."],
  ["📄", "Simplify Bookkeeping", "Auto-categorised transactions flow directly into your accounting workflow, GST-ready."],
  ["🔄", "Reduce Manual Work", "Automate expense reports, approvals, and reconciliation — saving your team hours every week."],
  ["🛡", "Enhance Compliance", "Policy-enforced spending, digital receipts, and full audit trails built into every transaction."],
  ["🕐", "Better Spend Visibility", "Live dashboards give finance teams and your CA a clear, department-level picture at all times."],
];

const CASE_STUDIES = [
  ["KKSPUN India Ltd", "How OmniCard Helped KK Spun Eliminate Cash Dependency in Factory Operations", "0", "Cash Dependency", "5/5", "Service Support"],
  ["The Belgian Waffle Co.", "The Belgian Waffle Co.'s Recipe for Managing Petty Cash with OmniCard", "50%", "Cut in Manpower", "250", "Stores"],
  ["Haldiram's", "How OmniCard Helped Haldiram's Streamline Multi-Location Expense Management", "100%", "Paperless Operations", "5/5", "User friendliness"],
  ["BlueStone", "How BlueStone transformed their daily operational expenses from paperwork to real-time digital tracking", "100+", "Retail Stores", "5/5", "Product & Service"],
];

export default async function AdvisorMicrosite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const partner = await db.partner.findUnique({ where: { slug } });
  if (!partner || (partner.stage !== "CERTIFIED" && partner.stage !== "ACTIVE") || !partner.micrositeEnabled) {
    notFound();
  }

  return (
    <div className="bg-[#0A0A0A] font-sans text-white">
      <NavBar />
      <Hero advisor={partner} />
      <TrustedLogos />
      <CAEndorsement advisor={partner} />
      <ProblemStats />
      <BuiltDifferent />
      <NumbersGrid />
      <FinanceOS />
      <PlatformCapabilities />
      <OmniUPISection />
      <WhyCARecommends advisor={partner} />
      <Testimonials />
      <FinalCTA advisor={partner} />
      <Footer />
    </div>
  );
}

function NavBar() {
  return (
    <header className="flex items-center justify-between px-8 py-4">
      <div className="flex-1" />
      <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-2">
        <PillLink>Solutions</PillLink>
        <PillLink>Case Studies</PillLink>
        <PillLink>Resources</PillLink>
        <div className="mx-3 flex items-end gap-1 text-lg font-extrabold">
          <span className="text-[#DC2E22]">Omni</span>Card
          <span className="ml-1 self-end text-[10px] font-normal text-white/50">business payments.ai</span>
        </div>
        <PillLink>About</PillLink>
        <PillLink>Contact</PillLink>
        <a href="#get-started" className="rounded-full bg-[#DC2E22] px-4 py-2 text-sm font-semibold">
          Book a Demo
        </a>
      </nav>
      <a href="/login" className="flex-1 text-right text-sm text-white/70 hover:text-white">
        Login
      </a>
    </header>
  );
}

function PillLink({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full px-4 py-2 text-sm text-white/50">{children}</span>
  );
}

function Hero({ advisor }: { advisor: Advisor }) {
  return (
    <section className="grid grid-cols-1 gap-10 px-8 py-12 md:grid-cols-2 md:px-16">
      <div>
        <Badge>Trusted recommendation &middot; {advisor.firmName}</Badge>
        <h1 className="mt-6 text-5xl font-extrabold leading-tight md:text-6xl">
          Business Fintech OS for your <span className="text-[#DC2E22]">Spends</span>
        </h1>
        <p className="mt-4 max-w-md text-white/60">
          India&apos;s first bank-independent spend management platform — recommended by{" "}
          {advisor.contactName}, engineered for how modern businesses in {advisor.city} move money.
        </p>
        <ul className="mt-6 flex flex-wrap gap-6 text-sm text-white/70">
          <li>&#128737; RBI Licensed PPI</li>
          <li>&#128194; One Stop Solution</li>
          <li>&#128205; 1000+ Businesses</li>
        </ul>
      </div>
      <div id="get-started">
        <LeadForm advisor={advisor} />
      </div>
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#3ECF6E]/40 bg-[#173B29] px-4 py-1.5 text-xs font-medium text-[#3ECF6E]">
      &#128205; {children}
    </span>
  );
}

function LeadForm({ advisor }: { advisor: Advisor }) {
  return (
    <form action={captureLeadAction} className="rounded-2xl border border-white/10 bg-[#141414] p-6">
      <input type="hidden" name="partnerId" value={advisor.id} />
      <input type="hidden" name="source" value="MICROSITE" />
      <p className="text-xs font-semibold uppercase text-[#DC2E22]">Get Started</p>
      <h3 className="mt-1 text-xl font-bold">See OmniCard in Action</h3>
      <p className="mt-1 text-sm text-white/50">Your CA partner will reach out within 24 hrs.</p>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <Field label="Full Name *" name="contactName" placeholder="Rahul Sharma" required />
        <Field label="Mobile *" name="phone" placeholder="+91 98765 43210" required />
      </div>
      <Field className="mt-4" label="Work Email" name="email" type="email" placeholder="rahul@company.com" />
      <Field className="mt-4" label="Company Name *" name="businessName" placeholder="Acme Technologies Pvt. Ltd." required />
      <div className="mt-4">
        <label className="text-xs font-semibold uppercase text-white/60">Message</label>
        <textarea
          name="message"
          placeholder="Tell us about your business goals..."
          rows={3}
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none placeholder:text-white/30"
        />
      </div>
      <button
        type="submit"
        className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#8f1c14] to-[#DC2E22] py-3 text-sm font-bold"
      >
        &#10148; Submit — Get a Free Demo
      </button>
      <p className="mt-3 text-center text-xs text-white/40">Your CA partner follows up within 24 hours.</p>
    </form>
  );
}

function Field({
  label,
  className = "",
  ...props
}: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold uppercase text-white/60">{label}</label>
      <input
        {...props}
        className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none placeholder:text-white/30"
      />
    </div>
  );
}

function TrustedLogos() {
  return (
    <section className="px-8 py-14 text-center">
      <h2 className="text-2xl font-bold">Trusted by 1000+ Businesses</h2>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-4 gap-6 opacity-60 sm:grid-cols-7">
        {TRUST_LOGOS.map((l) => (
          <span key={l} className="text-sm font-semibold">
            {l}
          </span>
        ))}
      </div>
    </section>
  );
}

function CAEndorsement({ advisor }: { advisor: Advisor }) {
  return (
    <section className="px-8 py-16 text-center">
      {advisor.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={advisor.logoUrl} alt={advisor.firmName} className="mx-auto h-14 rounded-lg bg-white p-2" />
      ) : (
        <div className="mx-auto w-fit rounded-lg bg-white px-6 py-3 font-serif text-black">{advisor.firmName}</div>
      )}
      <h2 className="mt-6 text-4xl font-extrabold">
        Your CA already found the Best <span className="text-[#DC2E22]">for You.</span>
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-white/60">
        When your CA recommends a platform, it&apos;s backed by professional accountability, detailed evaluation, and real client results.
      </p>
      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
        {ENDORSEMENT_ITEMS.map((i) => (
          <div key={i.title} className="rounded-xl border border-white/10 bg-[#141414] p-6">
            <div className="text-4xl">{i.icon}</div>
            <p className="mt-4 border-t border-white/10 pt-3 text-left font-bold">{i.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProblemStats() {
  return (
    <section className="px-8 py-16">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {PROBLEM_STATS.map((s) => (
          <StatCard key={s.small} big={s.big} small={s.small} />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <CoLandingAccordion
          title="The CFO Struggle Today"
          body="Reconciling receipts across a dozen departments every month-end, chasing approvals over WhatsApp, and reimbursements that take weeks — this is still how most Indian businesses run spend."
        />
        <CoLandingAccordion
          title="The Harsh Reality Today"
          body="Manual expense processes cost growing businesses real money in leakage, employee time, and audit risk — long before anyone notices it in the P&L."
        />
      </div>
    </section>
  );
}

function StatCard({ big, small }: { big: string; small: string }) {
  return (
    <div className="rounded-xl bg-gradient-to-b from-white/5 to-transparent p-5">
      <p className="font-extrabold text-[#DC2E22]">{big}</p>
      <p className="mt-2 text-sm text-white/60">{small}</p>
    </div>
  );
}

function BuiltDifferent() {
  return (
    <section className="grid grid-cols-1 gap-10 px-8 py-16 md:grid-cols-2 md:px-16">
      <div>
        <h2 className="text-4xl font-extrabold">
          Built Different.
          <br />
          <span className="text-[#DC2E22]">by Design.</span>
        </h2>
        <p className="mt-4 max-w-sm text-white/60">
          Every decision at OmniCard is made for Indian businesses — compliance, payment rails, and the scale you&apos;re growing toward.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {BUILT_DIFFERENT.map(([icon, title, desc]) => (
          <div key={title} className="rounded-xl bg-[#141414] p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DC2E22]">{icon}</div>
            <p className="mt-3 font-bold">{title}</p>
            <p className="mt-1 text-xs text-white/50">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function NumbersGrid() {
  return (
    <section className="px-8 py-16 text-center">
      <h2 className="text-4xl font-extrabold">
        The Numbers <span className="text-[#DC2E22]">Don&apos;t Lie.</span>
      </h2>
      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
        {NUMBERS_GRID.map(([big, small]) => (
          <div key={small} className="rounded-xl bg-gradient-to-b from-white/5 to-transparent p-6 text-left">
            <p className="text-3xl font-extrabold text-white/90">{big}</p>
            <p className="mt-3 text-sm text-white/60">{small}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinanceOS() {
  return (
    <section className="px-8 py-16 md:px-16">
      <h2 className="max-w-lg text-4xl font-extrabold">
        The <span className="text-[#DC2E22]">Finance Operating System</span> For Your Business
      </h2>
      <div className="mt-8 rounded-2xl border border-white/10 bg-[#141414] p-6">
        <div className="flex h-64 items-center justify-center rounded-xl bg-black/40 text-white/30">
          Dashboard product preview
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-6 text-center text-sm text-white/70 sm:grid-cols-5">
        {FINANCE_OS_ITEMS.map((i) => (
          <div key={i}>{i}</div>
        ))}
      </div>
    </section>
  );
}

function PlatformCapabilities() {
  return (
    <section className="grid grid-cols-1 gap-10 px-8 py-16 md:grid-cols-2 md:px-16">
      <div>
        <Badge>Platform Capabilities</Badge>
        <h2 className="mt-4 text-4xl font-extrabold">
          Everything in one <span className="text-[#DC2E22]">command centre</span>
        </h2>
        <p className="mt-2 text-white/60">One platform. Zero compromise.</p>
        <div className="mt-6 space-y-3">
          {PLATFORM_CAPABILITIES.map(([title, tag]) => (
            <div key={title} className="flex items-center justify-between rounded-xl bg-[#141414] px-5 py-4">
              <span className="font-semibold">{title}</span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/60">{tag}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center rounded-2xl bg-[#141414]">
        <div className="flex h-64 w-full items-center justify-center text-white/30">Platform preview</div>
      </div>
    </section>
  );
}

function OmniUPISection() {
  return (
    <section className="px-8 py-16 text-center md:px-16">
      <h2 className="text-4xl font-extrabold">
        <span className="text-[#DC2E22]">@OMNI UPI</span> For Every Business Expense
      </h2>
      <div className="mx-auto mt-10 flex h-64 max-w-3xl items-center justify-center rounded-2xl bg-[#141414] text-white/30">
        Card + UPI preview
      </div>
      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-6 text-sm font-semibold sm:grid-cols-4">
        {OMNI_UPI_ITEMS.map((i) => (
          <div key={i}>{i}</div>
        ))}
      </div>
    </section>
  );
}

function WhyCARecommends({ advisor }: { advisor: Advisor }) {
  return (
    <section className="grid grid-cols-1 gap-10 px-8 py-16 md:grid-cols-2 md:px-16">
      <div>
        <Badge>Trusted recommendation &middot; {advisor.firmName}</Badge>
        <h2 className="mt-4 text-4xl font-extrabold">
          Why Your <span className="text-[#DC2E22]">CA Recommends</span>
          <br />
          OmniCard
        </h2>
        <p className="mt-3 max-w-sm text-white/60">
          As your trusted financial advisor, we&apos;ve evaluated dozens of platforms. OmniCard stands out for its compliance depth,
          real-time controls, and the genuine time it saves every finance team.
        </p>
      </div>
      <div className="space-y-3">
        {WHY_CA_RECOMMENDS.map(([icon, title, desc]) => (
          <div key={title} className="flex gap-4 rounded-xl bg-[#141414] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DC2E22]">{icon}</div>
            <div>
              <p className="font-bold">{title}</p>
              <p className="mt-1 text-xs text-white/50">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="px-8 py-16 md:px-16">
      <h2 className="text-center text-4xl font-extrabold">What Our Clients Say</h2>
      <div className="mx-auto mt-10 max-w-4xl rounded-2xl bg-[#141414] p-8 text-center">
        <p className="font-serif text-lg">Nath Bio-Genes (I) Ltd.</p>
        <h3 className="mt-3 text-2xl font-bold">
          How Nath Bio Genes saved &#8377;50L annually on regular business expenses with OmniCard
        </h3>
        <div className="mt-4 flex justify-center gap-8">
          <div>
            <p className="text-2xl font-extrabold">50L+</p>
            <p className="text-xs text-white/50">Saved Annually</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold">5/5</p>
            <p className="text-xs text-white/50">Product Quality</p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
        {CASE_STUDIES.map(([company, title, stat1, label1, stat2, label2]) => (
          <div key={company} className="rounded-xl bg-[#141414] p-6">
            <p className="text-xs font-semibold text-white/50">{company}</p>
            <h4 className="mt-2 font-bold">{title}</h4>
            <div className="mt-4 flex gap-8">
              <div>
                <p className="text-xl font-extrabold">{stat1}</p>
                <p className="text-xs text-white/50">{label1}</p>
              </div>
              <div>
                <p className="text-xl font-extrabold">{stat2}</p>
                <p className="text-xs text-white/50">{label2}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA({ advisor }: { advisor: Advisor }) {
  return (
    <section className="grid grid-cols-1 gap-10 px-8 py-16 md:grid-cols-2 md:px-16">
      <div>
        <Badge>Trusted recommendation &middot; {advisor.firmName}</Badge>
        <div className="mt-6">
          {advisor.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={advisor.logoUrl} alt={advisor.firmName} className="h-14 rounded-lg bg-white p-2" />
          ) : (
            <div className="w-fit rounded-lg bg-white px-6 py-3 font-serif text-black">{advisor.firmName}</div>
          )}
        </div>
        <h2 className="mt-8 text-4xl font-extrabold">Ready To Take Control Of Business Expenses?</h2>
      </div>
      <LeadForm advisor={advisor} />
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-8 py-16 md:px-16">
      <h3 className="text-2xl font-bold">Join the Movement. Book a Demo.</h3>
      <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-5">
        <div>
          <p className="text-lg font-extrabold">
            <span className="text-[#DC2E22]">Omni</span>Card
          </p>
          <p className="mt-2 text-xs text-white/40">
            Brand owned by Eroute Technologies. Building India&apos;s first Business Fintech OS.
          </p>
        </div>
        <FooterCol title="Solutions" items={["Expense Management", "Corporate Cards", "Trip Tracking", "Fleet", "FASTag", "UPI", "RuPay", "AI"]} />
        <FooterCol title="Resources" items={["About", "Our License", "Media & Awards", "Career", "Blogs", "Knowledge Hub", "User Guides", "FAQs"]} />
        <FooterCol title="Policies" items={["Privacy Policy", "Terms & Conditions", "Grievance Policy", "Refund Policy", "Raise a Complaint", "Report Fraud"]} />
        <div>
          <p className="font-bold">Book a Demo</p>
          <p className="mt-2 text-sm text-white/60">connect@omnicard.in</p>
          <p className="mt-4 font-bold">Support Queries</p>
          <p className="mt-2 text-sm text-white/60">care@omnicard.in</p>
        </div>
      </div>
      <p className="mt-12 text-center text-xs text-white/30">CIN: U72900UP2018PTC109634</p>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-bold">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-white/50">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
