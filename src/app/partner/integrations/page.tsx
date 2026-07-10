import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApiKeyPanel } from "@/components/partner/api-key-panel";
import { WebhookForm } from "@/components/partner/webhook-form";

export default async function PartnerIntegrationsPage() {
  const session = await getSession();
  const partner = await db.partner.findUniqueOrThrow({
    where: { id: session!.partnerId! },
    select: { apiKey: true, webhookUrl: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="mt-1 text-muted">
          Sync leads into your own CRM — generate an API key and register a
          webhook that fires the moment one of your leads closes won.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API key</CardTitle>
        </CardHeader>
        <CardContent>
          <ApiKeyPanel hasKey={!!partner.apiKey} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook URL</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">
            We&apos;ll POST a JSON payload to this URL when a lead closes won,
            signed with HMAC-SHA256 in the <code className="rounded bg-brand-light px-1 py-0.5 text-xs">X-OmniCard-Signature</code> header.
          </p>
          <WebhookForm currentUrl={partner.webhookUrl} />
          <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">
{`{
  "event": "lead.closed_won",
  "leadId": "...",
  "businessName": "...",
  "dealValue": 250000,
  "timestamp": "2026-07-10T12:00:00.000Z"
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
