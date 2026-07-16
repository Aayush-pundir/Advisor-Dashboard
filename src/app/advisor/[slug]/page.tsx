import { db } from "@/lib/db";
import { captureLeadAction } from "@/app/actions/partner";
import { notFound } from "next/navigation";
import { CoLandingAccordion } from "@/components/site/co-landing-accordion";
import { getLandingContent, fillTokens, type LandingContent } from "@/lib/landing-content";

type Advisor = {
  id: string;
  firmName: string;
  contactName: string;
  city: string;
  logoUrl: string | null;
};

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
  const content = await getLandingContent();

  return (
    <div className="bg-[#0A0A0A] font-sans text-white">
      <NavBar />
      <Hero advisor={partner} content={content} />
      <TrustedLogos content={content} />
      <CAEndorsement advisor={partner} content={content} />
      <ProblemStats content={content} />
      <BuiltDifferent content={content} />
      <NumbersGrid content={content} />
      <FinanceOS content={content} />
      <PlatformCapabilities content={content} />
      <OmniUPISection content={content} />
      <WhyCARecommends advisor={partner} content={content} />
      <Testimonials content={content} />
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

function Hero({ advisor, content }: { advisor: Advisor; content: LandingContent }) {
  const subtext = fillTokens(content.heroSubtext, advisor);
  return (
    <section className="grid grid-cols-1 gap-10 px-8 py-12 md:grid-cols-2 md:px-16">
      <div>
        <Badge>Trusted recommendation &middot; {advisor.firmName}</Badge>
        <h1 className="mt-6 text-5xl font-extrabold leading-tight md:text-6xl">
          {content.heroHeadingPrefix}
          <span className="text-[#DC2E22]">{content.heroHeadingHighlight}</span>
        </h1>
        <p className="mt-4 max-w-md text-white/60">{subtext}</p>
        <ul className="mt-6 flex flex-wrap gap-6 text-sm text-white/70">
          {content.heroBullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
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

function TrustedLogos({ content }: { content: LandingContent }) {
  return (
    <section className="px-8 py-14 text-center">
      <h2 className="text-2xl font-bold">Trusted by 1000+ Businesses</h2>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-4 gap-6 opacity-60 sm:grid-cols-7">
        {content.trustLogos.map((l) => (
          <span key={l} className="text-sm font-semibold">
            {l}
          </span>
        ))}
      </div>
    </section>
  );
}

function CAEndorsement({ advisor, content }: { advisor: Advisor; content: LandingContent }) {
  return (
    <section className="px-8 py-16 text-center">
      {advisor.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={advisor.logoUrl} alt={advisor.firmName} className="mx-auto h-14 rounded-lg bg-white p-2" />
      ) : (
        <div className="mx-auto w-fit rounded-lg bg-white px-6 py-3 font-serif text-black">{advisor.firmName}</div>
      )}
      <h2 className="mt-6 text-4xl font-extrabold">
        {content.endorsementHeadingPrefix}
        <span className="text-[#DC2E22]">{content.endorsementHeadingHighlight}</span>
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-white/60">{content.endorsementSubtext}</p>
      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
        {content.endorsementItems.map((i) => (
          <div key={i.title} className="rounded-xl border border-white/10 bg-[#141414] p-6">
            <div className="text-4xl">{i.icon}</div>
            <p className="mt-4 border-t border-white/10 pt-3 text-left font-bold">{i.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProblemStats({ content }: { content: LandingContent }) {
  return (
    <section className="px-8 py-16">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {content.problemStats.map((s) => (
          <StatCard key={s.small} big={s.big} small={s.small} />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {content.problemAccordions.map((a) => (
          <CoLandingAccordion key={a.title} title={a.title} body={a.body} />
        ))}
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

function BuiltDifferent({ content }: { content: LandingContent }) {
  return (
    <section className="grid grid-cols-1 gap-10 px-8 py-16 md:grid-cols-2 md:px-16">
      <div>
        <h2 className="text-4xl font-extrabold">
          Built Different.
          <br />
          <span className="text-[#DC2E22]">by Design.</span>
        </h2>
        <p className="mt-4 max-w-sm text-white/60">{content.builtDifferentSubtext}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {content.builtDifferentItems.map((i) => (
          <div key={i.title} className="rounded-xl bg-[#141414] p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DC2E22]">{i.icon}</div>
            <p className="mt-3 font-bold">{i.title}</p>
            <p className="mt-1 text-xs text-white/50">{i.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function NumbersGrid({ content }: { content: LandingContent }) {
  return (
    <section className="px-8 py-16 text-center">
      <h2 className="text-4xl font-extrabold">
        The Numbers <span className="text-[#DC2E22]">Don&apos;t Lie.</span>
      </h2>
      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
        {content.numbersGrid.map((s) => (
          <div key={s.small} className="rounded-xl bg-gradient-to-b from-white/5 to-transparent p-6 text-left">
            <p className="text-3xl font-extrabold text-white/90">{s.big}</p>
            <p className="mt-3 text-sm text-white/60">{s.small}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinanceOS({ content }: { content: LandingContent }) {
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
        {content.financeOsItems.map((i) => (
          <div key={i}>{i}</div>
        ))}
      </div>
    </section>
  );
}

function PlatformCapabilities({ content }: { content: LandingContent }) {
  return (
    <section className="grid grid-cols-1 gap-10 px-8 py-16 md:grid-cols-2 md:px-16">
      <div>
        <Badge>Platform Capabilities</Badge>
        <h2 className="mt-4 text-4xl font-extrabold">
          Everything in one <span className="text-[#DC2E22]">command centre</span>
        </h2>
        <p className="mt-2 text-white/60">{content.platformCapabilitiesSubtext}</p>
        <div className="mt-6 space-y-3">
          {content.platformCapabilities.map((c) => (
            <div key={c.title} className="flex items-center justify-between rounded-xl bg-[#141414] px-5 py-4">
              <span className="font-semibold">{c.title}</span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/60">{c.tag}</span>
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

function OmniUPISection({ content }: { content: LandingContent }) {
  return (
    <section className="px-8 py-16 text-center md:px-16">
      <h2 className="text-4xl font-extrabold">
        <span className="text-[#DC2E22]">@OMNI UPI</span> For Every Business Expense
      </h2>
      <div className="mx-auto mt-10 flex h-64 max-w-3xl items-center justify-center rounded-2xl bg-[#141414] text-white/30">
        Card + UPI preview
      </div>
      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-6 text-sm font-semibold sm:grid-cols-4">
        {content.omniUpiItems.map((i) => (
          <div key={i}>{i}</div>
        ))}
      </div>
    </section>
  );
}

function WhyCARecommends({ advisor, content }: { advisor: Advisor; content: LandingContent }) {
  return (
    <section className="grid grid-cols-1 gap-10 px-8 py-16 md:grid-cols-2 md:px-16">
      <div>
        <Badge>Trusted recommendation &middot; {advisor.firmName}</Badge>
        <h2 className="mt-4 text-4xl font-extrabold">
          Why Your <span className="text-[#DC2E22]">CA Recommends</span>
          <br />
          OmniCard
        </h2>
        <p className="mt-3 max-w-sm text-white/60">{content.whyCaSubtext}</p>
      </div>
      <div className="space-y-3">
        {content.whyCaItems.map((i) => (
          <div key={i.title} className="flex gap-4 rounded-xl bg-[#141414] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DC2E22]">{i.icon}</div>
            <div>
              <p className="font-bold">{i.title}</p>
              <p className="mt-1 text-xs text-white/50">{i.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials({ content }: { content: LandingContent }) {
  const t = content.featuredTestimonial;
  return (
    <section className="px-8 py-16 md:px-16">
      <h2 className="text-center text-4xl font-extrabold">What Our Clients Say</h2>
      <div className="mx-auto mt-10 max-w-4xl rounded-2xl bg-[#141414] p-8 text-center">
        <p className="font-serif text-lg">{t.company}</p>
        <h3 className="mt-3 text-2xl font-bold">{t.title}</h3>
        <div className="mt-4 flex justify-center gap-8">
          <div>
            <p className="text-2xl font-extrabold">{t.stat1}</p>
            <p className="text-xs text-white/50">{t.label1}</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold">{t.stat2}</p>
            <p className="text-xs text-white/50">{t.label2}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
        {content.caseStudies.map((c) => (
          <div key={c.company} className="rounded-xl bg-[#141414] p-6">
            <p className="text-xs font-semibold text-white/50">{c.company}</p>
            <h4 className="mt-2 font-bold">{c.title}</h4>
            <div className="mt-4 flex gap-8">
              <div>
                <p className="text-xl font-extrabold">{c.stat1}</p>
                <p className="text-xs text-white/50">{c.label1}</p>
              </div>
              <div>
                <p className="text-xl font-extrabold">{c.stat2}</p>
                <p className="text-xs text-white/50">{c.label2}</p>
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
