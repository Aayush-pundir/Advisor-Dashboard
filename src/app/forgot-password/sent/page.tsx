import Link from "next/link";
import { Card } from "@/components/ui/card";

export default async function ForgotPasswordSentPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm text-center">
        <Link href="/" className="text-lg font-semibold text-brand">
          OmniCard <span className="text-foreground">Advisor</span>
        </Link>
        <h1 className="mt-3 text-lg font-semibold">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          If an account exists for that email, a password reset link has been sent.
        </p>

        {token && (
          <Card className="mt-6 border-dashed p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              Dev mode — no email provider configured
            </p>
            <p className="mt-1 text-xs text-muted">
              In production this link is emailed to the user. For now, here it is directly:
            </p>
            <Link
              href={`/reset-password/${token}`}
              className="mt-2 block break-all text-sm text-brand hover:underline"
            >
              /reset-password/{token}
            </Link>
          </Card>
        )}

        <Link href="/login" className="mt-6 block text-sm text-brand hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
