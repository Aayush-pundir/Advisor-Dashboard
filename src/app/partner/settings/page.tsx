import { getAuthedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { updateProfileAction, updatePayoutAction } from "@/app/actions/settings";
import { signOutEverywhereAction } from "@/app/actions/auth";
import { ApiKeyPanel } from "@/components/partner/api-key-panel";
import { WebhookForm } from "@/components/partner/webhook-form";
import { InviteTeammateForm } from "@/components/partner/invite-teammate-form";
import { RemoveTeammateButton } from "@/components/partner/remove-teammate-button";
import { LogoUploadForm } from "@/components/partner/logo-upload-form";

export default async function PartnerSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await getAuthedUser();
  const [partner, teammates] = await Promise.all([
    db.partner.findUniqueOrThrow({ where: { id: user!.partnerId! } }),
    db.user.findMany({ where: { partnerId: user!.partnerId! }, orderBy: { createdAt: "asc" } }),
  ]);
  const { saved } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-muted">Manage your firm profile, payout details, and account security.</p>
      </div>

      {saved && (
        <Card className="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Saved successfully.
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Firm profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="grid gap-4 sm:grid-cols-2">
            <Field label="Firm name" name="firmName" defaultValue={partner.firmName} required />
            <Field label="Contact name" name="contactName" defaultValue={partner.contactName} required />
            <Field label="Phone" name="phone" defaultValue={partner.phone} required />
            <Field label="Membership No." name="icaiNumber" defaultValue={partner.icaiNumber ?? ""} />
            <Field label="City" name="city" defaultValue={partner.city} required />
            <Field label="State" name="state" defaultValue={partner.state} required />
            <div className="sm:col-span-2">
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted">
            Shown on your co-branded landing page — falls back to your firm name if not uploaded.
          </p>
          <LogoUploadForm currentLogoUrl={partner.logoUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted">
            Where your Year-1 and trailing advisory fees are settled.
          </p>
          <form action={updatePayoutAction} className="grid gap-4 sm:grid-cols-2">
            <Field label="Bank account name" name="bankAccountName" defaultValue={partner.bankAccountName ?? ""} />
            <Field label="Bank account number" name="bankAccountNumber" defaultValue={partner.bankAccountNumber ?? ""} />
            <Field label="IFSC" name="bankIfsc" defaultValue={partner.bankIfsc ?? ""} />
            <Field label="UPI ID" name="upiId" defaultValue={partner.upiId ?? ""} placeholder="firm@upi" />
            <Field label="PAN" name="pan" defaultValue={partner.pan ?? ""} />
            <Field label="GST number" name="gstNumber" defaultValue={partner.gstNumber ?? ""} />
            <div className="sm:col-span-2">
              <Button type="submit">Save payout details</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Link href="/change-password">
            <Button variant="outline">Change password</Button>
          </Link>
          <form action={signOutEverywhereAction}>
            <Button variant="outline" type="submit">
              Sign out of all devices
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {teammates.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium">
                  {t.name} {!t.active && <span className="text-xs text-muted">(deactivated)</span>}
                </p>
                <p className="text-xs text-muted">
                  {t.email} &middot; joined {formatDate(t.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={t.firmRole === "OWNER" ? "default" : "neutral"}>{t.firmRole}</Badge>
                {user!.firmRole === "OWNER" && t.id !== user!.id && t.active && (
                  <RemoveTeammateButton userId={t.id} />
                )}
              </div>
            </div>
          ))}
        </CardContent>
        {user!.firmRole === "OWNER" && (
          <CardContent className="border-t border-border pt-4">
            <p className="mb-3 text-sm font-medium">Invite a teammate</p>
            <InviteTeammateForm />
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-medium">API key</p>
            <p className="mt-1 text-xs text-muted">
              Sync leads into your own CRM — generate an API key and register a webhook that fires the moment one of your leads closes won.
            </p>
            <div className="mt-3">
              <ApiKeyPanel hasKey={!!partner.apiKey} />
            </div>
          </div>
          <div className="border-t border-border pt-6">
            <p className="text-sm font-medium">Webhook URL</p>
            <p className="mt-1 text-xs text-muted">
              We&apos;ll POST a JSON payload to this URL when a lead closes won,
              signed with HMAC-SHA256 in the <code className="rounded bg-brand-light px-1 py-0.5 text-xs">X-OmniCard-Signature</code> header.
            </p>
            <WebhookForm currentUrl={partner.webhookUrl} />
            <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">
{`{
  "event": "lead.closed_won",
  "leadId": "...",
  "businessName": "...",
  "dealValue": 250000,
  "timestamp": "2026-07-10T12:00:00.000Z"
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}
