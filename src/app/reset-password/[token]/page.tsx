import { resetPasswordAction } from "@/app/actions/password";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  mismatch: "New password and confirmation don't match.",
  weak: "Password must be at least 8 characters with a letter and a number.",
  expired: "This reset link is invalid or has expired. Request a new one.",
};

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <Link href="/" className="text-lg font-semibold text-brand">
          OmniCard <span className="text-foreground">Advisor</span>
        </Link>
        <h1 className="mt-3 text-lg font-semibold">Choose a new password</h1>

        <form action={resetPasswordAction} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="token" value={token} />
          <div>
            <label className="text-sm font-medium">New password</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm new password</label>
            <input
              name="confirm"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>
          {error && (
            <p className="text-sm text-rose-600">{ERROR_MESSAGES[error] ?? "Something went wrong."}</p>
          )}
          {error === "expired" && (
            <Link href="/forgot-password" className="text-sm text-brand hover:underline">
              Request a new reset link
            </Link>
          )}
          <Button type="submit" className="mt-2 w-full">
            Reset password
          </Button>
        </form>
      </div>
    </div>
  );
}
