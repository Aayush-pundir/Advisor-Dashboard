import { getAuthedUser } from "@/lib/auth";
import { changePasswordAction } from "@/app/actions/password";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  current: "Your current password is incorrect.",
  mismatch: "New password and confirmation don't match.",
  weak: "Password must be at least 8 characters with a letter and a number.",
};

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <Link href="/" className="text-lg font-semibold text-brand">
          OmniCard <span className="text-foreground">Advisor</span>
        </Link>
        <h1 className="mt-3 text-lg font-semibold">
          {user.mustChangePassword ? "Set a new password" : "Change your password"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {user.mustChangePassword
            ? "For security, you need to set your own password before continuing."
            : "Enter your current password and choose a new one."}
        </p>

        <form action={changePasswordAction} className="mt-6 flex flex-col gap-4">
          {!user.mustChangePassword && (
            <div>
              <label className="text-sm font-medium">Current password</label>
              <input
                name="currentPassword"
                type="password"
                required
                className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
          )}
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
          <p className="text-xs text-muted">
            At least 8 characters, including one letter and one number. Changing your password signs
            out all other devices.
          </p>
          <Button type="submit" className="mt-2 w-full">
            Save new password
          </Button>
        </form>
      </div>
    </div>
  );
}
