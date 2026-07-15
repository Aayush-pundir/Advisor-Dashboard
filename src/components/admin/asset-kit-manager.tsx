"use client";

import { useRef, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ASSET_LABELS, ASSET_STATUSES, type AssetKey, type AssetStatus } from "@/lib/enums";
import { addAssetKitItemAction, updateAssetKitItemAction } from "@/app/actions/asset-kit";

const assetStatusVariant: Record<AssetStatus, "neutral" | "warning" | "success"> = {
  PENDING: "neutral",
  IN_PROGRESS: "warning",
  DELIVERED: "success",
};

type AssetItem = {
  id: string;
  key: string;
  customLabel: string | null;
  owner: string;
  status: string;
  deliveredAt: Date | null;
};

export function AssetKitManager({
  partnerId,
  items,
  teamNames,
}: {
  partnerId: string;
  items: AssetItem[];
  teamNames: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const addFormRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-medium">
                {item.customLabel ?? ASSET_LABELS[item.key as AssetKey] ?? item.key}
              </p>
              {item.deliveredAt && <p className="text-xs text-muted">Delivered {formatDate(item.deliveredAt)}</p>}
            </div>
            <form
              action={(formData) => startTransition(() => updateAssetKitItemAction(item.id, formData))}
              className="flex items-center gap-2"
            >
              <select
                name="owner"
                defaultValue={item.owner}
                className="rounded-lg border border-border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-brand"
              >
                {teamNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                {!teamNames.includes(item.owner) && <option value={item.owner}>{item.owner}</option>}
              </select>
              <select
                name="status"
                defaultValue={item.status}
                className="rounded-lg border border-border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-brand"
              >
                {ASSET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
              <Badge variant={assetStatusVariant[item.status as AssetStatus]}>{item.status.replace("_", " ")}</Badge>
              <Button type="submit" size="sm" variant="outline" disabled={isPending}>
                Save
              </Button>
            </form>
          </div>
        ))}
        {items.length === 0 && <p className="py-6 text-center text-muted">No asset kit items yet.</p>}
      </div>

      <form
        ref={addFormRef}
        action={(formData) =>
          startTransition(() => {
            addAssetKitItemAction(partnerId, formData);
            addFormRef.current?.reset();
          })
        }
        className="flex flex-wrap items-end gap-2 border-t border-border pt-4"
      >
        <div>
          <label className="block text-xs font-medium text-muted">New asset</label>
          <input
            name="customLabel"
            placeholder="e.g. Diwali creative pack"
            className="mt-1 rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">Owner (OmniCard Team)</label>
          <select
            name="owner"
            className="mt-1 rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-brand"
          >
            {teamNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          Add asset
        </Button>
      </form>
    </div>
  );
}
