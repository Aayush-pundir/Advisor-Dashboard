import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Invalid email or password. Try again.",
  rate_limited: "Too many failed attempts. Please wait 15 minutes and try again.",
  inactive: "This account has been deactivated. Contact your OmniCard partner manager.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <Link href="/" className="text-lg font-semibold text-brand">
          OmniCard <span className="text-foreground">Advisor</span>
        </Link>
        <p className="mt-1 text-sm text-muted">
          Sign in to your partner or internal ops account.
        </p>

        <form action={loginAction} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="you@firm.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Password</label>
              <Link href="/forgot-password" className="text-xs text-brand hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="text-sm text-rose-600">
              {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.invalid}
            </p>
          )}
          {reset && !error && (
            <p className="text-sm text-emerald-600">
              Password reset. Sign in with your new password.
            </p>
          )}
          <Button type="submit" className="mt-2 w-full">
            Sign in
          </Button>
        </form>

        <div className="mt-6 rounded-lg bg-background p-3 text-xs text-muted">
          <p className="font-medium text-foreground">Demo accounts</p>
          <p>Admin: admin@omnicard.in / omnicard123</p>
          <p>OmniCard Team: ops@omnicard.in / omnicard123</p>
          <p>CA Partner: priya.sharma@camail.in / omnicard123</p>
        </div>
      </div>
    </div>
  );
}
