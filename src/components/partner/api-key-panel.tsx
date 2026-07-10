"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateApiKeyAction, revokeApiKeyAction } from "@/app/actions/integrations";

export function ApiKeyPanel({ hasKey }: { hasKey: boolean }) {
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      {newKey ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
          <p className="font-medium text-amber-900">Copy this key now — it won&apos;t be shown again.</p>
          <p className="mt-1 break-all font-mono text-xs text-amber-900">{newKey}</p>
        </div>
      ) : (
        <p className="text-sm text-muted">
          {hasKey ? "An API key is active for your account (hidden after creation)." : "No API key yet."}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const res = await generateApiKeyAction();
              if (res.ok && res.apiKey) setNewKey(res.apiKey);
            })
          }
        >
          {hasKey ? "Regenerate key" : "Generate key"}
        </Button>
        {hasKey && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await revokeApiKeyAction();
                setNewKey(null);
              })
            }
          >
            Revoke
          </Button>
        )}
      </div>
    </div>
  );
}
