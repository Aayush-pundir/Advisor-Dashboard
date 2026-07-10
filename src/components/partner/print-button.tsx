"use client";

import { Button } from "@/components/ui/button";

export function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
      {label}
    </Button>
  );
}
