import { getPendingTwoFactorUserId } from "@/lib/auth";
import { verifyLoginTwoFactorAction, cancelTwoFactorLoginAction } from "@/app/actions/twofactor";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginTwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const userId = await getPendingTwoFactorUserId();
  if (!userId) redirect("/login");

  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <Link href="/" className="text-lg font-semibold text-brand">
          OmniCard <span className="text-foreground">Advisor</span>
        </Link>
        <h1 className="mt-3 text-lg font-semibold">Enter your 2FA code</h1>
        <p className="mt-1 text-sm text-muted">
          Open your authenticator app and enter the current 6-digit code.
        </p>

        <form action={verifyLoginTwoFactorAction} className="mt-6 flex flex-col gap-4">
          <input
            name="code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-center text-lg tracking-[0.5em] outline-none focus:border-brand"
            placeholder="000000"
          />
          {error && <p className="text-sm text-rose-600">Incorrect code. Try again.</p>}
          <Button type="submit" className="w-full">
            Verify
          </Button>
        </form>

        <form action={cancelTwoFactorLoginAction} className="mt-4">
          <button className="text-sm text-muted hover:underline">Cancel and sign in again</button>
        </form>
      </div>
    </div>
  );
}
