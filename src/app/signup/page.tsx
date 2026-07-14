import { SiteNavbar } from "@/components/site/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signupPartnerAction } from "@/app/actions/partner";

const ERRORS: Record<string, string> = {
  missing: "Please fill in all required fields.",
  exists: "An advisor account with this email already exists. Sign in instead.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <SiteNavbar />
      <div className="mx-auto w-full max-w-xl px-4 py-14">
        <h1 className="text-2xl font-bold">Become a Certified Advisor</h1>
        <p className="mt-2 text-muted">
          Your interest is captured instantly. A partner manager will reach
          out to schedule your demo — attend it and you&apos;re auto-certified.
        </p>

        <Card className="mt-6 p-6">
          <form action={signupPartnerAction} className="grid gap-4 sm:grid-cols-2">
            <Field label="Firm name" name="firmName" required />
            <Field label="Your name" name="contactName" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Phone" name="phone" required />
            <Field label="City" name="city" required />
            <Field label="State" name="state" required />
            <Field label="ICAI membership no. (optional)" name="icaiNumber" />
            {error && (
              <p className="sm:col-span-2 text-sm text-rose-600">
                {ERRORS[error] ?? "Something went wrong. Please try again."}
              </p>
            )}
            <Button type="submit" className="sm:col-span-2 mt-2">
              Submit interest
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-brand"
      />
    </label>
  );
}
