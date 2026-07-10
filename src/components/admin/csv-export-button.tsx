import { Button } from "@/components/ui/button";

export function CsvExportButton({ href, label = "Export CSV" }: { href: string; label?: string }) {
  return (
    <a href={href} download>
      <Button variant="outline" size="sm">
        {label}
      </Button>
    </a>
  );
}
