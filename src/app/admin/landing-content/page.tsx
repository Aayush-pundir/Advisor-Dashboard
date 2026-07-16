import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { canManageCampaigns } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { getLandingContent, serializeForForm } from "@/lib/landing-content";
import { updateLandingContentAction } from "@/app/actions/landing-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function LandingContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const actor = await getAuthedUser();
  if (!actor || !canManageCampaigns(actor.role as UserRole)) {
    redirect("/admin");
  }
  const { saved } = await searchParams;

  const content = await getLandingContent();
  const f = serializeForForm(content);

  async function save(formData: FormData) {
    "use server";
    await updateLandingContentAction(formData);
    redirect("/admin/landing-content?saved=1");
  }

  return (
    <form action={save} className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Co-Landing Page Content</h1>
          <p className="mt-1 text-muted">
            Every advisor&apos;s co-branded landing page shares this copy — only firm name, contact, city and logo
            differ per advisor. Changes apply to every live page immediately.
          </p>
        </div>
        <Button type="submit">Save changes</Button>
      </div>

      {saved && (
        <Card className="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">Saved — live on every advisor page.</Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Hero</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Row>
            <Field label="Heading (before highlight)" name="heroHeadingPrefix" defaultValue={content.heroHeadingPrefix} />
            <Field label="Heading highlight" name="heroHeadingHighlight" defaultValue={content.heroHeadingHighlight} />
          </Row>
          <TextArea
            label="Subtext — use {contactName}, {city}, {firmName} as placeholders"
            name="heroSubtext"
            defaultValue={content.heroSubtext}
            rows={2}
          />
          <TextArea label="Bullet list (one per line)" name="heroBullets" defaultValue={f.heroBullets} rows={3} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trusted-by logos</CardTitle>
        </CardHeader>
        <CardContent>
          <TextArea label="Company names (one per line)" name="trustLogos" defaultValue={f.trustLogos} rows={4} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CA endorsement section</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Row>
            <Field label="Heading (before highlight)" name="endorsementHeadingPrefix" defaultValue={content.endorsementHeadingPrefix} />
            <Field label="Heading highlight" name="endorsementHeadingHighlight" defaultValue={content.endorsementHeadingHighlight} />
          </Row>
          <TextArea label="Subtext" name="endorsementSubtext" defaultValue={content.endorsementSubtext} rows={2} />
          <TextArea
            label="Endorsement items — one per line: icon | title"
            name="endorsementItems"
            defaultValue={f.endorsementItems}
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Problem stats</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <TextArea label="Stat cards — one per line: big number | small label" name="problemStats" defaultValue={f.problemStats} rows={5} />
          <TextArea
            label="Accordion cards — one per line: title | body"
            name="problemAccordions"
            defaultValue={f.problemAccordions}
            rows={2}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>&quot;Built Different&quot; grid</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <TextArea label="Subtext" name="builtDifferentSubtext" defaultValue={content.builtDifferentSubtext} rows={2} />
          <TextArea
            label="Items — one per line: icon | title | description"
            name="builtDifferentItems"
            defaultValue={f.builtDifferentItems}
            rows={6}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Numbers grid</CardTitle>
        </CardHeader>
        <CardContent>
          <TextArea label="Stats — one per line: big number | small label" name="numbersGrid" defaultValue={f.numbersGrid} rows={8} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Finance OS section</CardTitle>
        </CardHeader>
        <CardContent>
          <TextArea label="Feature chips (one per line)" name="financeOsItems" defaultValue={f.financeOsItems} rows={5} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform capabilities</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Field label="Subtext" name="platformCapabilitiesSubtext" defaultValue={content.platformCapabilitiesSubtext} />
          <TextArea
            label="Capabilities — one per line: title | tag"
            name="platformCapabilities"
            defaultValue={f.platformCapabilities}
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OmniUPI section</CardTitle>
        </CardHeader>
        <CardContent>
          <TextArea label="Feature chips (one per line)" name="omniUpiItems" defaultValue={f.omniUpiItems} rows={4} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>&quot;Why Your CA Recommends&quot;</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <TextArea label="Subtext" name="whyCaSubtext" defaultValue={content.whyCaSubtext} rows={2} />
          <TextArea
            label="Items — one per line: icon | title | description"
            name="whyCaItems"
            defaultValue={f.whyCaItems}
            rows={5}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured testimonial</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Company" name="featuredCompany" defaultValue={content.featuredTestimonial.company} />
          <Field label="Headline" name="featuredTitle" defaultValue={content.featuredTestimonial.title} />
          <Field label="Stat 1" name="featuredStat1" defaultValue={content.featuredTestimonial.stat1} />
          <Field label="Stat 1 label" name="featuredLabel1" defaultValue={content.featuredTestimonial.label1} />
          <Field label="Stat 2" name="featuredStat2" defaultValue={content.featuredTestimonial.stat2} />
          <Field label="Stat 2 label" name="featuredLabel2" defaultValue={content.featuredTestimonial.label2} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Case studies</CardTitle>
        </CardHeader>
        <CardContent>
          <TextArea
            label="One per line: company | headline | stat1 | stat1 label | stat2 | stat2 label"
            name="caseStudies"
            defaultValue={f.caseStudies}
            rows={5}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <label className="text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 font-mono text-xs outline-none focus:border-brand"
      />
    </label>
  );
}
