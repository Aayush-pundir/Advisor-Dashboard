import { getAuthedUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOutEverywhereAction } from "@/app/actions/auth";
import { TwoFactorSetup } from "@/components/admin/two-factor-setup";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await getAuthedUser();
  const { saved } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-muted">Your account and security preferences.</p>
      </div>

      {saved && (
        <Card className="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Saved successfully.
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p>
            <span className="text-muted">Name:</span> {user!.name}
          </p>
          <p className="mt-1">
            <span className="text-muted">Email:</span> {user!.email}
          </p>
          <p className="mt-1">
            <span className="text-muted">Role:</span> {user!.role.replace("_", " ")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <TwoFactorSetup enabled={user!.twoFactorEnabled} />
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
