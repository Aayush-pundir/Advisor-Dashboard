"use client";

import { CsvUploader } from "@/components/shared/csv-uploader";
import { bulkImportMarketingContactsAction } from "@/app/actions/marketing-contacts";

const COLUMNS = [
  { key: "contactName", label: "Contact name", required: true },
  { key: "phone", label: "Phone", required: true },
  { key: "email", label: "Email" },
  { key: "city", label: "City" },
];

export function MarketingContactsUploader() {
  return (
    <CsvUploader
      columns={COLUMNS}
      templateName="omnicard-marketing-contacts-template.csv"
      onSubmit={bulkImportMarketingContactsAction}
      successLabel={(created, skipped) =>
        `${created} contact(s) uploaded${skipped > 0 ? `, ${skipped} row(s) skipped (missing name or phone)` : ""}.`
      }
    />
  );
}
