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
        <p className="mt-1 text-muted">Your signed MOU and, once certified, your advisor certificate.</p>
      </div>

      {/* MOU */}
      <div className="rounded-2xl border-2 border-[#D4A017] bg-[#FDFBF5] p-8 text-[#1B1714] print:break-after-page">
        <div className="flex items-start justify-between print:hidden">
          <span />
          <PrintButton />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-plex-serif)" }}>
            MEMORANDUM OF UNDERSTANDING
          </h2>
          <p className="mt-1 text-sm text-black/55">(Non-Binding — Statement of Intent)</p>
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
          This Memorandum records mutual intent between OmniCard and <strong>{partner.firmName}</strong> to
          explore collaboration in the area of corporate expense management and digital payment solutions for
          clients of <strong>{partner.firmName}</strong>.
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          Both parties intend to work towards a definitive framework, to be documented separately, covering
          scope, terms, and responsibilities of collaboration.
        </p>
        <p className="mt-3 text-xs italic leading-relaxed text-black/60">
          This MoU is a non-binding expression of intent only. It does not create any legal obligation,
          partnership, agency, or commercial commitment between the parties. A separate definitive agreement,
          executed independently, shall govern any actual engagement.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-[13px] font-bold text-brand">For Eroute Technologies Pvt. Ltd.</p>
            <SigLine label="Name" value="OmniCard Partnerships Team" />
            <SigLine
              label="Date"
              value={partner.mouCountersignedAt ? formatDate(partner.mouCountersignedAt) : "Pending"}
            />
            <SigLine label="Designation" value="Authorized Signatory" />
            <SigLine label="Signature" value={partner.mouCountersignedAt ? "OmniCard" : "Awaiting countersignature"} script />
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
          Celebrating a shared vision for technology-led financial transformation and smarter business operations.
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
