import { getAuthedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PrintButton } from "@/components/partner/print-button";
import { formatDate } from "@/lib/utils";

export default async function PartnerDocumentsPage() {
  const user = await getAuthedUser();
  const partner = await db.partner.findUniqueOrThrow({ where: { id: user!.partnerId! } });

  const mouEvent = await db.activityEvent.findFirst({
    where: { partnerId: partner.id, type: "CLICK", meta: { startsWith: "mou_signed:" } },
    orderBy: { createdAt: "asc" },
  });
  const designation = partner.designation || mouEvent?.meta?.split(":")[1] || "Authorized Signatory";
  const signedDate = mouEvent?.createdAt ?? partner.createdAt;

  const isCertified = partner.stage === "CERTIFIED" || partner.stage === "ACTIVE";

  return (
    <div className="flex flex-col gap-8">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="mt-1 text-muted">Your signed Implementation Advisor Agreement and, once certified, your advisor certificate.</p>
      </div>

      {/* Implementation Advisor Agreement */}
      <div className="rounded-2xl border-2 border-[#D4A017] bg-[#FDFBF5] p-8 text-[#1B1714] print:break-after-page">
        <div className="flex items-start justify-between print:hidden">
          <span />
          <PrintButton />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-plex-serif)" }}>
            IMPLEMENTATION ADVISOR AGREEMENT
          </h2>
          <p className="mt-1 text-sm text-black/55">Advisory Services &amp; Fee Agreement</p>
          <div className="my-4 flex items-center gap-2">
            <span className="h-px flex-1 bg-[#D4A017]/40" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#D4A017]" />
            <span className="h-px flex-1 bg-[#D4A017]/40" />
          </div>
        </div>
        <p className="text-center text-[13px] font-semibold text-brand">BETWEEN</p>
        <p className="mx-auto mb-3 max-w-sm border-b border-black/30 pb-2 text-center text-base font-bold">
          EROUTE TECHNOLOGIES PRIVATE LIMITED
        </p>
        <p className="text-center text-[13px] font-semibold text-brand">AND</p>
        <p className="mx-auto mb-4 max-w-sm border-b border-black/30 pb-2 text-center text-base font-bold">
          {partner.firmName}
        </p>

        <p className="mt-4 text-sm leading-relaxed">
          This Agreement is made between <strong>Eroute Technologies Private Limited</strong>, operating under the
          registered brand name &ldquo;OmniCard&rdquo;, having its registered office at C 56 A/12, 8th Floor,
          Technopolis IT Hub, Sector 62, Noida, Uttar Pradesh 201301 (&ldquo;Eroute&rdquo;), and{" "}
          <strong>{partner.firmName}</strong>, an independent advisor / advisory firm (&ldquo;Advisor&rdquo;). Eroute
          and the Advisor are together the &ldquo;Parties&rdquo;.
        </p>

        <Clause n={1} title="Background">
          Eroute is an RBI-licensed Prepaid Payment Instrument issuer operating OmniCard, India&apos;s Business
          Fintech OS. The Advisor is an independent professional or advisory firm well placed to identify businesses
          that would benefit from OmniCard, and will render advisory and implementation-support services to
          facilitate the adoption of OmniCard by such businesses (&ldquo;Clients&rdquo;), in exchange for the
          Advisory Fees set out in Schedule A. This engagement is non-exclusive.
        </Clause>
        <Clause n={2} title="Scope of Services">
          The Advisor shall assess suitability, advise the Client on implementation, coordinate with Eroute&apos;s
          onboarding team for a smooth go-live, and remain available for basic queries during the Client&apos;s first
          year. A business already an active OmniCard client does not qualify as a Client. Where more than one
          Advisor introduces the same business, Advisory Fees are attributed to whichever Advisor first formally
          registers that Client with Eroute. Eroute shall close all commercial terms directly with the Client,
          keeping the Advisor in copy. Customisation, cross-sell, or up-sell revenue carries no Advisory Fee.
        </Clause>
        <Clause n={3} title="Advisory Fees">
          Eroute shall pay the Advisor Advisory Fees calculated per Schedule A — recurring every year a Client
          remains active and renews, payable within 45 days of Eroute realising the corresponding revenue, exclusive
          of GST and subject to applicable taxes including TDS. Eroute shall provide a quarterly statement of Clients
          introduced, realised ACV, and Advisory Fees payable; Advisors with 10+ Clients get real-time dashboard
          access in lieu of the statement.
        </Clause>
        <Clause n={4} title="Onboarding Integrity & Compliance">
          A Client counts toward volume milestones only after 90 consecutive days as an Active Client. Eroute may
          claw back Advisory Fees paid on a Client later found onboarded fraudulently or without a genuine business
          relationship. The Advisor shall not introduce Clients failing KYC/AML checks, and each Party shall handle
          personal data per the Digital Personal Data Protection Act, 2023.
        </Clause>
        <Clause n={5} title="Confidentiality & Data">
          Each Party shall keep confidential all non-public information of the other and its Clients, surviving
          termination for one year. The Advisor shall not store or share Client data beyond what Clause 2 requires.
        </Clause>
        <Clause n={6} title="Intellectual Property & Marketing">
          Eroute retains all rights in the Business Fintech OS and its trademarks. Either Party may reference the
          other as an Implementation Advisor / partner in marketing only with prior written consent; the Advisor
          consents to Eroute using its name, logo, and testimonials in Eroute&apos;s marketing unless withdrawn in
          writing.
        </Clause>
        <Clause n={7} title="Liability & Indemnity">
          Each Party indemnifies the other against direct losses from its own breach, fraud, gross negligence, or
          wilful misconduct; neither is liable for indirect or consequential damages. Except for fraud or wilful
          misconduct, aggregate liability is capped at Advisory Fees paid or payable in the preceding 12 months.
        </Clause>
        <Clause n={8} title="Non-Solicitation & Assignment">
          For 6 months after termination, the Advisor shall not solicit any Client onboarded under this Agreement to
          a competing platform, and may not assign or subcontract its rights or obligations without Eroute&apos;s
          prior written consent.
        </Clause>
        <Clause n={9} title="Term & Termination">
          This Agreement runs 12 months from the Effective Date and auto-renews annually unless either Party gives
          30 days&apos; notice. Either Party may terminate immediately for uncured material breach, insolvency, or
          loss of a required professional licence. Advisory Fees on Clients already active continue even after
          termination, for as long as those Clients remain active. Clauses 4–8 survive termination.
        </Clause>
        <Clause n={10} title="General">
          This Agreement does not create a partnership, joint venture, or employment relationship. It is governed by
          the laws of India; disputes are referred to a sole arbitrator in Noida under the Arbitration and
          Conciliation Act, 1996, subject to the exclusive jurisdiction of courts at Gautam Buddh Nagar, Uttar
          Pradesh.
        </Clause>

        <div className="mt-6 rounded-lg border border-black/15 bg-black/[0.02] p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-black">Schedule A — Advisory Fee Structure</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-black/20 text-left">
                <th className="py-1.5 pr-2 font-bold">Component</th>
                <th className="py-1.5 px-2 font-bold">Rate</th>
                <th className="py-1.5 pl-2 font-bold">Basis</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black/10">
                <td className="py-2 pr-2">Year 1 Advisory Fee</td>
                <td className="py-2 px-2">15% flat</td>
                <td className="py-2 pl-2">On realised ACV of each Client in its first active year</td>
              </tr>
              <tr>
                <td className="py-2 pr-2">Year 2+ Trailing Fee</td>
                <td className="py-2 px-2">5% flat</td>
                <td className="py-2 pl-2">On realised ACV of each Client, every year from Year 2 onward while Active</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-[13px] font-bold text-brand">For Eroute Technologies Pvt. Ltd.</p>
            <SigLine label="Name" value="Abhishek Saxena" />
            <SigLine
              label="Date"
              value={partner.mouCountersignedAt ? formatDate(partner.mouCountersignedAt) : "Pending"}
            />
            <SigLine label="Designation" value="CEO & MD" />
            <SigLine label="Signature" value={partner.mouCountersignedAt ? "Abhishek Saxena" : "Awaiting countersignature"} script />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-bold text-brand">For {partner.firmName}</p>
            <SigLine label="Name" value={partner.contactName} />
            <SigLine label="Date" value={formatDate(signedDate)} />
            <SigLine label="Designation" value={designation} />
            <SigLine label="Signature" value={partner.contactName} script />
          </div>
        </div>

        <p className="mt-8 text-center text-xs italic text-black/45">
          IN WITNESS WHEREOF the Parties have executed this Agreement as of the Effective Date.
        </p>
      </div>

      {/* Certificate */}
      <div className="rounded-2xl border-2 border-[#D4A017] bg-[#FDFBF5] p-10 text-center text-[#1B1714]">
        <div className="flex justify-end print:hidden">
          <PrintButton label={isCertified ? "Print certificate" : "Not yet issued"} />
        </div>
        {isCertified ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              OmniCard Implementation Advisory
            </p>
            <h2 className="mt-3 text-2xl font-bold" style={{ fontFamily: "var(--font-plex-serif)" }}>
              Certificate of Certification
            </h2>
            <p className="mt-6 text-sm text-black/60">This certifies that</p>
            <p className="mt-2 text-xl font-bold" style={{ fontFamily: "var(--font-plex-serif)" }}>
              {partner.contactName}
            </p>
            <p className="text-sm text-black/60">of {partner.firmName}</p>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-black/70">
              has successfully completed certification as an OmniCard Implementation Advisor, and is authorized
              to represent OmniCard&apos;s Business Fintech OS to their clients.
            </p>
            <p className="mt-6 text-xs text-black/50">
              Certified on {partner.certifiedAt ? formatDate(partner.certifiedAt) : "—"}
            </p>
          </>
        ) : (
          <p className="py-10 text-sm text-black/50">
            Your certificate will appear here once your certification demo is complete.
          </p>
        )}
      </div>
    </div>
  );
}

function Clause({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="text-[13px] font-bold">
        {n}. {title.toUpperCase()}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-black/70">{children}</p>
    </div>
  );
}

function SigLine({ label, value, script }: { label: string; value: string; script?: boolean }) {
  return (
    <div className="flex justify-between border-b border-black/15 py-1.5 text-xs">
      <span className="text-black/55">{label}:</span>
      <span
        className={script ? "font-semibold italic" : "font-medium"}
        style={script ? { fontFamily: "var(--font-plex-serif)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
