import { SiteNavbar } from "@/components/site/navbar";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function ThankYouPage() {
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
          <Link href="/" className="mt-6 inline-block text-brand hover:underline">
            Back to home
          </Link>
        </Card>
      </div>
    </div>
  );
}
