"use client";

import Link from "next/link";
import { CsvUploader } from "@/components/shared/csv-uploader";
import { bulkImportLeadsAction } from "@/app/actions/bulk";

const COLUMNS = [
  { key: "businessName", label: "Business name", required: true },
  { key: "contactName", label: "Contact name", required: true },
  { key: "phone", label: "Phone", required: true },
  { key: "email", label: "Email", required: true },
  { key: "city", label: "City" },
  { key: "dealValue", label: "Deal value (INR)" },
];

export default function PartnerBulkUploadPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Bulk Upload Client Leads</h1>
      <p className="mt-1 text-muted">
        Import your existing client book in one go instead of adding leads one
        by one. Uploaded rows land in your{" "}
        <Link href="/partner/leads" className="text-brand hover:underline">
          pipeline
        </Link>{" "}
        as &quot;Captured&quot; and become available to marketing (in masked
        form) for co-branded campaigns.
      </p>

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
              dealValue: r.dealValue ? Number(r.dealValue) : undefined,
            })),
          )
        }
        successLabel={(created, skipped) =>
          `${created} lead(s) imported${skipped > 0 ? `, ${skipped} row(s) skipped (missing required fields)` : ""}.`
        }
      />
    </div>
  );
}
