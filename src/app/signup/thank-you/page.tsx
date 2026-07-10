import { SiteNavbar } from "@/components/site/navbar";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; temp?: string }>;
}) {
  const { temp } = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <SiteNavbar />
      <div className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <Card className="p-8">
          <p className="text-3xl">🎉</p>
          <h1 className="mt-3 text-xl font-semibold">
            You&apos;re on the list!
          </h1>
          <p className="mt-2 text-muted">
            Your interest has landed in our CRM. A partner manager will
            reach out to schedule your product demo — attend it and
            you&apos;re instantly certified with your Implementation Advisor
            badge, co-branded assets, and dashboard access.
          </p>
          {temp && (
            <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-left text-sm">
              <p className="font-semibold text-amber-900">
                Your advisor login (no email provider configured — copy this now)
              </p>
              <p className="mt-2 text-amber-900">
                Temporary password: <strong className="font-mono">{temp}</strong>
              </p>
              <p className="mt-1 text-xs text-amber-800">
                Sign in any time to track your onboarding status.
              </p>
            </div>
          )}
          <Link href="/login" className="mt-6 inline-block text-brand hover:underline">
            Sign in to track your status
          </Link>
        </Card>
      </div>
    </div>
  );
}
