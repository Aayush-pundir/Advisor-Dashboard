import { SiteNavbar } from "@/components/site/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { captureLeadAction } from "@/app/actions/partner";
import { notFound } from "next/navigation";

export default async function AdvisorMicrosite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const partner = await db.partner.findUnique({ where: { slug } });
  if (!partner) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <SiteNavbar />

      <section className="border-b border-border bg-brand-light/50">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
            {partner.firmName.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="mt-4 text-3xl font-bold">
            {partner.firmName} &times; OmniCard
          </h1>
          <p className="mt-2 text-muted">
            {partner.contactName} is a Certified OmniCard Implementation
            Advisor — helping businesses in {partner.city} eliminate spend
            leakage with India&apos;s Business Fintech OS.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-14 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold">Why businesses trust this recommendation</h2>
          <p className="mt-3 text-muted">
            OmniCard is India&apos;s Business Fintech OS — corporate cards,
            expense management, and spend controls built for growing
            businesses. {partner.contactName} has completed OmniCard&apos;s
            Implementation Advisor certification and stakes their name on
            every referral.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="text-brand">✓</span> Free spend-leakage audit
              for your business
            </li>
            <li className="flex gap-2">
              <span className="text-brand">✓</span> Dedicated onboarding, no
              cost to switch
            </li>
            <li className="flex gap-2">
              <span className="text-brand">✓</span> Your CA stays in the loop
              at every step
            </li>
          </ul>
        </div>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold">Get your free spend-leakage audit</h3>
          <p className="mt-1 text-sm text-muted">
            Referred by {partner.contactName}, {partner.firmName}
          </p>
          <form action={captureLeadAction} className="mt-4 flex flex-col gap-3">
            <input type="hidden" name="partnerId" value={partner.id} />
            <input type="hidden" name="source" value="MICROSITE" />
            <input
              name="businessName"
              placeholder="Business name"
              required
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <input
              name="contactName"
              placeholder="Your name"
              required
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <input
              name="phone"
              placeholder="Phone"
              required
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <Button type="submit">Request my audit</Button>
          </form>
        </Card>
      </section>
    </div>
  );
}
