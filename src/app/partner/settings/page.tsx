import { getAuthedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { updateProfileAction, updatePayoutAction } from "@/app/actions/settings";
import { signOutEverywhereAction } from "@/app/actions/auth";

export default async function PartnerSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await getAuthedUser();
  const partner = await db.partner.findUniqueOrThrow({ where: { id: user!.partnerId! } });
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
            <Field label="ICAI membership no." name="icaiNumber" defaultValue={partner.icaiNumber ?? ""} />
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
          <CardTitle>Payout details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted">
            Where your Year-1 and trailing commissions are settled.
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
