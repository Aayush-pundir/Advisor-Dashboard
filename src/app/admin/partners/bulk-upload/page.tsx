"use client";

import Link from "next/link";
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

export default function AdminPartnerBulkUploadPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Bulk Add Partners (Advisors)</h1>
      <p className="mt-1 text-muted">
        Import a batch of prospective CA partners in one shot instead of
        adding them one by one. Rows land as &quot;Lead&quot; stage in{" "}
        <Link href="/admin/partners" className="text-brand hover:underline">
          Partners (CRM)
        </Link>
        , duplicates by email are skipped automatically.
      </p>

      <CsvUploader
        columns={COLUMNS}
        templateName="omnicard-partners-template.csv"
        onSubmit={bulkImportPartnersAction}
        successLabel={(created, skipped) =>
          `${created} partner(s) added${skipped > 0 ? `, ${skipped} row(s) skipped (missing fields or duplicate email)` : ""}.`
        }
      />
    </div>
  );
}
