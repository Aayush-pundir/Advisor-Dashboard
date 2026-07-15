"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CsvUploader } from "@/components/shared/csv-uploader";
import { bulkImportLeadsAction } from "@/app/actions/bulk";

const COLUMNS = [
  { key: "businessName", label: "Business name", required: true },
  { key: "contactName", label: "Contact name", required: true },
  { key: "phone", label: "Phone", required: true },
  { key: "email", label: "Email", required: true },
  { key: "city", label: "City" },
];

export function LeadsBulkUploader() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Bulk upload CSV
      </Button>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Bulk upload client leads</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted hover:text-foreground">
          Cancel
        </button>
      </div>
      <div className="mt-3">
        <CsvUploader
          columns={COLUMNS}
          templateName="omnicard-client-leads-template.csv"
          onSubmit={(rows: Record<string, string>[]) =>
            bulkImportLeadsAction(
              rows.map((r) => ({
                businessName: r.businessName,
                contactName: r.contactName,
                phone: r.phone,
                email: r.email,
                city: r.city,
              })),
            )
          }
          successLabel={(created, skipped) =>
            `${created} lead(s) imported${skipped > 0 ? `, ${skipped} row(s) skipped (missing fields or already an active lead with another partner)` : ""}.`
          }
        />
      </div>
    </Card>
  );
}
