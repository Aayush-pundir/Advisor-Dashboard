import { forgotPasswordAction } from "@/app/actions/password";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <Link href="/" className="text-lg font-semibold text-brand">
          OmniCard <span className="text-foreground">Advisor</span>
        </Link>
        <h1 className="mt-3 text-lg font-semibold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted">
          Enter the email on your account and we&apos;ll send a reset link.
        </p>

        <form action={forgotPasswordAction} className="mt-6 flex flex-col gap-4">
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
          <Button type="submit" className="mt-2 w-full">
            Send reset link
          </Button>
        </form>

        <Link href="/login" className="mt-6 block text-center text-sm text-brand hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
