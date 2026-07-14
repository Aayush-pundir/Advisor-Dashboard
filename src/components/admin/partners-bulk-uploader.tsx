"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CsvUploader } from "@/components/shared/csv-uploader";
import { bulkImportPartnersAction } from "@/app/actions/bulk";

const COLUMNS = [
  { key: "firmName", label: "Firm name", required: true },
  { key: "contactName", label: "Contact name", required: true },
  { key: "email", label: "Email", required: true },
  { key: "phone", label: "Phone", required: true },
  { key: "city", label: "City", required: true },
  { key: "state", label: "State", required: true },
  { key: "icaiNumber", label: "ICAI number" },
];

export function PartnersBulkUploader() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Bulk add partners
      </Button>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Bulk add partners</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted hover:text-foreground">
          Cancel
        </button>
      </div>
      <p className="mt-1 text-xs text-muted">
        Rows land as &quot;Lead&quot; stage below; duplicates by email are skipped automatically.
      </p>
      <div className="mt-3">
        <CsvUploader
          columns={COLUMNS}
          templateName="omnicard-partners-template.csv"
          onSubmit={bulkImportPartnersAction}
          successLabel={(created, skipped) =>
            `${created} partner(s) added${skipped > 0 ? `, ${skipped} row(s) skipped (missing fields or duplicate email)` : ""}.`
          }
        />
      </div>
    </Card>
  );
}
